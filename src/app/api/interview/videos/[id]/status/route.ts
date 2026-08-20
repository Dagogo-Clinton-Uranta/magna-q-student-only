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
  return NextResponse.json({
    status: data.status,
    feedback: data.ai_feedback,
    error: data.processing_error,
  });
}
