import { WebSocketServer } from "ws";
import { port } from "./config";
import { handleConnection } from "./connection";
import { rooms } from "./rooms";
import { saveBoardState } from "./persistence";

const wss = new WebSocketServer({ port });

console.log(`[Sync Server] 🚀 Running on port ${port}`);

wss.on("connection", handleConnection);

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