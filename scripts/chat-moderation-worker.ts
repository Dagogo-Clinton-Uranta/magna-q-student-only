import { startChatModerationWorker } from "../src/lib/chat/worker";

void startChatModerationWorker().then((worker) => {
  if (!worker) throw new Error("MONGODB_URI and REDIS_URL must be configured.");
  console.info("Chat moderation worker started.");
});
