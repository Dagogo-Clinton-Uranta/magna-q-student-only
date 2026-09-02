import { NextResponse } from "next/server";
import { z } from "zod";
import { getInterviewQuestion } from "@/lib/interview/questions";
import { enqueueInterviewTranscription } from "@/lib/interview/queue";
import { verifyInterviewUpload } from "@/lib/interview/storage";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/interview-practice/sessions");
  if (!access.ok) return access.response;
  const { profile } = access;
  if (
    !(await checkRateLimit("interview-complete", profile.id, request, 30, 3600))
  )
    return NextResponse.json(
      { error: "Interview submission limit reached. Please try again later." },
      { status: 429 },
    );
  const parsed = z
    .object({ videoId: z.string().uuid() })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid completion request." },
      { status: 400 },
    );
  const db = createServiceRoleClient();
  const { data: video } = await db
    .from("interview_videos")
    .select("*")
    .eq("id", parsed.data.videoId)
    .eq("user_id", profile.id)
    .eq("status", "uploading")
    .maybeSingle();
  if (!video)
    return NextResponse.json(
      { error: "Upload session not found." },
      { status: 404 },
    );

  let createdIndividualResultId: string | null = null;
  try {
    if (!video.s3_key)
      throw new Error("Interview answers require a durable R2 object.");
    const storageUrl = await verifyInterviewUpload({
      key: video.s3_key,
      expectedBytes: Number(video.byte_size),
      expectedContentType: video.mime_type,
    });
    let individualResultId = video.individual_result_id as string | null;
    if (!video.mock_session_id && !individualResultId) {
      const question = getInterviewQuestion(video.question_id);
      if (!question) throw new Error("Interview question context is missing.");
      individualResultId = crypto.randomUUID();
      const { error: resultError } = await db
        .from("interview_individual_results")
        .insert({
          id: individualResultId,
          user_id: profile.id,
          question_id: question.id,
          question_text: question.text,
          practice_area: question.practiceArea,
          question_type: question.questionType,
          specialty:
            question.specialtyRelevance.find((item) => item !== "general") ??
            "general",
          status: "awaiting_evaluation",
        });
      if (resultError) throw resultError;
      createdIndividualResultId = individualResultId;
      const { error: videoResultError } = await db
        .from("interview_videos")
        .update({ individual_result_id: individualResultId })
        .eq("id", video.id)
        .eq("user_id", profile.id)
        .eq("status", "uploading");
      if (videoResultError) throw videoResultError;
    }
    if (!video.mock_session_id && !individualResultId)
      throw new Error("Interview result context is missing.");
    const { data: answer, error: answerError } = await db
      .from("interview_processing_answers")
      .upsert(
        {
          user_id: profile.id,
          video_id: video.id,
          question_id: video.question_id,
          mock_session_id: video.mock_session_id ?? null,
          individual_result_id: individualResultId,
          mock_position: video.mock_position,
          storage_kind: "r2",
          storage_reference: video.s3_key,
          status: "UPLOADED",
        },
        { onConflict: "video_id" },
      )
      .select("id")
      .single();
    if (answerError || !answer)
      throw answerError ?? new Error("Could not persist processing state.");
    // This transaction advances mock progress and finalizes the video together,
    // preventing a retry from leaving either lifecycle one step ahead.
    const { data: updated, error } = await db.rpc(
      "complete_interview_video_submission",
      {
        target_video_id: video.id,
        target_user_id: profile.id,
        target_status: "queued",
        target_s3_url: storageUrl,
        target_feedback: null,
      },
    );
    if (error) throw error;
    if (!updated) throw new Error("Upload session is no longer active.");
    const queued = await enqueueInterviewTranscription(answer.id);
    if (queued)
      await db
        .from("interview_processing_answers")
        .update({ status: "QUEUED" })
        .eq("id", answer.id);
    return NextResponse.json({
      videoId: video.id,
      resultId: individualResultId ?? video.mock_session_id,
      resultHref: individualResultId
        ? `/interview-practice/results/practice/${individualResultId}`
        : `/interview-practice/results/mock/${video.mock_session_id}`,
      queued,
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
    if (createdIndividualResultId)
      await createServiceRoleClient()
        .from("interview_individual_results")
        .update({ status: "failed" })
        .eq("id", createdIndividualResultId)
        .eq("user_id", profile.id);
    return NextResponse.json(
      { error: "The upload could not be finalized. Please retry." },
      { status: 503 },
    );
  }
}
