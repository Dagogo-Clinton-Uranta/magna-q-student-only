import { DEMO_AUTH_BYPASS_ENABLED } from "@/lib/auth/demo";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  ChatNotification,
  connectChatDatabase,
  type NotificationType,
} from "@/lib/chat/db";

export async function createChatNotification(input: {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  relatedGroupId?: string;
}) {
  await connectChatDatabase();
  return ChatNotification.create(input);
}

export async function notifyAdministrators(input: {
  title: string;
  body: string;
  href: string;
  relatedGroupId: string;
}) {
  const recipientIds = DEMO_AUTH_BYPASS_ENABLED
    ? ["demo-admin"]
    : await administratorIds();
  if (recipientIds.length === 0) return;
  await connectChatDatabase();
  await ChatNotification.insertMany(
    recipientIds.map((recipientId) => ({
      ...input,
      recipientId,
      type: "private_group_request" as const,
    })),
  );
}

async function administratorIds() {
  const { data, error } = await createServiceRoleClient()
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .eq("onboarding_completed", true);
  if (error) throw new Error("Could not find administrators to notify.");
  return (data ?? []).map((profile) => String(profile.id));
}
