/**
 * Long-running BullMQ worker for production interview analysis.
 *
 * Infrastructure keys are intentionally not committed. Configure REDIS_URL,
 * AWS_*, SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY in the worker runtime.
 * The web UI uses simulated feedback until those values are available.
 */
import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { INTERVIEW_ANALYSIS_QUEUE } from "../src/lib/interview/queue";
import { createInterviewS3Client } from "../src/lib/interview/storage";
import type { InterviewFeedback } from "../src/lib/interview/feedback";

const run = promisify(execFile);
const redisUrl = process.env.REDIS_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
if (!redisUrl || !supabaseUrl || !serviceKey || !openaiKey)
  throw new Error(
    "Worker infrastructure environment variables are incomplete.",
  );

const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const recoveryQueue = new Queue(INTERVIEW_ANALYSIS_QUEUE, { connection });
const { data: pendingJobs } = await supabase
  .from("interview_analysis_jobs")
  .select("video_id")
  .in("status", ["pending", "enqueued", "failed"])
  .order("updated_at")
  .limit(1_000);
for (const pending of pendingJobs ?? []) {
  await recoveryQueue.add(
    "analyze-interview-video",
    { videoId: pending.video_id },
    {
      jobId: pending.video_id,
      attempts: 5,
      backoff: { type: "exponential", delay: 5_000 },
      removeOnComplete: 500,
      removeOnFail: 2_000,
    },
  );
  await supabase
    .from("interview_analysis_jobs")
    .update({ status: "enqueued" })
    .eq("video_id", pending.video_id);
}

async function transcribe(audioPath: string) {
  const form = new FormData();
  form.set(
    "file",
    new Blob([await readFile(audioPath)], { type: "audio/mpeg" }),
    "interview-audio.mp3",
  );
  form.set("model", process.env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-transcribe");
  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: form,
    },
  );
  if (!response.ok)
    throw new Error(`Transcription failed (${response.status}).`);
  return ((await response.json()) as { text: string }).text;
}

async function analyze({
  category,
  question,
  transcript,
  framePaths,
}: {
  category: string;
  question: string;
  transcript: string;
  framePaths: string[];
}) {
  const images = await Promise.all(
    framePaths.map(async (path) => ({
      type: "input_image" as const,
      image_url: `data:image/jpeg;base64,${(await readFile(path)).toString("base64")}`,
      detail: "low" as const,
    })),
  );
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5.6-sol",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `You are evaluating a residency interview practice response.
Category: ${category}
Question: ${question}
Transcript: ${transcript}

Use the sampled frames only for presentation-level observations such as visible engagement and posture. Do not infer protected traits, health status, personality, or emotion. Evaluate answer structure, clarity, authenticity, professionalism, relevance, and use of evidence. Return only JSON matching:
{"summary":"string","strengths":["string"],"improvements":["string"],"scores":{"structure":0,"clarity":0,"authenticity":0,"professionalism":0}}`,
            },
            ...images,
          ],
        },
      ],
    }),
  });
  if (!response.ok)
    throw new Error(`OpenAI analysis failed (${response.status}).`);
  const payload = (await response.json()) as {
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };
  const text =
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .map((item) => item.text ?? "")
      .join("") ?? "";
  return JSON.parse(
    text.replace(/^```json\s*|\s*```$/g, ""),
  ) as InterviewFeedback;
}

const worker = new Worker<{ videoId: string }>(
  INTERVIEW_ANALYSIS_QUEUE,
  async (job) => {
    const { data: video, error } = await supabase
      .from("interview_videos")
      .select("*")
      .eq("id", job.data.videoId)
      .single();
    if (error || !video?.s3_key)
      throw error ?? new Error("Video record not found.");
    await supabase
      .from("interview_analysis_jobs")
      .update({ status: "processing", attempts: job.attemptsMade + 1 })
      .eq("video_id", video.id);
    await supabase
      .from("interview_videos")
      .update({ status: "analyzing", processing_error: null })
      .eq("id", video.id);
    const storage = createInterviewS3Client();
    if (!storage) throw new Error("S3 is not configured in the worker.");
    const directory = await mkdtemp(join(tmpdir(), `medinexus-${video.id}-`));
    try {
      const object = await storage.client.send(
        new GetObjectCommand({
          Bucket: storage.config.bucket,
          Key: video.s3_key,
        }),
      );
      if (!object.Body) throw new Error("S3 object body was empty.");
      const videoPath = join(directory, "answer.webm");
      const audioPath = join(directory, "answer.mp3");
      await writeFile(
        videoPath,
        Buffer.from(await object.Body.transformToByteArray()),
      );
      // FFmpeg must be installed in the worker image. Five low-resolution
      // frames are sampled to constrain latency and vision token usage.
      await run("ffmpeg", [
        "-y",
        "-i",
        videoPath,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-b:a",
        "64k",
        audioPath,
      ]);
      await run("ffmpeg", [
        "-y",
        "-i",
        videoPath,
        "-vf",
        "fps=1/24,scale=640:360",
        "-frames:v",
        "5",
        join(directory, "frame-%02d.jpg"),
      ]);
      const framePaths = (await readdir(directory))
        .filter((name) => name.startsWith("frame-"))
        .sort()
        .map((name) => join(directory, name));
      const transcript = await transcribe(audioPath);
      const feedback = await analyze({
        category: video.category,
        question: video.question_answered,
        transcript,
        framePaths,
      });
      await supabase
        .from("interview_videos")
        .update({
          status: "completed",
          ai_feedback: feedback,
          completed_at: new Date().toISOString(),
          processing_error: null,
        })
        .eq("id", video.id);
      await supabase
        .from("interview_analysis_jobs")
        .update({ status: "completed", last_error: null })
        .eq("video_id", video.id);
      return { completed: true };
    } catch (processingError) {
      await supabase
        .from("interview_videos")
        .update({
          status: "failed",
          processing_error:
            processingError instanceof Error
              ? processingError.message.slice(0, 1000)
              : "Unknown processing failure",
        })
        .eq("id", video.id);
      await supabase
        .from("interview_analysis_jobs")
        .update({
          status: "failed",
          last_error:
            processingError instanceof Error
              ? processingError.message.slice(0, 1_000)
              : "Unknown processing failure",
        })
        .eq("video_id", video.id);
      throw processingError;
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
  {
    connection,
    concurrency: Number(process.env.INTERVIEW_WORKER_CONCURRENCY ?? 3),
  },
);

worker.on("failed", (job, error) => {
  console.error("Interview analysis failed", job?.id, error.message);
});
console.log("Interview analysis worker is ready.");
