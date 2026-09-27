import { randomUUID } from "node:crypto";
import { WebSocket, type RawData } from "ws";
import { PAYMENTS_ENABLED } from "@/config/features";
import {
  ChatBan,
  ChatMessage,
  ChatNotification,
  ChatRoom,
  connectChatDatabase,
  messageDto,
} from "@/lib/chat/db";
import { assessMessageRisk } from "@/lib/chat/moderation";
import { syncChatMentionNotifications } from "@/lib/chat/notifications";
import { hasCurrentPaidChatAccess } from "@/lib/chat/paid-access";
import { enqueueChatModeration } from "@/lib/chat/queue";
import {
  publishChatRealtimeEvent,
  subscribeToChatRealtimeEvents,
  type ChatRealtimeEvent,
} from "@/lib/chat/realtime";
import {
  readSocketAuthentication,
  type SocketUser,
} from "@/lib/chat/socket-auth";
import { startChatModerationWorker } from "@/lib/chat/worker";
import type { ChatMessageDto } from "@/lib/chat/types";

type Connection = {
  user: SocketUser | null;
  roomSlug: string | null;
  entitlementTimer: ReturnType<typeof setInterval> | null;
};

type ClientEvent =
  | { type: "join"; ticket?: unknown; roomSlug?: unknown }
  | {
      type: "message:send";
      content?: unknown;
      requestId?: unknown;
    }
  | {
      type: "message:edit";
      messageId?: unknown;
      content?: unknown;
      requestId?: unknown;
    }
  | {
      type: "message:delete";
      messageId?: unknown;
      requestId?: unknown;
    };

type ServerEvent =
  | {
      type: "joined";
      room: { slug: string; name: string; topic: string | null };
      messages: ChatMessageDto[];
    }
  | { type: "message:created"; message: ChatMessageDto }
  | { type: "message:updated"; message: ChatMessageDto }
  | { type: "message:deleted"; roomSlug: string; messageId: string }
  | { type: "message:status"; message: ChatMessageDto }
  | { type: "message:accepted"; requestId: string }
  | { type: "error"; message: string; requestId?: string };

const instanceId = `websocket:${randomUUID()}`;
const connections = new Map<WebSocket, Connection>();
let stopRealtimeSubscription: (() => void) | null = null;
let realtimeSubscriptionStarting = false;
let moderationWorkerStarting = false;

function send(socket: WebSocket, event: ServerEvent) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(event));
}

function broadcast(roomSlug: string, event: ServerEvent) {
  for (const [socket, connection] of connections) {
    if (connection.roomSlug === roomSlug) send(socket, event);
  }
}

function relayToLocalSockets(event: ChatRealtimeEvent) {
  const roomSlug =
    event.type === "message:deleted" ? event.roomSlug : event.message.roomSlug;
  broadcast(roomSlug, event);
}

function ensureRealtimeSubscription() {
  if (stopRealtimeSubscription || realtimeSubscriptionStarting) return;
  realtimeSubscriptionStarting = true;
  void subscribeToChatRealtimeEvents(instanceId, relayToLocalSockets)
    .then((stop) => {
      realtimeSubscriptionStarting = false;
      if (connections.size === 0) stop();
      else stopRealtimeSubscription = stop;
    })
    .catch((error) => {
      realtimeSubscriptionStarting = false;
      console.error("Could not start the chat realtime subscription.", error);
    });
}

function ensureModerationWorker() {
  if (moderationWorkerStarting || !process.env.OPENAI_API_KEY) return;
  moderationWorkerStarting = true;
  void startChatModerationWorker().catch((error) => {
    moderationWorkerStarting = false;
    console.error("Could not start the chat moderation worker.", error);
  });
}

async function socketUser(ticket: unknown): Promise<SocketUser | null> {
  if (process.env.DEMO_AUTH_BYPASS === "true" && ticket === "demo")
    return {
      id: "demo-student",
      name: "demo_student",
      accessExpiresAt: new Date(
        Date.now() + 12 * 60 * 60 * 1_000,
      ).toISOString(),
    };
  return readSocketAuthentication(ticket);
}

async function paidChatAccessIsCurrent(user: SocketUser) {
  if (Date.parse(user.accessExpiresAt) <= Date.now()) return false;
  if (!PAYMENTS_ENABLED) return true;
  if (process.env.DEMO_AUTH_BYPASS === "true" && user.id === "demo-student")
    return true;
  return hasCurrentPaidChatAccess(user.id);
}

function startEntitlementAudit(socket: WebSocket, connection: Connection) {
  if (connection.entitlementTimer) clearInterval(connection.entitlementTimer);
  connection.entitlementTimer = setInterval(async () => {
    try {
      if (!connection.user || !(await paidChatAccessIsCurrent(connection.user)))
        socket.close(4001, "Chat access expired");
    } catch (error) {
      console.error("Chat entitlement revalidation failed.", error);
      socket.close(1011, "Authentication unavailable");
    }
  }, 30_000);
}

