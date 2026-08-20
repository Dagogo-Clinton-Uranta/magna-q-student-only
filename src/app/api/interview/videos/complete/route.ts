import { NextResponse } from "next/server";
import { z } from "zod";
import { feedbackForQuestion } from "@/lib/interview/feedback";
import { enqueueInterviewAnalysis } from "@/lib/interview/queue";
import { completeVideoUpload } from "@/lib/interview/storage";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/interview-practice/sessions");
  if (!access.ok) return access.response;
  const { profile } = access;
  const parsed = z
    .object({ videoId: z.string().uuid() })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid completion request." },
      { status: 400 },
    );
  const supabase = await createClient();
  const { data: video } = await supabase
    .from("interview_videos")
    .select("*")
    .eq("id", parsed.data.videoId)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!video || video.status !== "uploading")
    return NextResponse.json(
      { error: "Upload session not found." },
      { status: 404 },
    );

  try {
    let s3Url: string | null = null;
    if (video.s3_key && video.multipart_upload_id) {
      const parts = Array.isArray(video.upload_parts)
        ? (video.upload_parts as Array<{ ETag: string; PartNumber: number }>)
        : [];
      if (!parts.length)
        return NextResponse.json(
          { error: "No uploaded video chunks were found." },
          { status: 400 },
        );
      s3Url = await completeVideoUpload({
        key: video.s3_key,
        uploadId: video.multipart_upload_id,
        parts,
      });
    }

    const productionAnalysisConfigured = Boolean(
      s3Url && process.env.REDIS_URL && process.env.OPENAI_API_KEY,
    );
    let queued = false;
    if (productionAnalysisConfigured) {
      const scheduled = await supabase.rpc(
        "student_schedule_interview_analysis",
        {
          target_video_id: video.id,
        },
      );
      if (scheduled.error) throw scheduled.error;
      // The PostgreSQL outbox above remains pending if Redis is temporarily
      // unavailable; the worker recovers pending jobs when it starts.
      try {
        queued = await enqueueInterviewAnalysis(video.id);
      } catch {
        queued = true;
      }
    }
    const feedback = feedbackForQuestion(video.question_answered);
    // Ownership/status were established through the paid user's RLS-filtered
    // read. The service client is used only for this state transition because
    // students have no general UPDATE grant on interview recordings.
    const { data: updated, error } = await createServiceRoleClient()
      .from("interview_videos")
      .update(
        queued
          ? {
              status: "queued",
              s3_url: s3Url,
              multipart_upload_id: null,
            }
          : {
              status: "completed",
              s3_url: s3Url,
              multipart_upload_id: null,
              ai_feedback: feedback,
              completed_at: new Date().toISOString(),
            },
      )
      .eq("id", video.id)
      .eq("user_id", profile.id)
      .eq("status", "uploading")
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!updated) throw new Error("Upload session is no longer active.");
    return NextResponse.json({
      videoId: video.id,
      queued,
      simulated: !queued,
      feedback: queued ? null : feedback,
    });
  } catch {
    // This route alone marks finalization failures after the paid ownership
    // check above; the student session itself cannot mutate the row directly.
    await createServiceRoleClient()
      .from("interview_videos")
      .update({
        status: "failed",
        processing_error: "Upload finalization failed.",
      })
      .eq("id", video.id)
      .eq("user_id", profile.id)
      .eq("status", "uploading");
    return NextResponse.json(
      { error: "The upload could not be finalized. Please retry." },
      { status: 503 },
    );
  }
}
