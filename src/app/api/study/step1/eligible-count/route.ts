import { NextResponse } from "next/server";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStageDefinition } from "@/lib/stages";
import { createClient } from "@/lib/supabase/server";
import { step1BlockFiltersSchema } from "@/lib/validation/study";

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/create-test");
  if (!access.ok) return access.response;
  const { profile } = access;
  if (
    !(await checkRateLimit(
      "step1-eligible-count",
      profile.id,
      request,
      120,
      60,
    ))
  )
    return NextResponse.json(
      { error: "Too many requests. Wait briefly and retry." },
      { status: 429 },
    );

  const parsed = step1BlockFiltersSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Choose at least one valid Step 1 system." },
      { status: 400 },
    );
  if (getStageDefinition(profile.studyStage).examCode !== "step1")
    return NextResponse.json(
      { error: "Switch your profile level to USMLE Step 1 first." },
      { status: 403 },
    );

  const supabase = await createClient();
  const { data: allowedExam } = await supabase
    .from("exams")
    .select("id")
    .eq("id", parsed.data.examId)
    .eq("code", "step1")
    .maybeSingle();
  if (!allowedExam)
    return NextResponse.json(
      { error: "This is not the active Step 1 exam." },
      { status: 403 },
    );

  const { data, error } = await supabase.rpc(
    "student_step1_eligible_question_count",
    {
      selected_exam_id: parsed.data.examId,
      usage_modes: parsed.data.usages,
      selected_system_ids: parsed.data.systemIds,
      selected_discipline_ids: parsed.data.disciplineIds,
      selected_competency_ids: parsed.data.competencyIds,
      selected_topics: parsed.data.topics,
      selected_difficulties: parsed.data.difficulties,
    },
  );
  if (error)
    return NextResponse.json(
      { error: "Eligible Step 1 questions could not be counted." },
      { status: 400 },
    );
  return NextResponse.json(
    { count: Number(data) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
