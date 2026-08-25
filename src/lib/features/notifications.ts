import "server-only";

import { ChatNotification, connectChatDatabase } from "@/lib/chat/db";

type PulseNotificationInput = {
  recipientId: string;
  featureId: string;
  featureTitle: string;
  pulseCount: number;
};

export async function notifyFeaturePulse({
  recipientId,
  featureId,
  featureTitle,
  pulseCount,
}: PulseNotificationInput) {
  if (!process.env.MONGODB_URI) return;
  await connectChatDatabase();
  await ChatNotification.findOneAndUpdate(
    { recipientId, type: "feature_pulse", relatedFeatureId: featureId },
    {
      $set: {
        title: "Your feature received a pulse",
        body: `“${featureTitle}” now has ${pulseCount} ${pulseCount === 1 ? "pulse" : "pulses"}.`,
        href: `/get-featured/${featureId}`,
        relatedFeatureId: featureId,
      },
      $unset: { readAt: 1 },
      $setOnInsert: { recipientId, type: "feature_pulse" },
    },
    { upsert: true, new: true },
  );
}

type CommentNotificationInput = {
  recipientIds: string[];
  featureId: string;
  featureTitle: string;
  actorUsername: string;
};

export async function notifyFeatureComment({
  recipientIds,
  featureId,
  featureTitle,
  actorUsername,
}: CommentNotificationInput) {
  if (!process.env.MONGODB_URI || recipientIds.length === 0) return;
  await connectChatDatabase();
  await ChatNotification.insertMany(
    recipientIds.map((recipientId) => ({
      recipientId,
      type: "feature_comment" as const,
      title: "New comment on a community feature",
      body: `@${actorUsername} commented on “${featureTitle}”.`,
      href: `/get-featured/${featureId}`,
      relatedFeatureId: featureId,
    })),
  );
}
