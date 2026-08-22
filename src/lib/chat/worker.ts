import { ChatMessage, connectChatDatabase, messageDto } from "@/lib/chat/db";
import {
  CHAT_MODERATION_QUEUE,
  type ChatModerationJob,
} from "@/lib/chat/queue";
import { publishChatRealtimeEvent } from "@/lib/chat/realtime";
import { configuredRedisUrl } from "@/lib/redis/url";

async function moderateWithOpenAI(content: string) {
  // OPENAI_API_KEY is required here before production AI moderation can run.
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is required for chat moderation.");
  const response = await fetch(
    `${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/moderations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "omni-moderation-latest", input: content }),
    },
  );
  if (!response.ok)
    throw new Error(`OpenAI moderation failed (${response.status}).`);
  const body = (await response.json()) as {
    results?: Array<{ flagged?: boolean }>;
  };
  return !body.results?.[0]?.flagged;
}

export async function startChatModerationWorker() {
  const redisUrl = configuredRedisUrl();
  if (!redisUrl || !process.env.MONGODB_URI) return null;
  const [{ Worker }, { default: IORedis }] = await Promise.all([
    import("bullmq"),
    import("ioredis"),
  ]);
  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
  });
  connection.on("error", (error) =>
    console.error("Chat moderation Redis failed.", error),
  );
  const worker = new Worker<ChatModerationJob>(
    CHAT_MODERATION_QUEUE,
    async (job) => {
      await connectChatDatabase();
      const message = await ChatMessage.findById(job.data.messageId);
      if (!message || message.moderationStatus !== "pending") return;
      message.moderationStatus = (await moderateWithOpenAI(message.content))
        ? "accepted"
        : "rejected";
      await message.save();
      const payload = messageDto(message);
      await publishChatRealtimeEvent({
        type: "message:status",
        message: payload,
      });
      if (payload.moderationStatus === "accepted")
        await publishChatRealtimeEvent({
          type: "message:created",
          message: payload,
        });
    },
    { connection, concurrency: 3 },
  );
  worker.on("error", (error) =>
    console.error("Chat moderation worker failed.", error),
  );
  return worker;
}
