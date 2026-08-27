"use server";

import { redirect } from "next/navigation";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { studentFeedbackSchema } from "@/lib/validation/feedback";
import { feedbackPageTestimonialSchema } from "@/lib/validation/auth";

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

export async function submitFeedbackTestimonial(formData: FormData) {
  await requireOnboardedProfile();
  const parsed = feedbackPageTestimonialSchema.safeParse({
    comment: formData.get("comment"),
    rating: formData.get("rating"),
    foundUseful: formData.get("foundUseful"),
    wouldRecommend: formData.get("wouldRecommend"),
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      error:
        parsed.error.issues[0]?.message ??
        "Review your testimonial and try again.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_feedback_testimonial", {
    p_comment: parsed.data.comment,
    p_rating: parsed.data.rating,
    p_found_useful: answerToBoolean(parsed.data.foundUseful),
    p_would_recommend: answerToBoolean(parsed.data.wouldRecommend),
  });

  if (error) {
    return {
      ok: false as const,
      error: "We could not save your review. Please try again.",
    };
  }

  return { ok: true as const };
}

function answerToBoolean(value: "yes" | "no" | "unsure") {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}
