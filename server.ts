import { createServer } from "node:http";
import next from "next";
import { WebSocketServer } from "ws";
import { registerChatWebSocket } from "./src/lib/chat/websocket-hub";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

void app.prepare().then(() => {
  const httpServer = createServer(handler);
  const websocketServer = new WebSocketServer({
    server: httpServer,
    path: "/api/chat/socket",
  });
  websocketServer.on("connection", registerChatWebSocket);
  httpServer.listen(Number(process.env.PORT || 3000), () =>
    console.info("MediNexus web and WebSocket server ready."),
  );
});
