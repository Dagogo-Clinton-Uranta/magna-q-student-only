import { NextResponse } from "next/server";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStageDefinition } from "@/lib/stages";
import { createClient } from "@/lib/supabase/server";
import { createStep1BlockSchema } from "@/lib/validation/study";

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/create-test");
  if (!access.ok) return access.response;
  const { profile } = access;
  if (
    !(await checkRateLimit("create-step1-block", profile.id, request, 10, 60))
  )
    return NextResponse.json(
      { error: "Too many block requests. Wait and retry." },
      { status: 429 },
    );

  const parsed = createStep1BlockSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Step 1 block settings are invalid." },
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

  const { data, error } = await supabase.rpc("student_create_step1_block", {
    selected_exam_id: parsed.data.examId,
    selected_mode: parsed.data.mode,
    usage_modes: parsed.data.usages,
    selected_system_ids: parsed.data.systemIds,
    selected_discipline_ids: parsed.data.disciplineIds,
    selected_competency_ids: parsed.data.competencyIds,
    selected_topics: parsed.data.topics,
    selected_difficulties: parsed.data.difficulties,
    requested_count: parsed.data.requestedCount,
  });
  if (error || !data)
    return NextResponse.json(
      {
        error:
          "The Step 1 block could not be generated. Refresh the eligible count and retry.",
      },
      { status: 409 },
    );
  return NextResponse.json(
    { blockId: String(data) },
    { status: 201, headers: { "Cache-Control": "private, no-store" } },
  );
}
