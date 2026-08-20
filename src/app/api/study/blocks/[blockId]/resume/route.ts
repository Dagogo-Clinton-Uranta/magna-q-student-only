import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const { blockId } = await params;
  const access = await getPaidStudentApiAccess(`/study/block/${blockId}`);
  if (!access.ok) return access.response;
  const supabase = await createClient();
  const { error } = await supabase.rpc("student_resume_block", {
    target_block_id: blockId,
  });
  if (error)
    return NextResponse.json(
      { error: "Block could not be resumed." },
      { status: 409 },
    );
  return NextResponse.json({ status: "in_progress" });
}
