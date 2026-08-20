"use server";

import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePaidStudent } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  ChatBan,
  ChatMessage,
  ChatRoom,
  connectChatDatabase,
} from "@/lib/chat/db";
import {
  createChatNotification,
  notifyAdministrators,
} from "@/lib/chat/notifications";
import {
  groupMemberIdentifierSchema,
  privateGroupRequestSchema,
} from "@/lib/validation/private-group";

function requestInput(formData: FormData) {
  return privateGroupRequestSchema.safeParse({
    groupName: formData.get("groupName"),
    reason: formData.get("reason"),
    goal: formData.get("goal"),
  });
}

export async function createPrivateGroup(formData: FormData) {
  const { profile } = await requirePaidStudent("/chat-rooms/private/new");
  const parsed = requestInput(formData);
  if (!parsed.success)
    redirect("/chat-rooms/private/new?error=Please+complete+all+three+fields.");

  await connectChatDatabase();
  const room = await ChatRoom.create({
    slug: `private-${randomUUID()}`,
    name: parsed.data.groupName,
    topic: null,
    createdBy: profile.id,
    creatorUsername: profile.username,
    visibility: "private",
    status: "pending",
    reason: parsed.data.reason,
    goal: parsed.data.goal,
    members: [],
  });
  await notifyAdministrators({
    title: "New private room request",
    body: `${profile.username} submitted “${room.name}” for review.`,
    href: `/admin/chat-rooms/requests/${room.id}`,
    relatedGroupId: room.id,
  });
  revalidatePath("/chat-rooms");
  redirect("/chat-rooms?submitted=1");
}

export async function resubmitPrivateGroup(formData: FormData) {
  const { profile } = await requirePaidStudent("/chat-rooms");
  const groupId = String(formData.get("groupId"));
  const parsed = requestInput(formData);
  if (!mongoose.isValidObjectId(groupId) || !parsed.success)
    redirect(
      `/chat-rooms/private/${groupId}/edit?error=Please+review+the+form.`,
    );

  await connectChatDatabase();
  const room = await ChatRoom.findOneAndUpdate(
    {
      _id: groupId,
      createdBy: profile.id,
      visibility: "private",
      status: "denied",
    },
    {
      $set: {
        name: parsed.data.groupName,
        reason: parsed.data.reason,
        goal: parsed.data.goal,
        status: "pending",
      },
      $unset: { reviewedBy: 1, reviewedAt: 1 },
    },
    { new: true },
  );
  if (!room) redirect("/chat-rooms?error=That+request+cannot+be+edited.");
  await notifyAdministrators({
    title: "Private room appeal",
    body: `${profile.username} resubmitted “${room.name}” for review.`,
    href: `/admin/chat-rooms/requests/${room.id}`,
    relatedGroupId: room.id,
  });
  revalidatePath("/chat-rooms");
  redirect("/chat-rooms?submitted=1");
}

export async function addPrivateGroupMember(formData: FormData) {
  const { profile } = await requirePaidStudent("/chat-rooms");
  const slug = String(formData.get("slug"));
  const parsed = groupMemberIdentifierSchema.safeParse(
    formData.get("identifier"),
  );
  if (!parsed.success)
    redirect("/chat-rooms?memberError=Enter+a+valid+username+or+email.");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resolve_private_group_member", {
    identifier: parsed.data,
  });
  const member = Array.isArray(data) ? data[0] : null;
  if (error || !member)
    redirect("/chat-rooms?memberError=No+approved+student+was+found.");
  const memberId = String(member.user_id);
  if (memberId === profile.id)
    redirect("/chat-rooms?memberError=You+are+already+the+group+owner.");

  await connectChatDatabase();
  const room = await ChatRoom.findOne({
    slug,
    createdBy: profile.id,
    visibility: "private",
    status: "approved",
  });
  if (!room) redirect("/chat-rooms?memberError=This+group+cannot+be+changed.");
  if (room.members.some((item) => item.userId === memberId))
    redirect("/chat-rooms?memberError=That+student+is+already+a+member.");

  room.members.push({
    userId: memberId,
    username: String(member.username),
    addedAt: new Date(),
  });
  await room.save();
  await createChatNotification({
    recipientId: memberId,
    type: "private_group_member_added",
    title: "You were added to a private group",
    body: `${profile.username} added you to “${room.name}”.`,
    href: "/chat-rooms",
    relatedGroupId: room.id,
  });
  revalidatePath("/chat-rooms");
  redirect("/chat-rooms?memberAdded=1");
}

export async function leavePrivateGroup(formData: FormData) {
  const { profile } = await requirePaidStudent("/chat-rooms");
  const slug = String(formData.get("slug"));
  await connectChatDatabase();
  await ChatRoom.updateOne(
    {
      slug,
      visibility: "private",
      status: "approved",
      createdBy: { $ne: profile.id },
    },
    { $pull: { members: { userId: profile.id } } },
  );
  revalidatePath("/chat-rooms");
  redirect("/chat-rooms?left=1");
}

export async function closePrivateGroup(formData: FormData) {
  const { profile } = await requirePaidStudent("/chat-rooms");
  const slug = String(formData.get("slug"));
  await connectChatDatabase();
  const room = await ChatRoom.findOneAndUpdate(
    {
      slug,
      createdBy: profile.id,
      visibility: "private",
      status: "approved",
    },
    { $set: { status: "closed", members: [], closedAt: new Date() } },
    { new: true },
  );
  if (room)
    await Promise.all([
      ChatMessage.deleteMany({ roomSlug: slug }),
      ChatBan.deleteMany({ roomSlug: slug }),
    ]);
  revalidatePath("/chat-rooms");
  redirect("/chat-rooms?closed=1");
}
