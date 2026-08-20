import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markSchema } from "@/lib/validation/player";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const { blockId } = await params;
  const access = await getPaidStudentApiAccess(`/study/block/${blockId}`);
  if (!access.ok) return access.response;
  const parsed = markSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid mark." }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.rpc("student_set_mark", {
    target_block_id: blockId,
    target_position: parsed.data.position,
    should_mark: parsed.data.marked,
  });
  if (error)
    return NextResponse.json(
      { error: "Mark could not be saved." },
      { status: 400 },
    );
  return NextResponse.json({ marked: parsed.data.marked });
}
