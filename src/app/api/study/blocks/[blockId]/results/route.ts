import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const { blockId } = await params;
  const access = await getPaidStudentApiAccess(
    `/study/block/${blockId}/results`,
  );
  if (!access.ok) return access.response;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("student_block_results", {
    target_block_id: blockId,
  });
  if (error || !data)
    return NextResponse.json(
      { error: "Completed results not found." },
      { status: 404 },
    );
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
