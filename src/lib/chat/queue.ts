export const CHAT_MODERATION_QUEUE = "chat-message-moderation";
export type ChatModerationJob = { messageId: string };

export async function enqueueChatModeration(data: ChatModerationJob) {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl)
    throw new Error("REDIS_URL is required to queue AI moderation.");
  const [{ Queue }, { default: IORedis }] = await Promise.all([
    import("bullmq"),
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
