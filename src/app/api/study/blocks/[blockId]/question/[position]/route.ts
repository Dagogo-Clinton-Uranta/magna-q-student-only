import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ blockId: string; position: string }> },
) {
  const { blockId, position } = await params;
  const access = await getPaidStudentApiAccess(`/study/block/${blockId}`);
  if (!access.ok) return access.response;
  const { profile } = access;
  if (!(await checkRateLimit("question-serving", profile.id, request, 180, 60)))
    return NextResponse.json(
      { error: "Too many question requests. Please slow down." },
      { status: 429 },
    );
  const numeric = Number(position);
  if (!Number.isInteger(numeric) || numeric < 1)
    return NextResponse.json({ error: "Invalid position." }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("student_get_block_question", {
    target_block_id: blockId,
    target_position: numeric,
  });
  if (error || !data)
    return NextResponse.json(
      { error: "Question unavailable." },
      { status: 404 },
    );
  const shaped = data as Record<string, unknown>;
  if (typeof shaped.imagePath === "string" && shaped.imagePath) {
    // Only the paid, ownership-checking RPC can reveal this exact object path.
    // The service client is limited here to issuing a five-minute signed URL,
    // avoiding any broad student Storage policy for unpublished assets.
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
