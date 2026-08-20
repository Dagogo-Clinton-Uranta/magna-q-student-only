import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBlockSchema } from "@/lib/validation/study";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";

export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/create-test");
  if (!access.ok) return access.response;
  const { profile } = access;
  if (!(await checkRateLimit("create-block", profile.id, request, 10, 60)))
    return NextResponse.json(
      { error: "Too many block requests. Wait and retry." },
      { status: 429 },
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = createBlockSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Block settings are invalid." },
      { status: 400 },
    );
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("student_create_block_v2", {
    selected_exam_id: parsed.data.examId,
    selected_mode: parsed.data.mode,
    usage_modes: parsed.data.usages,
    selected_subject_ids: parsed.data.subjectIds,
    selected_category_ids: parsed.data.categoryIds,
    requested_count: parsed.data.requestedCount,
  });
  if (error || !data)
    return NextResponse.json(
      {
        error:
          "The block could not be generated. Refresh the eligible count and retry.",
      },
      { status: 409 },
    );
  return NextResponse.json(
    { blockId: String(data) },
    { status: 201, headers: { "Cache-Control": "private, no-store" } },
  );
}
