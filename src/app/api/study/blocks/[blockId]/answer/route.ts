import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { answerSchema } from "@/lib/validation/player";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const { blockId } = await params;
  const access = await getPaidStudentApiAccess(`/study/block/${blockId}`);
  if (!access.ok) return access.response;
  const { profile } = access;
  if (!(await checkRateLimit("answer", profile.id, request, 120, 60)))
    return NextResponse.json(
      { error: "Answer rate limit reached. Wait briefly and retry." },
      { status: 429 },
    );
  const parsed = answerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid answer." }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("student_submit_answer", {
    target_block_id: blockId,
    target_position: parsed.data.position,
    chosen_option_id: parsed.data.selectedOptionId,
    submission_id: parsed.data.submissionKey,
    reported_time_ms: parsed.data.timeSpentMs,
  });
  if (error)
    return NextResponse.json(
      {
        error: error.message.includes("already answered")
          ? "This question was already answered."
          : "Answer could not be saved.",
      },
      { status: 409 },
    );
  const shaped = data as Record<string, unknown>;
  if (typeof shaped.imagePath === "string" && shaped.imagePath) {
    // The paid, ownership-checking answer RPC authorized this exact image path.
    // Mint only its short-lived URL server-side so other bucket objects remain
    // inaccessible to the student's Supabase session.
    const { data: signed } = await createServiceRoleClient()
      .storage.from("question-images")
      .createSignedUrl(shaped.imagePath, 300);
    shaped.imageUrl = signed?.signedUrl ?? null;
  }
  delete shaped.imagePath;
  return NextResponse.json(shaped, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
