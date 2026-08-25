import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { blockFiltersSchema } from "@/lib/validation/study";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { getStageDefinition } from "@/lib/stages";

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/create-test");
  if (!access.ok) return access.response;
  const { profile } = access;
  if (!(await checkRateLimit("eligible-count", profile.id, request, 120, 60)))
    return NextResponse.json(
      { error: "Too many requests. Wait briefly and retry." },
      { status: 429 },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = blockFiltersSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Choose an exam and at least one valid subject." },
      { status: 400 },
    );
  const supabase = await createClient();
  const expectedExamCode = getStageDefinition(profile.studyStage).examCode;
  if (!expectedExamCode)
    return NextResponse.json(
      { error: "Practice tests are not available at your current stage." },
      { status: 403 },
    );
  const { data: allowedExam } = await supabase
    .from("exams")
    .select("id")
    .eq("id", parsed.data.examId)
    .eq("code", expectedExamCode)
    .maybeSingle();
  if (!allowedExam)
    return NextResponse.json(
      { error: "This exam does not match your current stage." },
      { status: 403 },
    );
  const { data, error } = await supabase.rpc(
    "student_eligible_question_count_v2",
    {
      selected_exam_id: parsed.data.examId,
      usage_modes: parsed.data.usages,
      selected_subject_ids: parsed.data.subjectIds,
      selected_category_ids: parsed.data.categoryIds,
    },
  );
  if (error)
    return NextResponse.json(
      { error: "Eligible questions could not be counted." },
      { status: 400 },
    );
  return NextResponse.json(
    { count: Number(data) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
