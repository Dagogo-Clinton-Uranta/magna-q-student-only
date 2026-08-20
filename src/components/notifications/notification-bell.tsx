import { getCurrentProfile } from "@/lib/auth/guards";
import { ChatNotification, connectChatDatabase } from "@/lib/chat/db";
import { NotificationBellClient } from "./notification-bell-client";

export async function NotificationBell() {
  const profile = await getCurrentProfile();
  if (!profile || !process.env.MONGODB_URI)
    return <NotificationBellClient items={[]} unreadCount={0} />;

  try {
    await connectChatDatabase();
    const [notifications, unreadCount] = await Promise.all([
      ChatNotification.find({ recipientId: profile.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      ChatNotification.countDocuments({
        recipientId: profile.id,
        readAt: { $exists: false },
      }),
    ]);
    return (
      <NotificationBellClient
        unreadCount={unreadCount}
        items={notifications.map((notification) => ({
          id: notification._id.toString(),
          title: notification.title,
          body: notification.body,
          createdAt: notification.createdAt.toISOString(),
          read: Boolean(notification.readAt),
        }))}
      />
    );
  } catch (error) {
    console.error("Could not load chat notifications.", error);
    return <NotificationBellClient items={[]} unreadCount={0} />;
  }
}
