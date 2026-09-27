import { AppShell } from "@/components/layout/app-shell";
import { ChatRoomClient } from "@/components/chat/chat-room-client";
import { ChatRoom, connectChatDatabase } from "@/lib/chat/db";
import { INITIAL_CHAT_ROOMS } from "@/lib/chat/types";
import { requirePaidStudent } from "@/lib/auth/guards";
import { issueSocketAuthentication } from "@/lib/chat/socket-auth";
import { DEMO_AUTH_BYPASS_ENABLED } from "@/lib/auth/demo";

export const dynamic = "force-dynamic";

export default async function ChatRoomsPage({
  searchParams,
}: {
  searchParams: Promise<{
    submitted?: string;
    memberAdded?: string;
    memberError?: string;
    left?: string;
    closed?: string;
    room?: string;
  }>;
}) {
  const { profile, entitlement } = await requirePaidStudent("/chat-rooms");
  const params = await searchParams;
  const socketAuthTicket = DEMO_AUTH_BYPASS_ENABLED
    ? "demo"
    : await issueSocketAuthentication({
        id: profile.id,
        name: profile.username,
        accessExpiresAt:
          entitlement.currentPeriodEnd ?? new Date().toISOString(),
      });
  let rooms: {
    id: string;
    slug: string;
    name: string;
    topic: string | null;
    visibility: "public" | "private";
    status: "pending" | "approved" | "denied";
    isCreator: boolean;
    memberUsernames: string[];
  }[] = INITIAL_CHAT_ROOMS.map((room) => ({
    id: room.slug,
    ...room,
    topic: null as string | null,
    visibility: "public" as const,
    status: "approved" as const,
    isCreator: false,
    memberUsernames: [],
  }));
  if (process.env.MONGODB_URI) {
    await connectChatDatabase();
    rooms = (
      await ChatRoom.find({
        $or: [
          { visibility: { $ne: "private" } },
          {
            visibility: "private",
            status: { $ne: "closed" },
            $or: [
              { createdBy: profile.id },
              { "members.userId": profile.id, status: "approved" },
            ],
          },
        ],
      })
        .sort({ visibility: 1, name: 1 })
        .lean()
    ).map((room) => ({
      id: room._id.toString(),
      slug: room.slug,
      name: room.name,
      topic: room.topic || null,
      visibility: room.visibility === "private" ? "private" : "public",
      status:
        room.visibility === "private" && room.status !== "closed"
          ? room.status
          : "approved",
      isCreator: room.createdBy === profile.id,
      memberUsernames: (room.members ?? []).map((member) => member.username),
    }));
  }
  return (
    <AppShell title="Chat rooms" name={profile.fullName}>
      <div className="mt-3 max-w-3xl leading-7 text-slate-700">
        <p>
          Get help from other students who’ve taken the exams, or get
          clarifications on exam registrations etc. Please be respectful in the
          chat rooms, profanities will get you banned, thank you.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Please type @ to get a suggestion of usernames.</li>
          <li>
            Attachments and images cannot be sent for now. Please give feedback
            if you would like that.
          </li>
        </ul>
      </div>
      {(params.submitted ||
        params.memberAdded ||
        params.left ||
        params.closed) && (
        <p
          role="status"
          className="mt-5 border border-green-300 bg-green-50 p-3 text-sm text-green-900"
        >
          {params.submitted
            ? "Your private chat room has been sent for review."
            : params.memberAdded
              ? "The student now has immediate access to this group."
              : params.left
                ? "You have left the private group."
                : "The private group has been closed and its members removed."}
        </p>
      )}
      {params.memberError && (
        <p
          role="alert"
          className="mt-5 border border-red-300 bg-red-50 p-3 text-sm text-red-900"
        >
          {params.memberError}
        </p>
      )}
      <ChatRoomClient
        rooms={rooms}
        currentUserId={profile.id}
        currentUsername={profile.username}
        initialRoom={params.room}
        socketAuthTicket={socketAuthTicket}
      />
    </AppShell>
  );
}
