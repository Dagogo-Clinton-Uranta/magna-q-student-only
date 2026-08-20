import {
  ChatBan,
  ChatMessage,
  ChatNotification,
  ChatRoom,
  connectChatDatabase,
} from "../src/lib/chat/db";
import { INITIAL_CHAT_ROOMS } from "../src/lib/chat/types";

async function run() {
  await connectChatDatabase();
  await Promise.all(
    INITIAL_CHAT_ROOMS.map((room) =>
      ChatRoom.updateOne(
        { slug: room.slug },
        {
          $setOnInsert: {
            ...room,
            visibility: "public",
            status: "approved",
            members: [],
          },
        },
        { upsert: true },
      ),
    ),
  );
  await ChatRoom.updateMany(
    { visibility: { $exists: false } },
    { $set: { visibility: "public", status: "approved", members: [] } },
  );
  await Promise.all([
    ChatRoom.syncIndexes(),
    ChatMessage.syncIndexes(),
    ChatBan.syncIndexes(),
    ChatNotification.syncIndexes(),
  ]);
  console.info(
    "Chat MongoDB migration complete: private groups and notification indexes created; four default rooms seeded.",
  );
  process.exit(0);
}
void run().catch((error) => {
  console.error(error);
  process.exit(1);
});
