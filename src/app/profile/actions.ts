"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import { ChatMessage, ChatRoom, connectChatDatabase } from "@/lib/chat/db";
import {
  residencyIdSchema,
  residencyNotesSchema,
} from "@/lib/residencies/tracking";
import { createClient } from "@/lib/supabase/server";
import {
  editableStudentDetailsSchema,
  studyStageChangeSchema,
  testimonialSchema,
} from "@/lib/validation/auth";

export async function updateStudentProfile(formData: FormData) {
  const profile = await requireOnboardedProfile();
  const parsed = editableStudentDetailsSchema.safeParse({
    username: formData.get("username"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    countryCode: formData.get("countryCode"),
    phoneCountryCode: formData.get("phoneCountryCode"),
    phoneNumber: formData.get("phoneNumber"),
    medicalSchool: formData.get("medicalSchool") || undefined,
    trainingLevel: formData.get("trainingLevel") || undefined,
  });

  if (!parsed.success) {
    redirect("/profile?error=Review+the+profile+details+and+try+again.");
  }

  const supabase = await createClient();
  const { data: usernameAvailable, error: usernameError } = await supabase.rpc(
    "username_available_for_current_user",
    { candidate: parsed.data.username },
  );
  if (usernameError || usernameAvailable !== true) {
    redirect(
      usernameError
        ? "/profile?error=We+could+not+check+that+username.+Please+try+again."
        : "/profile?error=That+username+is+already+taken.+Please+choose+another.",
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      full_name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      country_code: parsed.data.countryCode,
      phone_country_code: parsed.data.phoneCountryCode,
      phone_number: parsed.data.phoneNumber,
      medical_school: parsed.data.medicalSchool || null,
      training_level: parsed.data.trainingLevel || null,
    })
    .eq("id", profile.id);

  if (error) {
    redirect(
      error.code === "23505"
        ? "/profile?error=That+username+is+already+taken.+Please+choose+another."
        : "/profile?error=We+could+not+save+your+profile+changes.",
    );
  }

  if (parsed.data.username !== profile.username && process.env.MONGODB_URI) {
    try {
      await connectChatDatabase();
      await Promise.all([
        ChatMessage.updateMany(
          { senderId: profile.id },
          { $set: { senderName: parsed.data.username } },
        ),
        ChatRoom.updateMany(
          { createdBy: profile.id },
          { $set: { creatorUsername: parsed.data.username } },
        ),
        ChatRoom.updateMany(
          { "members.userId": profile.id },
          { $set: { "members.$[member].username": parsed.data.username } },
          { arrayFilters: [{ "member.userId": profile.id }] },
        ),
      ]);
    } catch (chatError) {
      console.error(
        "Could not propagate the updated username to chat.",
        chatError,
      );
    }
  }

  revalidatePath("/profile");
  revalidatePath("/chat-rooms");
  revalidatePath("/get-featured");
  revalidatePath("/", "layout");
  redirect("/profile?updated=1");
}

export async function changeStudyStage(formData: FormData) {
  const profile = await requireOnboardedProfile();
  const parsed = studyStageChangeSchema.safeParse({
    studyStage: formData.get("studyStage"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: "Choose a valid current stage." };
  }

  const fromStage = profile.studyStage;
  const toStage = parsed.data.studyStage;
  if (fromStage === toStage) {
    return {
      ok: false as const,
      error: "That is already your current stage.",
    };
  }

  const targetExam = toStage === "residency_interviews" ? "step2ck" : toStage;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ study_stage: toStage, target_exam: targetExam })
    .eq("id", profile.id);

  if (error) {
    return {
      ok: false as const,
      error: "We could not change your stage. Please try again.",
    };
  }

  revalidateStagePaths();
  return { ok: true as const, fromStage, toStage };
}

export async function submitStageTestimonial(formData: FormData) {
  const profile = await requireOnboardedProfile();
  const parsed = testimonialSchema.safeParse({
    fromStage: formData.get("fromStage"),
    toStage: formData.get("toStage"),
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
  if (parsed.data.toStage !== profile.studyStage) {
    return {
      ok: false as const,
      error:
        "Your current stage changed. Refresh before submitting this review.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_stage_testimonial", {
    p_from_stage: parsed.data.fromStage,
    p_to_stage: parsed.data.toStage,
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

function revalidateStagePaths() {
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/create-test");
  revalidatePath("/interview-practice");
  revalidatePath("/resources");
  revalidatePath("/guidelines");
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
