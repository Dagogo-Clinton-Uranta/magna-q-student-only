/** Long-running BullMQ workers. Run separately from the Next.js web process. */
import IORedis from "ioredis";
import type { Job } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import {
  specialtyTermsFor,
  transcribeInterviewUrl,
} from "../src/lib/interview/deepgram";
import {
  evaluateAndPersistAnswer,
  finalizeMockResult,
  markAnswerFailed,
  persistTranscript,
} from "../src/lib/interview/processing";
import {
  enqueueInterviewEvaluation,
  enqueueInterviewTranscription,
  enqueueMockFinalization,
  INTERVIEW_EVALUATION_QUEUE,
  INTERVIEW_TRANSCRIPTION_QUEUE,
  MOCK_FINALIZATION_QUEUE,
} from "../src/lib/interview/queue";
import { getInterviewVideoUrl } from "../src/lib/interview/storage";

// Use BullMQ's CommonJS Redis worker directly. The package root eagerly
// exports optional Valkey/Postgres adapters that this worker does not use.
const { Worker } = require("bullmq/dist/cjs/classes/worker") as {
  Worker: (typeof import("bullmq"))["Worker"];
};

const redisUrl = process.env.REDIS_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!redisUrl || !supabaseUrl || !serviceKey)
  throw new Error(
    "REDIS_URL, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
  );
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
const db = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

void recoverDurableJobs().catch((error) => {
  console.error("Interview job recovery failed", error);
});

new Worker(
  INTERVIEW_TRANSCRIPTION_QUEUE,
  async (job: Job<{ id: string }>) => {
    const answerId = job.data.id;
    try {
      const { data: answer } = await db
        .from("interview_processing_answers")
        .select("*")
        .eq("id", answerId)
        .single();
      if (!answer) throw new Error("ANSWER_NOT_FOUND");
      if (["EVALUATED", "COMPLETED"].includes(answer.status)) return;
      if (["TRANSCRIBED", "EVALUATING"].includes(answer.status)) {
        await enqueueInterviewEvaluation(answerId);
        return;
      }
      const key = answer.storage_reference;
      if (answer.storage_kind !== "r2" || !key)
        throw new Error("DURABLE_R2_VIDEO_REQUIRED");
      await db
        .from("interview_processing_answers")
        .update({ status: "TRANSCRIBING", attempt_count: job.attemptsMade + 1 })
        .eq("id", answerId);
      const url = await getInterviewVideoUrl(key);
      if (!url) throw new Error("VIDEO_URL_UNAVAILABLE");
      const { data: interviewContext } = answer.mock_session_id
        ? await db
            .from("interview_mock_sessions")
            .select("specialty")
            .eq("id", answer.mock_session_id)
            .single()
        : await db
            .from("interview_individual_results")
            .select("specialty")
            .eq("id", answer.individual_result_id)
            .single();
      await persistTranscript(
        db,
        answerId,
        await transcribeInterviewUrl(
          url,
          specialtyTermsFor(interviewContext?.specialty),
        ),
      );
      await enqueueInterviewEvaluation(answerId);
      console.info(
        JSON.stringify({
          event: "interview_transcribed",
          jobId: job.id,
          answerId,
        }),
      );
    } catch (error) {
      if (job.attemptsMade + 1 >= Number(job.opts.attempts ?? 1))
        await markAnswerFailed(db, answerId, error);
      throw error;
    }
  },
  { connection, concurrency: envInt("INTERVIEW_TRANSCRIPTION_CONCURRENCY", 3) },
);

new Worker(
  INTERVIEW_EVALUATION_QUEUE,
  async (job: Job<{ id: string }>) => {
    try {
      const answer = (await evaluateAndPersistAnswer(db, job.data.id)) as {
        mock_session_id?: string;
      };
      if (answer.mock_session_id) {
        const { count } = await db
          .from("interview_processing_answers")
          .select("id", { count: "exact", head: true })
          .eq("mock_session_id", answer.mock_session_id)
          .eq("status", "EVALUATED");
        if (count === 8) await enqueueMockFinalization(answer.mock_session_id);
      }
      console.info(
        JSON.stringify({
          event: "interview_evaluated",
          jobId: job.id,
          answerId: job.data.id,
        }),
      );
    } catch (error) {
      if (job.attemptsMade + 1 >= Number(job.opts.attempts ?? 1))
        await markAnswerFailed(db, job.data.id, error);
      throw error;
    }
  },
  { connection, concurrency: envInt("INTERVIEW_EVALUATION_CONCURRENCY", 2) },
);

new Worker(
  MOCK_FINALIZATION_QUEUE,
  async (job: Job<{ id: string }>) => {
    try {
      await finalizeMockResult(db, job.data.id);
      console.info(
        JSON.stringify({
          event: "mock_finalized",
          jobId: job.id,
          sessionId: job.data.id,
        }),
      );
    } catch (error) {
      await db
        .from("interview_processing_answers")
        .update({ status: "EVALUATED" })
        .eq("mock_session_id", job.data.id)
        .eq("status", "FINALIZING");
      throw error;
    }
  },
  { connection, concurrency: envInt("INTERVIEW_FINALIZATION_CONCURRENCY", 1) },
);

function envInt(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

async function recoverDurableJobs() {
  const { data: transcription } = await db
    .from("interview_processing_answers")
    .select("id")
    .eq("storage_kind", "r2")
    .in("status", ["UPLOADED", "QUEUED", "TRANSCRIBING"]);
  for (const answer of transcription ?? [])
    await enqueueInterviewTranscription(answer.id);
  const { data: evaluation } = await db
    .from("interview_processing_answers")
    .select("id")
    .in("status", ["TRANSCRIBED", "EVALUATING"]);
  for (const answer of evaluation ?? [])
    await enqueueInterviewEvaluation(answer.id);
  const { data: mocks } = await db
    .from("interview_mock_sessions")
    .select("id")
    .eq("status", "awaiting_evaluation");
  for (const mock of mocks ?? []) {
    const { count } = await db
      .from("interview_processing_answers")
      .select("id", { count: "exact", head: true })
      .eq("mock_session_id", mock.id)
      .eq("status", "EVALUATED");
    if (count === 8) await enqueueMockFinalization(mock.id);
  }
}

console.info(
  "Interview transcription, evaluation, and mock-finalization workers are ready.",
);
