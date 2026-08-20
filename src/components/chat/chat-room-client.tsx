"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ChatMessageDto } from "@/lib/chat/types";
import {
  addPrivateGroupMember,
  closePrivateGroup,
  leavePrivateGroup,
} from "@/app/chat-rooms/actions";

type Room = {
  id: string;
  slug: string;
  name: string;
  topic: string | null;
  visibility: "public" | "private";
  status: "pending" | "approved" | "denied";
  isCreator: boolean;
  memberUsernames: string[];
};
type ServerEvent =
  | { type: "joined"; room: Room; messages: ChatMessageDto[] }
  | { type: "message:created"; message: ChatMessageDto }
  | { type: "message:status"; message: ChatMessageDto }
  | { type: "message:accepted"; requestId: string }
  | { type: "error"; message: string; requestId?: string };

export function ChatRoomClient({
  rooms,
  currentUserId,
  socketAuthTicket,
}: {
  rooms: Room[];
  currentUserId: string;
  socketAuthTicket: string;
}) {
  const [active, setActive] = useState(
    rooms.find((room) => room.status === "approved")?.slug || "",
  );
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [topic, setTopic] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const socket = useRef<WebSocket | null>(null);
  const pendingMessages = useRef(new Map<string, string>());
  const activeRef = useRef(active);
  activeRef.current = active;

  const joinRoom = useCallback(
    (client: WebSocket, slug: string) => {
      if (client.readyState !== WebSocket.OPEN) return;
      client.send(
        JSON.stringify({
          type: "join",
          ticket: socketAuthTicket,
          roomSlug: slug,
        }),
      );
    },
    [socketAuthTicket],
  );

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let reconnectDelay = 1_000;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const client = new WebSocket(
        `${protocol}://${window.location.host}/api/chat/socket`,
      );
      socket.current = client;
      client.addEventListener("open", () => {
        reconnectDelay = 1_000;
        joinRoom(client, activeRef.current);
      });
      client.addEventListener("message", (frame) => {
        let event: ServerEvent;
        try {
          event = JSON.parse(String(frame.data)) as ServerEvent;
        } catch {
          return;
        }

        if (event.type === "joined") {
          if (event.room.slug !== activeRef.current) return;
          setError("");
          setMessages(event.messages);
          setTopic(event.room.topic);
          return;
        }
        if (event.type === "message:created") {
          if (event.message.roomSlug !== activeRef.current) return;
          setMessages((items) =>
            items.some((item) => item.id === event.message.id)
              ? items.map((item) =>
                  item.id === event.message.id ? event.message : item,
                )
              : [...items, event.message],
          );
          return;
        }
        if (event.type === "message:status") {
          if (event.message.roomSlug !== activeRef.current) return;
          setMessages((items) =>
            items.map((item) =>
              item.id === event.message.id ? event.message : item,
            ),
          );
          return;
        }
        if (event.type === "message:accepted") {
          pendingMessages.current.delete(event.requestId);
          return;
        }

        setError(event.message);
        if (event.requestId) {
          const pending = pendingMessages.current.get(event.requestId);
          if (pending) {
            pendingMessages.current.delete(event.requestId);
            setContent((current) => current || pending);
          }
        }
      });
      client.addEventListener("error", () => {
        setError("The chat connection encountered an error.");
      });
      client.addEventListener("close", () => {
        if (socket.current === client) socket.current = null;
        if (cancelled) return;
        setError("Chat disconnected. Reconnecting…");
        reconnectTimer = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
      });
    };
    connect();
    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket.current?.close();
    };
  }, [joinRoom]);

  function changeRoom(slug: string) {
    if (slug === active) return;
    activeRef.current = slug;
    setActive(slug);
    setMessages([]);
    setTopic(null);
    if (socket.current) joinRoom(socket.current, slug);
  }
  function send(event: React.FormEvent) {
    event.preventDefault();
    if (
      !content.trim() ||
      !socket.current ||
      socket.current.readyState !== WebSocket.OPEN
    )
      return;
    const sent = content;
    const requestId = crypto.randomUUID();
    pendingMessages.current.set(requestId, sent);
    setContent("");
    socket.current.send(
      JSON.stringify({ type: "message:send", content: sent, requestId }),
    );
  }
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[15rem_1fr]">
      <aside className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Existing rooms
        </p>
        {rooms
          .filter((room) => room.visibility === "public")
          .map((room) => (
            <button
              key={room.slug}
              onClick={() => changeRoom(room.slug)}
              className={`mb-1 flex w-full px-3 py-3 text-left text-sm font-normal ${active === room.slug ? "bg-black text-white" : "text-body hover:bg-soft"}`}
            >
              {room.name}
            </button>
          ))}
        <p className="mt-5 border-t border-slate-200 px-2 pb-2 pt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
          Your private groups
        </p>
        {rooms.filter((room) => room.visibility === "private").length === 0 && (
          <p className="px-2 py-2 text-xs text-slate-500">
            No private groups yet.
          </p>
        )}
        {rooms
          .filter((room) => room.visibility === "private")
          .map((room) =>
            room.status === "approved" ? (
              <button
                key={room.slug}
                onClick={() => changeRoom(room.slug)}
                className={`mb-1 flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm font-normal ${active === room.slug ? "bg-black text-white" : "text-body hover:bg-soft"}`}
              >
                <span>{room.name}</span>
                {room.isCreator && (
                  <span className="text-[10px] uppercase">Owner</span>
                )}
              </button>
            ) : room.status === "denied" ? (
              <Link
                key={room.slug}
                href={`/chat-rooms/private/${room.id}/edit`}
                className="mb-1 flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-red-800 hover:bg-red-50"
              >
                <span aria-hidden="true">●</span>
                <span>{room.name} — denied; edit and appeal</span>
              </Link>
            ) : (
              <div
                key={room.slug}
                className="mb-1 flex w-full items-start gap-2 px-3 py-3 text-left text-sm text-amber-800"
              >
                <span aria-label="Awaiting approval" title="Awaiting approval">
                  ⚠
                </span>
                <span>
                  {room.name}
                  <span className="block text-xs">Awaiting approval</span>
                </span>
              </div>
            ),
          )}
        <Link
          href="/chat-rooms/private/new"
          className="mt-4 block border border-black px-3 py-3 text-center text-sm font-bold text-black hover:bg-black hover:text-white"
        >
          Create a private group
        </Link>
      </aside>
      <section className="flex min-h-[34rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4">
          <div>
            <h2 className="font-bold">
              {rooms.find((room) => room.slug === active)?.name}
            </h2>
            {topic && (
              <p className="mt-1 text-sm text-blue-800">
                <span className="font-bold">Current topic:</span> {topic}
              </p>
            )}
          </div>
          {rooms.find((room) => room.slug === active)?.visibility ===
            "private" &&
            (rooms.find((room) => room.slug === active)?.isCreator ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-900">
                  Owner
                </span>
                <form action={closePrivateGroup}>
                  <input type="hidden" name="slug" value={active} />
                  <button className="border border-red-700 px-3 py-2 text-xs font-bold text-red-700">
                    Close group
                  </button>
                </form>
              </div>
            ) : (
              <form action={leavePrivateGroup}>
                <input type="hidden" name="slug" value={active} />
                <button className="bg-black px-4 py-2 text-sm font-bold text-white">
                  Leave
                </button>
              </form>
            ))}
        </div>
        {rooms.find((room) => room.slug === active)?.visibility === "private" &&
          rooms.find((room) => room.slug === active)?.isCreator && (
            <div className="border-b border-slate-200 bg-amber-50 p-4">
              <form
                action={addPrivateGroupMember}
                className="flex flex-wrap items-end gap-2"
              >
                <input type="hidden" name="slug" value={active} />
                <label className="min-w-60 flex-1 text-xs font-bold uppercase tracking-wider">
                  Add member by username or email
                  <input
                    name="identifier"
                    required
                    className="input mt-1 bg-white"
                    placeholder="username or student@email.com"
                  />
                </label>
                <button className="button-primary min-h-11 px-5">
                  Add member
                </button>
              </form>
              <p className="mt-2 text-xs text-slate-600">
                Members:{" "}
                {rooms
                  .find((room) => room.slug === active)
                  ?.memberUsernames.join(", ") || "None yet"}
              </p>
            </div>
          )}
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
          {messages.length === 0 && (
            <p className="text-sm text-slate-500">
              No approved messages yet. Be the first to contribute.
            </p>
          )}
          {messages.map((message) => (
            <article
              key={message.id}
              className={`max-w-[85%] rounded-xl p-3 ${message.senderId === currentUserId ? "ml-auto bg-blue-900 text-white" : "bg-white text-slate-800 shadow-sm"}`}
            >
              <p className="text-xs font-bold opacity-80">
                {message.senderId === currentUserId
                  ? "You"
                  : message.senderName}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {message.content}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                <time>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
                {message.moderationStatus === "pending" && (
                  <span
                    title="This message is under moderation"
                    className="text-yellow-300"
                  >
                    ⚠ Under moderation
                  </span>
                )}
                {message.moderationStatus === "rejected" && (
                  <span title="Message rejected" className="text-red-300">
                    🔴 Rejected
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
        {error && <p className="px-4 pt-3 text-sm text-red-700">{error}</p>}
        <form
          onSubmit={send}
          className="flex gap-2 border-t border-slate-200 p-3"
        >
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={2000}
            aria-label="Chat message"
            placeholder="Write a message…"
            className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3"
          />
          <button className="button-primary min-h-11 px-5">Send</button>
        </form>
      </section>
    </div>
  );
}
