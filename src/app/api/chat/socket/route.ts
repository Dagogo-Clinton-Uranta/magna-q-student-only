import { experimental_upgradeWebSocket } from "@vercel/functions";
import { registerChatWebSocket } from "@/lib/chat/websocket-hub";

export const runtime = "nodejs";
export const maxDuration = 300;

export function GET() {
  return experimental_upgradeWebSocket((socket) => {
    registerChatWebSocket(socket);
  });
}
