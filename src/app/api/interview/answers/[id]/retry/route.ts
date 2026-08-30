import { NextResponse } from "next/server";
import {
  enqueueInterviewEvaluation,
  enqueueInterviewTranscription,
} from "@/lib/interview/queue";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = await getPaidStudentApiAccess("/interview-practice/results");
  if (!access.ok) return access.response;
  const { data: answer } = await (
    await createClient()
  )
    .from("interview_processing_answers")
    .select("id,status,storage_kind,transcript")
    .eq("id", id)
    .eq("user_id", access.profile.id)
    .maybeSingle();
  if (!answer)
    return NextResponse.json({ error: "Answer not found." }, { status: 404 });
  if (answer.status !== "FAILED")
    return NextResponse.json(
      { error: "Only failed processing can be retried." },
      { status: 409 },
    );
  if (answer.storage_kind !== "r2")
    return NextResponse.json(
      {
        error:
          "This video is not available in Cloudflare storage. Please submit the recording again from the practice screen.",
      },
      { status: 409 },
    );
  const nextStatus = answer.transcript ? "TRANSCRIBED" : "QUEUED";
  await createServiceRoleClient()
    .from("interview_processing_answers")
    .update({
      status: nextStatus,
      provider_error_code: null,
      user_error_message: null,
    })
    .eq("id", id)
    .eq("user_id", access.profile.id);
  const queued = answer.transcript
    ? await enqueueInterviewEvaluation(id)
    : await enqueueInterviewTranscription(id);
  if (!queued)
    return NextResponse.json(
      {
        error: "The processing queue is unavailable. Please try again shortly.",
      },
      { status: 503 },
    );
  return NextResponse.json({ queued: true, status: nextStatus });
}
