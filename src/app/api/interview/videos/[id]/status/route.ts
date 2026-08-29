import { NextResponse } from "next/server";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = await getPaidStudentApiAccess("/interview-practice/sessions");
  if (!access.ok) return access.response;
  const { profile } = access;
  const supabase = await createClient();
  const { data } = await supabase
    .from("interview_videos")
    .select("status,ai_feedback,processing_error")
    .eq("id", id)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (!data)
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  const { data: processing } = await supabase
    .from("interview_processing_answers")
    .select("id,status,user_error_message,individual_result_id,mock_session_id,delivery_metrics")
    .eq("video_id", id)
    .eq("user_id", profile.id)
    .maybeSingle();
  return NextResponse.json({
    status: data.status,
    processingStatus: processing?.status ?? null,
    feedback: data.ai_feedback,
    error: processing?.user_error_message ?? data.processing_error,
    resultId: processing?.individual_result_id ?? processing?.mock_session_id ?? null,
    deliveryMetrics: processing?.delivery_metrics ?? null,
  });
}
