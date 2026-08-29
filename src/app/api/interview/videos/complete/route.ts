import { NextResponse } from "next/server";
import { z } from "zod";
import { enqueueInterviewTranscription } from "@/lib/interview/queue";
import { completeVideoUpload } from "@/lib/interview/storage";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/interview-practice/sessions");
  if (!access.ok) return access.response;
  const { profile } = access;
  if (!(await checkRateLimit("interview-mock-complete", profile.id, request, 24, 3600)))
    return NextResponse.json({ error: "Mock submission limit reached. Please try again later." }, { status: 429 });
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

    if (!s3Url || !video.mock_session_id || video.mock_position === null)
      throw new Error("Mock answers require a durable object before processing.");
    const db = createServiceRoleClient();
    const { data: answer, error: answerError } = await db
      .from("interview_processing_answers")
      .upsert(
        {
          user_id: profile.id,
          video_id: video.id,
          question_id: video.question_id,
          mock_session_id: video.mock_session_id,
          mock_position: video.mock_position,
          storage_kind: "s3",
          storage_reference: video.s3_key,
          status: "UPLOADED",
        },
        { onConflict: "video_id" },
      )
      .select("id")
      .single();
    if (answerError || !answer) throw answerError ?? new Error("Could not persist processing state.");
    // This transaction advances mock progress and finalizes the video together,
    // preventing a retry from leaving either lifecycle one step ahead.
    const { data: updated, error } = await db.rpc(
      "complete_interview_video_submission",
      {
        target_video_id: video.id,
        target_user_id: profile.id,
        target_status: "queued",
        target_s3_url: s3Url,
        target_feedback: null,
      },
    );
    if (error) throw error;
    if (!updated) throw new Error("Upload session is no longer active.");
    const queued = await enqueueInterviewTranscription(answer.id);
    if (queued)
      await db.from("interview_processing_answers").update({ status: "QUEUED" }).eq("id", answer.id);
    return NextResponse.json({
      videoId: video.id,
      queued: true,
      simulated: false,
      feedback: null,
      processingStatus: queued ? "QUEUED" : "UPLOADED",
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
