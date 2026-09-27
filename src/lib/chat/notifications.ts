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
  relatedMessageId?: string;
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

export async function syncChatMentionNotifications(input: {
  messageId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  roomSlug: string;
  roomName: string;
}) {
  const mentionedUsernames = [
    ...new Set(
      [...input.content.matchAll(/(?:^|\s)@([a-z0-9_]{3,24})\b/gi)].map(
        (match) => (match[1] ?? "").toLowerCase(),
      ),
    ),
  ];

  await connectChatDatabase();
  if (mentionedUsernames.length === 0) {
    await ChatNotification.deleteMany({
      type: "chat_mention",
      relatedMessageId: input.messageId,
    });
    return;
  }

  const { data, error } = await createServiceRoleClient()
    .from("profiles")
    .select("id,username")
    .in("username", mentionedUsernames)
    .eq("role", "student")
    .eq("onboarding_completed", true)
    .neq("id", input.senderId);
  if (error) throw new Error("Could not resolve mentioned chat users.");

  const recipientIds = (data ?? []).map((profile) => String(profile.id));
  await ChatNotification.deleteMany({
    type: "chat_mention",
    relatedMessageId: input.messageId,
    recipientId: { $nin: recipientIds },
  });
  if (recipientIds.length === 0) return;

  await ChatNotification.bulkWrite(
    recipientIds.map((recipientId) => ({
      updateOne: {
        filter: {
          recipientId,
          type: "chat_mention" as const,
          relatedMessageId: input.messageId,
        },
        update: {
          $set: {
            title: `Mentioned in ${input.roomName}`,
            body: `@${input.senderUsername} mentioned you in a chat message.`,
            href: `/chat-rooms?room=${encodeURIComponent(input.roomSlug)}`,
          },
          $setOnInsert: {
            recipientId,
            type: "chat_mention" as const,
            relatedMessageId: input.messageId,
          },
        },
        upsert: true,
      },
    })),
  );
}
