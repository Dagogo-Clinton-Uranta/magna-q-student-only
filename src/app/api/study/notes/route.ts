import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { noteSchema } from "@/lib/validation/player";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
export async function POST(request: Request) {
  const access = await getPaidStudentApiAccess("/create-test");
  if (!access.ok) return access.response;
  const parsed = noteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid note." }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.rpc("student_save_note", {
    target_question_id: parsed.data.questionId,
    note_content: parsed.data.note,
  });
  if (error)
    return NextResponse.json(
      { error: "Note could not be saved." },
      { status: 400 },
    );
  return NextResponse.json({ saved: true });
}
