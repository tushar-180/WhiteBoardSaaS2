import { type IncomingMessage } from "http";
import { type WebSocket } from "ws";
import { randomUUID } from "crypto";
import { port } from "./config";
import { authenticateAndAuthorize } from "./auth";
import { getOrCreateRoom } from "./rooms";
import { type SocketType } from "./types";

/**
 * Handles validation, authentication, and room socket binding.
 */
export async function handleConnection(
  socket: WebSocket,
  req: IncomingMessage,
) {
  // Set up temporary listeners to buffer early messages during async validation
  const messageQueue: unknown[] = [];
  let isClosed = false;

  const handleTempMessage = (data: unknown) => {
    messageQueue.push(data);
  };
  const handleTempClose = () => {
    isClosed = true;
  };

  socket.on("message", handleTempMessage);
  socket.on("close", handleTempClose);

  const cleanupTempListeners = () => {
    socket.off("message", handleTempMessage);
    socket.off("close", handleTempClose);
  };

  const url = new URL(req.url || "", `http://localhost:${port}`);
  const pathname = url.pathname;

  // Pattern: /boards/:boardId
  const match = pathname.match(/^\/boards\/([a-zA-Z0-9-]+)$/);
  if (!match) {
    console.warn(
      `[Sync Server] Rejecting connection: Invalid path ${pathname}`,
    );
    cleanupTempListeners();
    socket.close(4000, "Invalid connection path");
    return;
  }

  const boardId = match[1];
  const token = url.searchParams.get("token");

  if (!token) {
    console.warn(
      `[Sync Server] Rejecting connection to board ${boardId}: Missing auth token`,
    );
    cleanupTempListeners();
    socket.close(4001, "Missing authentication token");
    return;
  }

  try {
    // 1. Authenticate & Authorize user details
    const auth = await authenticateAndAuthorize(token, boardId);

    // 2. Generate unique session ID for this client connection
    const sessionId = randomUUID();
    console.log(
      `[Sync Server] User ${auth.email} joined board ${boardId} with session ID ${sessionId} (readonly: ${auth.isReadonly})`,
    );

    // 3. Get or create room and bind socket
    const room = await getOrCreateRoom(boardId, auth.canvasData);

    // Remove temporary buffers before passing socket to room
    cleanupTempListeners();

    if (isClosed) {
      console.warn(
        `[Sync Server] Client disconnected before connection validation finished for board ${boardId}`,
      );
      return;
    }

    room.handleSocketConnect({
      sessionId,
      socket: socket as unknown as SocketType,
      isReadonly: auth.isReadonly,
      meta: {
        token,
        userId: auth.userId,
        boardId,
      },
    });

    socket.on("close", (code, reason) => {
      console.log(`[Sync Server] Socket closed for session ${sessionId} (code: ${code}, reason: ${reason})`);
    });

    // Replay any messages received during the asynchronous validation phase
    for (const msg of messageQueue) {
      room.handleSocketMessage(
        sessionId,
        msg as string | AllowSharedBufferSource,
      );
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error(
      `[Sync Server] Error handling socket connection for board ${boardId}:`,
      error.message,
    );
    cleanupTempListeners();
    socket.close(4999, error.message || "Internal validation error");
  }
}
