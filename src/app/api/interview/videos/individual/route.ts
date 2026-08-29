import { NextResponse } from "next/server";
import { z } from "zod";
import { getInterviewQuestion, getInterviewPracticeArea } from "@/lib/interview/questions";
import { specialtyTermsFor, transcribeInterviewFile } from "@/lib/interview/deepgram";
import { evaluateAndPersistAnswer, markAnswerFailed, persistTranscript } from "@/lib/interview/processing";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 300;

const metadataSchema = z.object({
  questionId: z.string().min(1).max(160),
  durationSeconds: z.coerce.number().int().min(1).max(125),
  width: z.coerce.number().int().min(160).max(1920),
  height: z.coerce.number().int().min(90).max(1080),
});

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/interview-practice/sessions");
  if (!access.ok) return access.response;
  if (!(await checkRateLimit("interview-individual-analysis", access.profile.id, request, 10, 3600)))
    return NextResponse.json({ error: "Interview analysis limit reached. Please try again later." }, { status: 429 });
  const maxBytes = positiveInt(process.env.INTERVIEW_VIDEO_MAX_BYTES, 50 * 1024 * 1024);
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes + 128 * 1024)
    return NextResponse.json({ error: "Interview video exceeds the configured upload limit." }, { status: 413 });
  const form = await request.formData().catch(() => null);
  const parsed = metadataSchema.safeParse(form ? Object.fromEntries(form.entries()) : null);
  const video = form?.get("video");
  const allowedTypes = new Set(["video/webm", "video/mp4", "video/quicktime"]);
  const mediaType = video instanceof File ? (video.type.split(";", 1)[0] ?? "") : "";
  if (!parsed.success || !(video instanceof File) || !allowedTypes.has(mediaType) || video.size < 1 || video.size > maxBytes)
    return NextResponse.json({ error: "Provide a valid interview video within the configured upload limit." }, { status: 400 });
  const question = getInterviewQuestion(parsed.data.questionId);
  if (!question) return NextResponse.json({ error: "Interview question not found." }, { status: 400 });
  if (!process.env.DEEPGRAM_API_KEY || !process.env.OPENAI_API_KEY)
    return NextResponse.json({ error: "Interview analysis is not configured." }, { status: 503 });
  const db = createServiceRoleClient();
  const resultId = crypto.randomUUID();
  const videoId = crypto.randomUUID();
  const answerId = crypto.randomUUID();
  try {
    const { error: resultError } = await db.from("interview_individual_results").insert({
      id: resultId, user_id: access.profile.id, question_id: question.id,
      question_text: question.text, practice_area: question.practiceArea,
      question_type: question.questionType, specialty: question.specialtyRelevance.find((item) => item !== "general") ?? "general",
      status: "awaiting_evaluation",
    });
    if (resultError) throw resultError;
    const { error: videoError } = await db.from("interview_videos").insert({
      id: videoId, user_id: access.profile.id,
      category: getInterviewPracticeArea(question.practiceArea)?.title ?? question.practiceArea,
      question_answered: question.text, status: "analyzing", mime_type: video.type,
      duration_seconds: parsed.data.durationSeconds, width: parsed.data.width,
      height: parsed.data.height, byte_size: video.size, question_id: question.id,
      individual_result_id: resultId,
      recording_metadata: { storage: "ephemeral-request-memory", persistedVideo: false },
    });
    if (videoError) throw videoError;
    const { error: answerError } = await db.from("interview_processing_answers").insert({
      id: answerId, user_id: access.profile.id, video_id: videoId, question_id: question.id,
      individual_result_id: resultId, storage_kind: "ephemeral", status: "TRANSCRIBING",
    });
    if (answerError) throw answerError;
    const specialty = question.specialtyRelevance.find((item) => item !== "general");
    const transcript = await transcribeInterviewFile(Buffer.from(await video.arrayBuffer()), video.type, specialtyTermsFor(specialty));
    await persistTranscript(db, answerId, transcript);
    await evaluateAndPersistAnswer(db, answerId);
    await db.from("interview_videos").update({ status: "completed", completed_at: new Date().toISOString(), processing_error: null }).eq("id", videoId);
    return NextResponse.json({ resultId, href: `/interview-practice/results/practice/${resultId}` });
  } catch (error) {
    await markAnswerFailed(db, answerId, error);
    await db.from("interview_videos").update({ status: "failed", processing_error: "Analysis failed. Please retry with the recording still on your device." }).eq("id", videoId);
    await db.from("interview_individual_results").update({ status: "failed" }).eq("id", resultId);
    return NextResponse.json({ error: "We could not analyse this answer. Your recording was not retained; please retry from this device." }, { status: 503 });
  }
}

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