async function joinRoom(
  socket: WebSocket,
  connection: Connection,
  event: Extract<ClientEvent, { type: "join" }>,
) {
  if (typeof event.roomSlug !== "string") throw new Error("Invalid chat room.");
  const user = await socketUser(event.ticket);
  if (!user || !(await paidChatAccessIsCurrent(user))) {
    send(socket, {
      type: "error",
      message: "Your chat session has expired. Refresh this page to reconnect.",
    });
    socket.close(4001, "Unauthorized");
    return;
  }

  await connectChatDatabase();
  const [room, ban] = await Promise.all([
    ChatRoom.findOne({ slug: event.roomSlug }).lean(),
    ChatBan.findOne({ roomSlug: event.roomSlug, userId: user.id }).lean(),
  ]);
  if (!room) throw new Error("Chat room not found.");
  if (ban) throw new Error("You are banned from this chat room.");
  if (
    room.visibility === "private" &&
    (room.status !== "approved" ||
      (room.createdBy !== user.id &&
        !room.members.some((member) => member.userId === user.id)))
  )
    throw new Error("You do not have access to this private chat room.");

  const messages = await ChatMessage.find({
    roomSlug: event.roomSlug,
    moderationStatus: "accepted",
  })
    .sort({ createdAt: -1 })
    .limit(100);

  connection.user = user;
  connection.roomSlug = event.roomSlug;
  startEntitlementAudit(socket, connection);
  send(socket, {
    type: "joined",
    room: {
      slug: room.slug,
      name: room.name,
      topic: room.topic || null,
    },
    messages: messages.reverse().map(messageDto),
  });
}

async function sendMessage(
  socket: WebSocket,
  connection: Connection,
  event: Extract<ClientEvent, { type: "message:send" }>,
) {
  const requestId =
    typeof event.requestId === "string" ? event.requestId : undefined;
  try {
    if (
      typeof event.content !== "string" ||
      !connection.user ||
      !connection.roomSlug
    )
      throw new Error("Join the room before sending a message.");
    if (!(await paidChatAccessIsCurrent(connection.user)))
      throw new Error("Your monthly subscription has expired.");

    await connectChatDatabase();
    const [ban, room] = await Promise.all([
      ChatBan.exists({
        roomSlug: connection.roomSlug,
        userId: connection.user.id,
      }),
      ChatRoom.findOne({ slug: connection.roomSlug }).lean(),
    ]);
    if (ban) throw new Error("You are banned from this chat room.");
    if (!room) throw new Error("Chat room not found.");
    if (
      room.visibility === "private" &&
      (room.status !== "approved" ||
        (room.createdBy !== connection.user.id &&
          !room.members.some(
            (member) => member.userId === connection.user?.id,
          )))
    )
      throw new Error("You no longer have access to this private chat room.");

    const risk = assessMessageRisk(event.content);
    const message = await ChatMessage.create({
      roomSlug: connection.roomSlug,
      senderId: connection.user.id,
      senderName: connection.user.name,
      content: event.content.trim(),
      moderationStatus: risk.status,
      riskScore: risk.score,
      moderationReasons: risk.reasons,
    });
    const payload = messageDto(message);
    if (requestId) send(socket, { type: "message:accepted", requestId });

    if (risk.status === "accepted") {
      void syncChatMentionNotifications({
        messageId: message.id,
        senderId: connection.user.id,
        senderUsername: connection.user.name,
        content: message.content,
        roomSlug: room.slug,
        roomName: room.name,
      }).catch((notificationError) =>
        console.error(
          "Could not create chat mention notifications.",
          notificationError,
        ),
      );
      const realtimeEvent = {
        type: "message:created" as const,
        message: payload,
      };
      broadcast(connection.roomSlug, realtimeEvent);
      void publishChatRealtimeEvent(realtimeEvent, instanceId).catch((error) =>
        console.error("Could not relay the chat message.", error),
      );
    } else {
      send(socket, { type: "message:created", message: payload });
    }

    if (risk.requiresAiReview)
      void enqueueChatModeration({ messageId: message.id }).catch((error) =>
        console.error(
          "Could not queue the chat message for moderation.",
          error,
        ),
      );
  } catch (error) {
    send(socket, {
      type: "error",
      message:
        error instanceof Error ? error.message : "Message could not be sent.",
      requestId,
    });
  }
}

