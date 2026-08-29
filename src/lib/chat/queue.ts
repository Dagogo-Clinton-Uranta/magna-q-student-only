export const CHAT_MODERATION_QUEUE = "chat-message-moderation";
export type ChatModerationJob = { messageId: string };

export async function enqueueChatModeration(data: ChatModerationJob) {
  const redisUrl = requireRedisUrl("chat AI moderation");
  const [{ Queue }, { default: IORedis }] = await Promise.all([
    // Avoid BullMQ's package root: it also exports the optional native Valkey
    // Glide adapter, which cannot be bundled into a Vercel Node function.
    import("bullmq/dist/esm/classes/queue"),
    import("ioredis"),
  ]);
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  const queue = new Queue<ChatModerationJob>(CHAT_MODERATION_QUEUE, {
    connection,
  });
  try {
    await queue.add("moderate-message", data, {
      jobId: data.messageId,
      attempts: 3,
      backoff: { type: "exponential", delay: 1_000 },
      removeOnComplete: 1_000,
      removeOnFail: 5_000,
    });
  } finally {
    await queue.close();
    await connection.quit();
  }
}
import { requireRedisUrl } from "@/lib/redis/url";
