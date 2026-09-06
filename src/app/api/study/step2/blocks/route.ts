import { NextResponse } from "next/server";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStageDefinition } from "@/lib/stages";
import { createClient } from "@/lib/supabase/server";
import { createStep2BlockSchema } from "@/lib/validation/study";

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/create-test");
  if (!access.ok) return access.response;
  const { profile } = access;
  if (
    !(await checkRateLimit("create-step2-block", profile.id, request, 10, 60))
  )
    return NextResponse.json(
      { error: "Too many block requests. Wait and retry." },
      { status: 429 },
    );

  const parsed = createStep2BlockSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Step 2 CK block settings are invalid." },
      { status: 400 },
    );
  if (getStageDefinition(profile.studyStage).examCode !== "step2ck")
    return NextResponse.json(
      { error: "Switch your profile level to USMLE Step 2 CK first." },
      { status: 403 },
    );

  const supabase = await createClient();
  const { data: allowedExam } = await supabase
    .from("exams")
    .select("id")
    .eq("id", parsed.data.examId)
    .eq("code", "step2ck")
    .maybeSingle();
  if (!allowedExam)
    return NextResponse.json(
      { error: "This is not the active Step 2 CK exam." },
      { status: 403 },
    );

  const { data, error } = await supabase.rpc("student_create_step2_block", {
    selected_exam_id: parsed.data.examId,
    selected_mode: parsed.data.mode,
    usage_modes: parsed.data.usages,
    selected_system_ids: parsed.data.systemIds,
    selected_clinical_science_ids: parsed.data.clinicalScienceIds,
    selected_competency_ids: parsed.data.competencyIds,
    selected_topics: parsed.data.topics,
    selected_difficulties: parsed.data.difficulties,
    nutrition_filter: parsed.data.nutritionFilter,
    requested_count: parsed.data.requestedCount,
  });
  if (error || !data)
    return NextResponse.json(
      {
        error:
          "The Step 2 CK block could not be generated. Refresh the eligible count and retry.",
      },
      { status: 409 },
    );

  return NextResponse.json(
    { blockId: String(data) },
    { status: 201, headers: { "Cache-Control": "private, no-store" } },
  );
}
