import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { answerSchema } from "@/lib/validation/player";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";

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
  // The player already has the current question image. Avoid another storage
  // round trip on the latency-sensitive answer path; the client retains its URL.
  delete shaped.imagePath;
  return NextResponse.json(shaped, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
