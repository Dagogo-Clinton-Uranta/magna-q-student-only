"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  residencyIdSchema,
  residencyNotesSchema,
} from "@/lib/residencies/tracking";
import { createClient } from "@/lib/supabase/server";
import { editableStudentProfileSchema } from "@/lib/validation/auth";

export async function updateStudentProfile(formData: FormData) {
  const profile = await requireOnboardedProfile();
  const parsed = editableStudentProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    countryCode: formData.get("countryCode"),
    phoneCountryCode: formData.get("phoneCountryCode"),
    phoneNumber: formData.get("phoneNumber"),
    medicalSchool: formData.get("medicalSchool") || undefined,
    trainingLevel: formData.get("trainingLevel") || undefined,
    studyStage: formData.get("studyStage"),
  });

  if (!parsed.success) {
    redirect("/profile?error=Review+the+profile+details+and+try+again.");
  }

  const targetExam =
    parsed.data.studyStage === "residency_interviews"
      ? "step2ck"
      : parsed.data.studyStage;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      full_name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      country_code: parsed.data.countryCode,
      phone_country_code: parsed.data.phoneCountryCode,
      phone_number: parsed.data.phoneNumber,
      medical_school: parsed.data.medicalSchool || null,
      training_level: parsed.data.trainingLevel || null,
      study_stage: parsed.data.studyStage,
      target_exam: targetExam,
    })
    .eq("id", profile.id);

  if (error) {
    redirect("/profile?error=We+could+not+save+your+profile+changes.");
  }

  revalidatePath("/profile");
  redirect("/profile?updated=1");
}

export async function trackResidency(formData: FormData) {
  const parsed = residencyIdSchema.safeParse(formData.get("residencyId"));
  if (!parsed.success) redirect("/resources/residency-directory");

  const profile = await requireOnboardedProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("tracked_residencies").upsert(
    {
      user_id: profile.id,
      residency_id: parsed.data,
    },
    {
      onConflict: "user_id,residency_id",
      ignoreDuplicates: true,
    },
  );
  const path = directoryResidencyPath(parsed.data);

  if (error) redirect(`${path}?trackingError=add#tracking`);

  revalidateTrackingPaths(parsed.data);
  redirect(`${path}?tracking=added#tracking`);
}

export async function untrackResidency(formData: FormData) {
  const parsed = residencyIdSchema.safeParse(formData.get("residencyId"));
  if (!parsed.success) redirect("/profile/tracked-residencies");
  const fromTrackedPage = formData.get("context") === "tracked";

  const profile = await requireOnboardedProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("tracked_residencies")
    .delete()
    .eq("user_id", profile.id)
    .eq("residency_id", parsed.data);
  const path = fromTrackedPage
    ? trackedResidencyPath(parsed.data)
    : directoryResidencyPath(parsed.data);

  if (error) redirect(`${path}?trackingError=remove#tracking`);

  revalidateTrackingPaths(parsed.data);
  redirect(
    fromTrackedPage
      ? "/profile/tracked-residencies?removed=1"
      : `${path}?tracking=removed#tracking`,
  );
}

export async function saveResidencyNotes(formData: FormData) {
  const parsed = residencyNotesSchema.safeParse({
    residencyId: formData.get("residencyId"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) redirect("/profile/tracked-residencies");

  const profile = await requireOnboardedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracked_residencies")
    .update({ notes: parsed.data.notes })
    .eq("user_id", profile.id)
    .eq("residency_id", parsed.data.residencyId)
    .select("residency_id")
    .maybeSingle();
  const path = trackedResidencyPath(parsed.data.residencyId);

  if (error || !data) redirect(`${path}?trackingError=notes#tracking`);

  revalidateTrackingPaths(parsed.data.residencyId);
  redirect(`${path}?notes=saved#tracking`);
}

function directoryResidencyPath(residencyId: number) {
  return `/resources/residency-directory/${residencyId}`;
}

function trackedResidencyPath(residencyId: number) {
  return `/profile/tracked-residencies/${residencyId}`;
}

function revalidateTrackingPaths(residencyId: number) {
  revalidatePath(directoryResidencyPath(residencyId));
  revalidatePath(trackedResidencyPath(residencyId));
  revalidatePath("/profile/tracked-residencies");
  revalidatePath("/profile");
}
