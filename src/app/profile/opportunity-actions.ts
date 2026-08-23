"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import { eventIdSchema, eventNotesSchema } from "@/lib/residencies/events";
import { createClient } from "@/lib/supabase/server";

export async function trackResidencyEvent(formData: FormData) {
  const parsed = eventIdSchema.safeParse(formData.get("eventId"));
  if (!parsed.success) redirect("/resources/open-house-opportunities");

  const profile = await requireOnboardedProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("tracked_residency_events")
    .upsert(
      { user_id: profile.id, event_id: parsed.data },
      { onConflict: "user_id,event_id", ignoreDuplicates: true },
    );
  const path = directoryEventPath(parsed.data);
  if (error) redirect(`${path}?trackingError=add#tracking`);

  revalidateEventTrackingPaths(parsed.data);
  redirect(`${path}?tracking=added#tracking`);
}

export async function untrackResidencyEvent(formData: FormData) {
  const parsed = eventIdSchema.safeParse(formData.get("eventId"));
  if (!parsed.success) redirect("/profile/tracked-opportunities");
  const fromTrackedPage = formData.get("context") === "tracked";

  const profile = await requireOnboardedProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("tracked_residency_events")
    .delete()
    .eq("user_id", profile.id)
    .eq("event_id", parsed.data);
  const path = fromTrackedPage
    ? trackedEventPath(parsed.data)
    : directoryEventPath(parsed.data);
  if (error) redirect(`${path}?trackingError=remove#tracking`);

  revalidateEventTrackingPaths(parsed.data);
  redirect(
    fromTrackedPage
      ? "/profile/tracked-opportunities?removed=1"
      : `${path}?tracking=removed#tracking`,
  );
}

export async function saveResidencyEventNotes(formData: FormData) {
  const parsed = eventNotesSchema.safeParse({
    eventId: formData.get("eventId"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) redirect("/profile/tracked-opportunities");

  const profile = await requireOnboardedProfile();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracked_residency_events")
    .update({ notes: parsed.data.notes })
    .eq("user_id", profile.id)
    .eq("event_id", parsed.data.eventId)
    .select("event_id")
    .maybeSingle();
  const path = trackedEventPath(parsed.data.eventId);
  if (error || !data) redirect(`${path}?trackingError=notes#tracking`);

  revalidateEventTrackingPaths(parsed.data.eventId);
  redirect(`${path}?notes=saved#tracking`);
}

function directoryEventPath(eventId: string) {
  return `/resources/open-house-opportunities/${eventId}`;
}

function trackedEventPath(eventId: string) {
  return `/profile/tracked-opportunities/${eventId}`;
}

function revalidateEventTrackingPaths(eventId: string) {
  revalidatePath(directoryEventPath(eventId));
  revalidatePath(trackedEventPath(eventId));
  revalidatePath("/profile/tracked-opportunities");
  revalidatePath("/profile");
}
