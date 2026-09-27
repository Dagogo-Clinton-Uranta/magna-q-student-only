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
  | { type: "message:updated"; message: ChatMessageDto }
  | { type: "message:deleted"; roomSlug: string; messageId: string }
  | { type: "message:status"; message: ChatMessageDto }
  | { type: "message:accepted"; requestId: string }
  | { type: "error"; message: string; requestId?: string };

export function ChatRoomClient({
  rooms,
  currentUserId,
  currentUsername,
  initialRoom,
  socketAuthTicket,
}: {
  rooms: Room[];
  currentUserId: string;
  currentUsername: string;
  initialRoom?: string;
  socketAuthTicket: string;
}) {
  const [active, setActive] = useState(
    rooms.some(
      (room) => room.status === "approved" && room.slug === initialRoom,
    )
      ? initialRoom!
      : rooms.find((room) => room.status === "approved")?.slug || "",
  );
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [topic, setTopic] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionRange, setMentionRange] = useState<[number, number] | null>(
    null,
  );
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const socket = useRef<WebSocket | null>(null);
  const textarea = useRef<HTMLTextAreaElement | null>(null);
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
          if (
            event.message.senderId !== currentUserId &&
            new RegExp(`(^|\\s)@${currentUsername}(?=\\b)`, "i").test(
              event.message.content,
            )
          ) {
            window.dispatchEvent(new Event("chat-mention-notification"));
          }
          setMessages((items) =>
            items.some((item) => item.id === event.message.id)
              ? items.map((item) =>
                  item.id === event.message.id ? event.message : item,
                )
              : [...items, event.message],
          );
          return;
        }
        if (event.type === "message:updated") {
          if (event.message.roomSlug !== activeRef.current) return;
          setMessages((items) =>
            items.map((item) =>
              item.id === event.message.id ? event.message : item,
            ),
          );
          return;
        }
        if (event.type === "message:deleted") {
          if (event.roomSlug !== activeRef.current) return;
          setMessages((items) =>
            items.filter((item) => item.id !== event.messageId),
          );
          setEditingMessageId((current) => {
            if (current !== event.messageId) return current;
            setEditingContent("");
            return null;
          });
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

  useEffect(() => {
    if (mentionQuery === null) {
      setMentionSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/chat/mentions?q=${encodeURIComponent(mentionQuery)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const result = (await response.json()) as { suggestions?: string[] };
        if (response.ok) setMentionSuggestions(result.suggestions ?? []);
      } catch (mentionError) {
        if (!(
          mentionError instanceof DOMException &&
          mentionError.name === "AbortError"
        )) {
          setMentionSuggestions([]);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [mentionQuery]);

  function updateContent(nextContent: string, cursor: number) {
    setContent(nextContent);
    const match = nextContent.slice(0, cursor).match(/(?:^|\s)@([a-z0-9_]*)$/i);
    if (!match) {
      setMentionQuery(null);
      setMentionRange(null);
      return;
    }
    const query = match[1] ?? "";
    setMentionQuery(query.toLowerCase());
    setMentionRange([cursor - query.length - 1, cursor]);
  }

  function selectMention(username: string) {
    if (!mentionRange) return;
    const [start, end] = mentionRange;
    const nextContent = `${content.slice(0, start)}@${username} ${content.slice(end)}`;
    const nextCursor = start + username.length + 2;
    setContent(nextContent);
    setMentionQuery(null);
    setMentionRange(null);
    setMentionSuggestions([]);
    requestAnimationFrame(() => {
      textarea.current?.focus();
      textarea.current?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function formatSelectedLines(kind: "header" | "bullet") {
    const input = textarea.current;
    if (!input) return;
    const lineStart = content.lastIndexOf("\n", input.selectionStart - 1) + 1;
    const nextBreak = content.indexOf("\n", input.selectionEnd);
    const lineEnd = nextBreak === -1 ? content.length : nextBreak;
    const selected = content.slice(lineStart, lineEnd);
    const prefix = kind === "header" ? "## " : "- ";
    const prefixPattern = kind === "header" ? /^#{1,3}\s+/ : /^[-*]\s+/;
    const lines = selected.split("\n");
    const allFormatted = lines.every((line) => prefixPattern.test(line));
    const formatted = lines
      .map((line) =>
        allFormatted
          ? line.replace(prefixPattern, "")
          : `${prefix}${line.replace(prefixPattern, "")}`,
      )
      .join("\n");
    const nextContent = `${content.slice(0, lineStart)}${formatted}${content.slice(lineEnd)}`;
    setContent(nextContent);
    setMentionQuery(null);
    setMentionRange(null);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(lineStart, lineStart + formatted.length);
    });
  }

  function changeRoom(slug: string) {
    if (slug === active) return;
    activeRef.current = slug;
    setActive(slug);
    setMessages([]);
    setTopic(null);
    if (socket.current) joinRoom(socket.current, slug);
  }
  function editMessage(message: ChatMessageDto) {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  }

  function saveEditedMessage(event: React.FormEvent) {
    event.preventDefault();
    if (
      !editingMessageId ||
      !editingContent.trim() ||
      !socket.current ||
      socket.current.readyState !== WebSocket.OPEN
    )
      return;
    socket.current.send(
      JSON.stringify({
        type: "message:edit",
        messageId: editingMessageId,
        content: editingContent,
        requestId: crypto.randomUUID(),
      }),
    );
    setEditingMessageId(null);
    setEditingContent("");
  }

  function deleteMessage(messageId: string) {
    if (
      !window.confirm("Delete this message permanently?") ||
      !socket.current ||
      socket.current.readyState !== WebSocket.OPEN
    )
      return;
    socket.current.send(
      JSON.stringify({
        type: "message:delete",
        messageId,
        requestId: crypto.randomUUID(),
      }),
    );
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
              {editingMessageId === message.id ? (
                <form onSubmit={saveEditedMessage} className="mt-2 space-y-2">
                  <textarea
                    rows={5}
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    maxLength={2000}
                    autoFocus
                    aria-label="Edit chat message"
                    className="w-full resize-y rounded border border-blue-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded bg-white px-3 py-1.5 text-xs font-bold text-blue-900"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMessageId(null);
                        setEditingContent("");
                      }}
                      className="rounded border border-current px-3 py-1.5 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <ChatMessageContent content={message.content} />
              )}
              <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                <time dateTime={message.createdAt}>
                  {new Date(message.createdAt).toLocaleString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
                {message.editedAt && <span>(edited)</span>}
                {message.senderId === currentUserId &&
                  editingMessageId !== message.id && (
                    <>
                      <button
                        type="button"
                        onClick={() => editMessage(message)}
                        aria-label="Edit message"
                        title="Edit message"
                        className="rounded p-1 hover:bg-black/10"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMessage(message.id)}
                        aria-label="Delete message"
                        title="Delete message"
                        className="rounded p-1 hover:bg-red-500/20"
                      >
                        <DeleteIcon />
                      </button>
                    </>
                  )}
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
        <form onSubmit={send} className="border-t border-slate-200 p-3">
          <div
            className="mb-2 flex gap-2"
            role="toolbar"
            aria-label="Message formatting"
          >
            <button
              type="button"
              onClick={() => formatSelectedLines("header")}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm font-bold hover:bg-slate-100"
              title="Format selected lines as headings"
            >
              Header
            </button>
            <button
              type="button"
              onClick={() => formatSelectedLines("bullet")}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm font-bold hover:bg-slate-100"
              title="Format selected lines as bullet points"
            >
              • Bullets
            </button>
          </div>
          <div className="relative flex items-end gap-2">
            <textarea
              ref={textarea}
              rows={5}
              value={content}
              onChange={(event) =>
                updateContent(event.target.value, event.target.selectionStart)
              }
              onClick={(event) =>
                updateContent(
                  event.currentTarget.value,
                  event.currentTarget.selectionStart,
                )
              }
              maxLength={2000}
              aria-label="Chat message"
              aria-autocomplete="list"
              aria-controls="chat-mention-suggestions"
              placeholder="Write a message… Type @ to mention someone."
              className="min-h-32 flex-1 resize-y rounded-lg border border-slate-300 px-3 py-2"
            />
            {mentionQuery !== null && mentionSuggestions.length > 0 && (
              <ul
                id="chat-mention-suggestions"
                className="absolute bottom-full left-0 z-20 mb-2 max-h-56 w-full max-w-sm overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
              >
                {mentionSuggestions.map((username) => (
                  <li key={username}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectMention(username)}
                      className="w-full rounded px-3 py-2 text-left text-sm hover:bg-blue-50"
                    >
                      @{username}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button className="button-primary min-h-11 px-5">Send</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="1.7"
    >
      <path
        d="m4 14.5-.5 2 2-.5L15 6.5 13.5 5 4 14.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m12.5 6 1.5 1.5" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="1.7"
    >
      <path
        d="M4 6h12M8 3h4l1 3H7l1-3ZM6 6l.7 11h6.6L14 6M8.5 9v5M11.5 9v5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatMessageContent({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (/^#{1,3}\s+/.test(line)) {
      blocks.push(
        <h3 key={index} className="mt-2 text-base font-bold first:mt-1">
          {renderMentions(line.replace(/^#{1,3}\s+/, ""))}
        </h3>,
      );
      index += 1;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      const start = index;
      while (index < lines.length && /^[-*]\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={start} className="my-1 list-disc space-y-1 pl-5 text-sm">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderMentions(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    blocks.push(
      <p key={index} className="min-h-[1em] whitespace-pre-wrap text-sm">
        {renderMentions(line)}
      </p>,
    );
    index += 1;
  }

  return <div className="mt-1">{blocks}</div>;
}

function renderMentions(text: string) {
  return text.split(/(@[a-z0-9_]{3,24})/gi).map((part, index) =>
    /^@[a-z0-9_]{3,24}$/i.test(part) ? (
      <strong key={index} className="decoration-current/40 font-bold underline">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}
