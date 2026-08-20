import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { requirePaidStudent } from "@/lib/auth/guards";
import { ChatRoom, connectChatDatabase } from "@/lib/chat/db";
import { resubmitPrivateGroup } from "../../../actions";

export default async function EditPrivateGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { groupId } = await params;
  const { profile } = await requirePaidStudent(
    `/chat-rooms/private/${groupId}/edit`,
  );
  if (!mongoose.isValidObjectId(groupId)) notFound();

  await connectChatDatabase();
  const room = await ChatRoom.findOne({
    _id: groupId,
    createdBy: profile.id,
    visibility: "private",
    status: "denied",
  }).lean();
  if (!room) notFound();

  const { error } = await searchParams;
  return (
    <AppShell title="Revise private group request" name={profile.fullName}>
      <p className="mt-3 max-w-2xl leading-7 text-slate-700">
        Update the request and submit it for another review. The group remains
        unavailable until the separate administration module approves it.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-5 border border-red-300 bg-red-50 p-3 text-sm text-red-900"
        >
          {error}
        </p>
      )}
      <form
        action={resubmitPrivateGroup}
        className="mt-6 max-w-3xl space-y-5 border border-line bg-white p-6"
      >
        <input type="hidden" name="groupId" value={groupId} />
        <label className="block text-sm font-semibold">
          Group name
          <input
            name="groupName"
            required
            minLength={3}
            maxLength={80}
            defaultValue={room.name}
            className="input mt-1"
          />
        </label>
        <label className="block text-sm font-semibold">
          Reason for creating the chat room
          <textarea
            name="reason"
            required
            rows={4}
            minLength={10}
            maxLength={1000}
            defaultValue={room.reason ?? ""}
            className="input mt-1 resize-y"
          />
        </label>
        <label className="block text-sm font-semibold">
          What do you aim to achieve through this chat room?
          <textarea
            name="goal"
            required
            rows={8}
            minLength={10}
            maxLength={2000}
            defaultValue={room.goal ?? ""}
            className="input mt-1 resize-y"
          />
        </label>
        <FormSubmitButton pendingLabel="Submitting for review…">
          Resubmit for review
        </FormSubmitButton>
      </form>
    </AppShell>
  );
}
