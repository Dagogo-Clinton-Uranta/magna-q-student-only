"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePaidStudent } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
export async function reportQuestionError(formData: FormData) {
  const { profile } = await requirePaidStudent("/create-test");
  const parsed = z
    .object({
      questionId: z.string().uuid(),
      type: z.enum(["medical", "typographical", "technical", "other"]),
      text: z.string().trim().min(5).max(4000),
      path: z.string().startsWith("/study/"),
    })
    .safeParse({
      questionId: formData.get("questionId"),
      type: formData.get("type"),
      text: formData.get("text"),
      path: formData.get("path"),
    });
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.from("error_reports").insert({
    question_id: parsed.data.questionId,
    user_id: profile.id,
    report_type: parsed.data.type,
    report_text: parsed.data.text,
  });
  revalidatePath(parsed.data.path);
}
export async function saveReviewNote(formData: FormData) {
  await requirePaidStudent("/create-test");
  const parsed = z
    .object({
      questionId: z.string().uuid(),
      note: z.string().max(10000),
      path: z.string().startsWith("/study/"),
    })
    .safeParse({
      questionId: formData.get("questionId"),
      note: formData.get("note") ?? "",
      path: formData.get("path"),
    });
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.rpc("student_save_note", {
    target_question_id: parsed.data.questionId,
    note_content: parsed.data.note,
  });
  revalidatePath(parsed.data.path);
}
