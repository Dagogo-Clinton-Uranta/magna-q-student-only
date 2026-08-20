"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation/auth";

export async function completeOnboarding(formData: FormData) {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    username: formData.get("username"),
    countryCode: formData.get("countryCode"),
    phoneCountryCode: formData.get("phoneCountryCode"),
    phoneNumber: formData.get("phoneNumber"),
    medicalSchool: formData.get("medicalSchool") || undefined,
    trainingLevel: formData.get("trainingLevel") || undefined,
    studyStage: formData.get("studyStage"),
    acceptedTerms: formData.get("acceptedTerms"),
  });
  if (!parsed.success)
    redirect(
      "/onboarding?error=Review+the+highlighted+details+and+accept+the+terms.",
    );
  const supabase = await createClient();
  const { data: usernameAvailable, error: usernameError } = await supabase.rpc(
    "username_available",
    { candidate: parsed.data.username },
  );
  if (usernameError || usernameAvailable !== true)
    redirect(
      "/onboarding?error=That+username+is+unavailable.+Please+choose+another.",
    );
  const targetExam =
    parsed.data.studyStage === "residency_interviews"
      ? "step2ck"
      : parsed.data.studyStage;
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      username: parsed.data.username,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      full_name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      email: user.email?.trim().toLowerCase() ?? null,
      country_code: parsed.data.countryCode,
      phone_country_code: parsed.data.phoneCountryCode,
      phone_number: parsed.data.phoneNumber,
      medical_school: parsed.data.medicalSchool || null,
      training_level: parsed.data.trainingLevel || null,
      study_stage: parsed.data.studyStage,
      target_exam: targetExam,
      role: "student",
      onboarding_completed: true,
    },
    { onConflict: "id" },
  );
  if (error)
    redirect(
      "/onboarding?error=We+could+not+save+your+profile.+Please+try+again.",
    );
  redirect("/dashboard");
}
