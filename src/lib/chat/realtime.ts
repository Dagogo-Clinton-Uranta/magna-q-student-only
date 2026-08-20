import { randomUUID } from "node:crypto";
import IORedis from "ioredis";
import type { ChatMessageDto } from "@/lib/chat/types";

export type ChatRealtimeEvent =
  | { type: "message:created"; message: ChatMessageDto }
  | { type: "message:status"; message: ChatMessageDto };

const CHAT_REALTIME_STREAM = "chat:realtime:v1";
const CHAT_REALTIME_MAX_LENGTH = 2_000;
const CHAT_REALTIME_BLOCK_MS = 5_000;
const workerOrigin = `worker:${randomUUID()}`;
let publisher: IORedis | undefined;

function redisUrl() {
  const value = process.env.REDIS_URL;
  if (!value)
    throw new Error("REDIS_URL is required for realtime chat delivery.");
  return value;
}

function publisherClient() {
  if (!publisher) {
    publisher = new IORedis(redisUrl(), {
      maxRetriesPerRequest: 1,
      retryStrategy: (attempt) => Math.min(attempt * 200, 5_000),
    });
    publisher.on("error", (error) =>
      console.error("Chat realtime publisher failed.", error),
    );
  }
  return publisher;
}

export async function publishChatRealtimeEvent(
  event: ChatRealtimeEvent,
  origin = workerOrigin,
) {
  await publisherClient().xadd(
    CHAT_REALTIME_STREAM,
    "MAXLEN",
    "~",
    CHAT_REALTIME_MAX_LENGTH,
    "*",
    "event",
    JSON.stringify(event),
    "origin",
    origin,
  );
}

type StreamReadResult = Array<
  [stream: string, entries: Array<[id: string, fields: string[]]>]
> | null;

function fieldValue(fields: string[], name: string) {
  for (let index = 0; index + 1 < fields.length; index += 2) {
    if (fields[index] === name) return fields[index + 1];
  }
  return undefined;
}

function parseEvent(value: string | undefined): ChatRealtimeEvent | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<ChatRealtimeEvent>;
    if (
      (parsed.type === "message:created" || parsed.type === "message:status") &&
      parsed.message &&
      typeof parsed.message === "object" &&
      typeof parsed.message.roomSlug === "string"
    )
      return parsed as ChatRealtimeEvent;
  } catch {
    // Ignore malformed relay entries instead of stopping delivery.
  }
  return null;
}

/**
 * Starts one blocking Redis stream reader for a Vercel Function instance.
 * MongoDB remains the durable message store; this bounded stream only relays
 * new events to sockets connected to other instances.
 */
export async function subscribeToChatRealtimeEvents(
  localOrigin: string,
  onEvent: (event: ChatRealtimeEvent) => void,
) {
  const client = new IORedis(redisUrl(), {
    maxRetriesPerRequest: null,
    retryStrategy: (attempt) => Math.min(attempt * 200, 5_000),
  });
  client.on("error", (error) =>
    console.error("Chat realtime subscriber failed.", error),
  );

  let active = true;
  const tail = await client.xrevrange(
    CHAT_REALTIME_STREAM,
    "+",
    "-",
    "COUNT",
    1,
  );
  let cursor = tail[0]?.[0] ?? "0-0";

  void (async () => {
    while (active) {
      try {
        const result = (await client.xread(
          "COUNT",
          100,
          "BLOCK",
          CHAT_REALTIME_BLOCK_MS,
          "STREAMS",
          CHAT_REALTIME_STREAM,
          cursor,
        )) as StreamReadResult;

        for (const [, entries] of result ?? []) {
          for (const [id, fields] of entries) {
            cursor = id;
            if (fieldValue(fields, "origin") === localOrigin) continue;
            const event = parseEvent(fieldValue(fields, "event"));
            if (event) onEvent(event);
          }
        }
      } catch (error) {
        if (!active) break;
        console.error("Chat realtime read loop failed.", error);
        await new Promise((resolve) => setTimeout(resolve, 1_000));
      }
    }
  })();

  return () => {
    active = false;
    client.disconnect();
  };
}
