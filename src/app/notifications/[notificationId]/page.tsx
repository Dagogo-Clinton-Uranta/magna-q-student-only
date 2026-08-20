import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import { ChatNotification, connectChatDatabase } from "@/lib/chat/db";

export default async function OpenNotificationPage({
  params,
}: {
  params: Promise<{ notificationId: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { notificationId } = await params;
  if (!mongoose.isValidObjectId(notificationId)) redirect("/dashboard");
  await connectChatDatabase();
  const notification = await ChatNotification.findOneAndUpdate(
    { _id: notificationId, recipientId: profile.id },
    { $set: { readAt: new Date() } },
    { new: true },
  ).lean();
  if (!notification) redirect("/dashboard");
  const href =
    notification.href.startsWith("/") && !notification.href.startsWith("//")
      ? notification.href
      : "/dashboard";
  redirect(href);
}
