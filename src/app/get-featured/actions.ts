"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, requireOnboardedProfile } from "@/lib/auth/guards";
import {
  mentionedUsernames,
  moderateFeatureComment,
} from "@/lib/features/moderation";
import {
  notifyFeatureComment,
  notifyFeaturePulse,
} from "@/lib/features/notifications";
import {
  featureCommentSchema,
  featureIdSchema,
  featureRequestSchema,
} from "@/lib/features/validation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";

export type FeatureActionResult = {
  ok: boolean;
  message: string;
  pulsed?: boolean;
  count?: number;
};

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function submitFeatureRequest(
  formData: FormData,
): Promise<FeatureActionResult> {
  const profile = await requireOnboardedProfile();
  const user = await getCurrentUser();
  const parsed = featureRequestSchema.safeParse({
    username: field(formData, "username"),
    title: field(formData, "title"),
    summary: field(formData, "summary"),
    representativeQuote: field(formData, "representativeQuote"),
    imageUrl: field(formData, "imageUrl"),
    imagePath: field(formData, "imagePath"),
    imageStorageProvider: field(formData, "imageStorageProvider"),
    imageAltText: field(formData, "imageAltText"),
  });
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check every field.",
    };
  if (parsed.data.username !== profile.username)
    return { ok: false, message: "Your username could not be verified." };
  const expectedPathPrefix =
    parsed.data.imageStorageProvider === "s3"
      ? `feature-requests/${profile.id}/`
      : `${profile.id}/`;
  if (!parsed.data.imagePath.startsWith(expectedPathPrefix))
    return { ok: false, message: "Please upload an image for this request." };
  if (!user?.email)
    return { ok: false, message: "Your account email could not be verified." };

  const supabase = await createClient();
  const { error } = await supabase.from("feature_requests").insert({
    user_id: profile.id,
    username: profile.username,
    user_name: profile.fullName,
    user_email: user.email.trim().toLowerCase(),
    title: parsed.data.title,
    summary: parsed.data.summary,
    representative_quote: parsed.data.representativeQuote,
    image_url: parsed.data.imageUrl,
    image_path: parsed.data.imagePath,
    image_storage_provider: parsed.data.imageStorageProvider,
    image_alt_text: parsed.data.imageAltText,
    review_status: "submitted",
    front_page_feature: false,
    in_app_feature: false,
    is_sample: false,
  });
  if (error) {
    console.error("Could not submit feature request.", error);
    return {
      ok: false,
      message: "We could not submit your feature right now.",
    };
  }
  revalidatePath("/get-featured");
  return {
    ok: true,
    message: "Your feature request has been sent to the Magna-Q team.",
  };
}

export async function toggleFeaturePulse(
  rawFeatureId: string,
): Promise<FeatureActionResult> {
  const profile = await requireOnboardedProfile();
  const featureId = featureIdSchema.safeParse(rawFeatureId);
  if (!featureId.success)
    return { ok: false, message: "This feature could not be found." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("toggle_feature_pulse", {
    p_feature_id: featureId.data,
  });
  if (error || !data) {
    console.error("Could not toggle feature pulse.", error);
    return { ok: false, message: "We could not update your pulse right now." };
  }
  const result = data as { pulsed?: boolean; count?: number | string };
  const pulsed = Boolean(result.pulsed);
  const count = Number(result.count ?? 0);

  if (pulsed) {
    const { data: feature } = await supabase
      .from("community_features")
      .select("user_id,title")
      .eq("id", featureId.data)
      .maybeSingle();
    if (feature?.user_id && feature.user_id !== profile.id) {
      try {
        await notifyFeaturePulse({
          recipientId: String(feature.user_id),
          featureId: featureId.data,
          featureTitle: String(feature.title),
          pulseCount: count,
        });
      } catch (notificationError) {
        console.error(
          "Could not send feature pulse notification.",
          notificationError,
        );
      }
    }
  }

  revalidatePath(`/get-featured/${featureId.data}`);
  revalidatePath("/get-featured");
  revalidatePath("/");
  return {
    ok: true,
    message: pulsed
      ? "you gave this feature a pulse!"
      : "Your pulse was removed.",
    pulsed,
    count,
  };
}

export async function submitFeatureComment(
  formData: FormData,
): Promise<FeatureActionResult> {
  const profile = await requireOnboardedProfile();
  const parsed = featureCommentSchema.safeParse({
    featureId: field(formData, "featureId"),
    content: field(formData, "content"),
  });
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check your comment.",
    };

  const moderation = moderateFeatureComment(parsed.data.content);
  const mentions = mentionedUsernames(parsed.data.content);
  if (!moderation.accepted)
    return {
      ok: false,
      message: `${moderation.reasons.join(". ")}. Keep contact details and links inside Magna-Q.`,
    };
  const admin = createServiceRoleClient();
  const { data: feature } = await admin
    .from("community_features")
    .select("id,user_id,title")
    .eq("id", parsed.data.featureId)
    .maybeSingle();
  if (!feature)
    return { ok: false, message: "This feature could not be found." };

  const { error } = await admin.from("feature_comments").insert({
    feature_id: parsed.data.featureId,
    user_id: profile.id,
    username: profile.username,
    user_name: profile.fullName,
    content: parsed.data.content,
    mentioned_usernames: mentions,
    moderation_status: "accepted",
    moderation_reasons: [],
  });
  if (error) {
    console.error("Could not save feature comment.", error);
    return { ok: false, message: "We could not save your comment right now." };
  }
  let mentionedIds: string[] = [];
  if (mentions.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id,username")
      .in("username", mentions);
    mentionedIds = (profiles ?? []).map((entry) => String(entry.id));
  }
  const recipients = new Set<string>(mentionedIds);
  if (feature.user_id) recipients.add(String(feature.user_id));
  recipients.delete(profile.id);
  try {
    await notifyFeatureComment({
      recipientIds: [...recipients],
      featureId: parsed.data.featureId,
      featureTitle: String(feature.title),
      actorUsername: profile.username,
    });
  } catch (notificationError) {
    console.error(
      "Could not send feature comment notification.",
      notificationError,
    );
  }

  revalidatePath(`/get-featured/${parsed.data.featureId}`);
  revalidatePath("/get-featured");
  revalidatePath("/");
  return { ok: true, message: "Your comment is now visible." };
}
