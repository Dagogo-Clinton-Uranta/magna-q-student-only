"use server";

import { redirect } from "next/navigation";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { studentFeedbackSchema } from "@/lib/validation/feedback";

export async function submitFeedback(formData: FormData) {
  await requireOnboardedProfile();
  const parsed = studentFeedbackSchema.safeParse({
    subject: formData.get("subject"),
    feedback: formData.get("feedback"),
  });

  if (!parsed.success) {
    redirect(
      `/feedback?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Review your feedback and try again.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_student_feedback", {
    p_subject: parsed.data.subject,
    p_feedback_text: parsed.data.feedback,
  });

  if (error) {
    redirect(
      `/feedback?error=${encodeURIComponent("We could not save your feedback. Please try again.")}`,
    );
  }

  redirect("/feedback?submitted=1");
}
