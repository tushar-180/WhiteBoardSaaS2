import { createServer } from "http";
import { WebSocketServer } from "ws";
import { port } from "./config";
import { handleConnection } from "./connection";
import { rooms } from "./rooms";
import { saveBoardState } from "./persistence";

// Create a basic HTTP server to handle health checks / pings from uptime services
const server = createServer((req, res) => {
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Sync server is awake and healthy.");
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

server.listen(port, () => {
  console.log(`[Sync Server] 🚀 Running on port ${port} (HTTP & WS)`);
});

// Keep connections alive (Render drops idle connections after 100s)
const interval = setInterval(() => {
  wss.clients.forEach((ws: any) => {
    try {
      // Send a standard text frame instead of a native ping control frame.
      // Many proxies (like Render's ALB) ignore control frames for idle timeouts,
      // but will respect text frames and keep the connection alive.
      ws.send(JSON.stringify({ type: "heartbeat" }));
    } catch (e) {
      // ignore
    }
  });
}, 25000); // 25 seconds to stay safely under most 30s/100s proxy limits

wss.on("close", () => {
  clearInterval(interval);
});

wss.on("connection", (socket, req) => {
  handleConnection(socket, req);
});

// Best-effort shutdown handling to persist active boards
const handleShutdown = async (signal: string) => {
  console.log(`[Sync Server] Received ${signal}. Persisting all active rooms before exiting...`);

  const savePromises: Promise<void>[] = [];
  for (const [boardId, room] of rooms.entries()) {
    const sessions = room.getSessions();
    if (sessions.length > 0) {
      const meta = sessions[0].meta;
      if (meta && meta.token) {
        console.log(`[Sync Server] Persisting board ${boardId} on shutdown`);
        savePromises.push(
          saveBoardState(meta.token, boardId, room)
            .then(() => {
              room.close();
            })
            .catch((err: Error) => {
              console.error(`[Sync Server] Failed to save board ${boardId} on shutdown:`, err);
            }),
        );
      }
    }
  }

  await Promise.all(savePromises);
  console.log("[Sync Server] All saves completed. Exiting.");
  process.exit(0);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));