async function editMessage(
  socket: WebSocket,
  connection: Connection,
  event: Extract<ClientEvent, { type: "message:edit" }>,
) {
  const requestId =
    typeof event.requestId === "string" ? event.requestId : undefined;
  try {
    if (
      !connection.user ||
      !connection.roomSlug ||
      typeof event.messageId !== "string" ||
      typeof event.content !== "string"
    )
      throw new Error("Invalid message edit.");
    if (!(await paidChatAccessIsCurrent(connection.user)))
      throw new Error("Your monthly subscription has expired.");

    const risk = assessMessageRisk(event.content);
    if (risk.status !== "accepted")
      throw new Error("The edited message did not pass moderation.");

    await connectChatDatabase();
    const message = await ChatMessage.findOne({
      _id: event.messageId,
      roomSlug: connection.roomSlug,
      senderId: connection.user.id,
    });
    if (!message) throw new Error("You can only edit your own messages.");

    message.content = event.content.trim();
    message.moderationStatus = risk.status;
    message.riskScore = risk.score;
    message.moderationReasons = [...risk.reasons];
    await message.save();
    const room = await ChatRoom.findOne({ slug: connection.roomSlug }).lean();
    if (!room) throw new Error("Chat room not found.");

    const payload = messageDto(message);
    const realtimeEvent = {
      type: "message:updated" as const,
      message: payload,
    };
    broadcast(connection.roomSlug, realtimeEvent);
    void publishChatRealtimeEvent(realtimeEvent, instanceId).catch(
      (relayError) =>
        console.error("Could not relay the edited chat message.", relayError),
    );
    void syncChatMentionNotifications({
      messageId: message.id,
      senderId: connection.user.id,
      senderUsername: connection.user.name,
      content: message.content,
      roomSlug: room.slug,
      roomName: room.name,
    }).catch((notificationError) =>
      console.error(
        "Could not update chat mention notifications.",
        notificationError,
      ),
    );
    if (requestId) send(socket, { type: "message:accepted", requestId });
  } catch (error) {
    send(socket, {
      type: "error",
      message:
        error instanceof Error ? error.message : "Message could not be edited.",
      requestId,
    });
  }
}

async function deleteMessage(
  socket: WebSocket,
  connection: Connection,
  event: Extract<ClientEvent, { type: "message:delete" }>,
) {
  const requestId =
    typeof event.requestId === "string" ? event.requestId : undefined;
  try {
    if (
      !connection.user ||
      !connection.roomSlug ||
      typeof event.messageId !== "string"
    )
      throw new Error("Invalid message deletion.");
    if (!(await paidChatAccessIsCurrent(connection.user)))
      throw new Error("Your monthly subscription has expired.");

    await connectChatDatabase();
    const message = await ChatMessage.findOneAndDelete({
      _id: event.messageId,
      roomSlug: connection.roomSlug,
      senderId: connection.user.id,
    });
    if (!message) throw new Error("You can only delete your own messages.");
    await ChatNotification.deleteMany({ relatedMessageId: message.id });

    const realtimeEvent = {
      type: "message:deleted" as const,
      roomSlug: connection.roomSlug,
      messageId: message.id,
    };
    broadcast(connection.roomSlug, realtimeEvent);
    void publishChatRealtimeEvent(realtimeEvent, instanceId).catch(
      (relayError) =>
        console.error("Could not relay the deleted chat message.", relayError),
    );
    if (requestId) send(socket, { type: "message:accepted", requestId });
  } catch (error) {
    send(socket, {
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Message could not be deleted.",
      requestId,
    });
  }
}

function parseClientEvent(data: RawData): ClientEvent | null {
  try {
    const value = JSON.parse(data.toString()) as Partial<ClientEvent>;
    if (
      value.type === "join" ||
      value.type === "message:send" ||
      value.type === "message:edit" ||
      value.type === "message:delete"
    )
      return value as ClientEvent;
  } catch {
    // Invalid frames receive a generic error below.
  }
  return null;
}

export function registerChatWebSocket(socket: WebSocket) {
  const connection: Connection = {
    user: null,
    roomSlug: null,
    entitlementTimer: null,
  };
  connections.set(socket, connection);
  ensureRealtimeSubscription();
  ensureModerationWorker();

  socket.on("message", (data) => {
    const event = parseClientEvent(data);
    if (!event) {
      send(socket, { type: "error", message: "Invalid chat request." });
      return;
    }
    if (event.type === "join")
      void joinRoom(socket, connection, event).catch((error) =>
        send(socket, {
          type: "error",
          message:
            error instanceof Error ? error.message : "Could not join room.",
        }),
      );
    else if (event.type === "message:send")
      void sendMessage(socket, connection, event);
    else if (event.type === "message:edit")
      void editMessage(socket, connection, event);
    else void deleteMessage(socket, connection, event);
  });

  const unregister = () => {
    const existing = connections.get(socket);
    if (!existing) return;
    if (existing.entitlementTimer) clearInterval(existing.entitlementTimer);
    connections.delete(socket);
    if (connections.size === 0 && stopRealtimeSubscription) {
      stopRealtimeSubscription();
      stopRealtimeSubscription = null;
    }
  };
  socket.on("close", unregister);
  socket.on("error", unregister);
}
