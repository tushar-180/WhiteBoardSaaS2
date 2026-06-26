import {
  TLSocketRoom,
  InMemorySyncStorage,
  type RoomSnapshot,
} from "@tldraw/sync-core";
import { saveBoardState } from "./persistence";
import { type RoomSessionMeta } from "./types";
import type { TLStoreSnapshot, UnknownRecord } from "tldraw";

/**
 * Converts a standard tldraw Store snapshot to a Room snapshot structure.
 */
function convertStoreSnapshotToRoomSnapshot(
  snapshot: RoomSnapshot | TLStoreSnapshot,
): RoomSnapshot {
  if ("documents" in snapshot) {
    return snapshot;
  }
  return {
    clock: 0,
    documentClock: 0,
    documents: Object.values(snapshot.store).map((state) => ({
      state,
      lastChangedClock: 0,
    })),
    schema: snapshot.schema,
    tombstones: {},
  };
}

// In-memory room registry
export const rooms = new Map<
  string,
  TLSocketRoom<UnknownRecord, RoomSessionMeta>
>();

/**
 * Returns an existing TLSocketRoom for the board or creates and hydrates a new one.
 */
export async function getOrCreateRoom(
  boardId: string,
  initialCanvasData: unknown,
): Promise<TLSocketRoom<UnknownRecord, RoomSessionMeta>> {
  let room = rooms.get(boardId);
  if (room) {
    return room;
  }

  console.log(`[Sync Server] Creating new room for board ${boardId}`);

  // Hydrate room storage from database canvas_data if available
  const hasSnapshot =
    initialCanvasData &&
    typeof initialCanvasData === "object" &&
    Object.keys(initialCanvasData).length > 0;

  // storage to maintain data of board in room
  const storage = new InMemorySyncStorage({
    snapshot: hasSnapshot
      ? convertStoreSnapshotToRoomSnapshot(initialCanvasData as TLStoreSnapshot)
      : undefined,
  });

  room = new TLSocketRoom<UnknownRecord, RoomSessionMeta>({
    storage,
    onSessionRemoved: (r, { sessionId, numSessionsRemaining, meta }) => {
      console.log(
        `[Sync Server] Session ${sessionId} left room ${meta.boardId}. Sessions remaining: ${numSessionsRemaining}`,
      );

      // Clean up and save when room is completely empty
      if (numSessionsRemaining === 0) {
        console.log(
          `[Sync Server] Room ${meta.boardId} is empty. Closing room and persisting final state.`,
        );

        // Execute final save and delete registry entry
        saveBoardState(meta.token, meta.boardId, r)
          .catch((err: Error) => {
            console.error(
              `[Sync Server] Failed to save final state for board ${meta.boardId}:`,
              err,
            );
          })
          .finally(() => {
            r.close();
            rooms.delete(meta.boardId);
            console.log(`[Sync Server] Room ${meta.boardId} fully cleaned up.`);
          });
      }
    },
  });

  // Set up debounced autosave (30-second debounce)
  let saveTimeout: NodeJS.Timeout | null = null;
  const debouncedSave = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      if (!room || room.isClosed()) return;

      const sessions = room.getSessions();
      if (sessions.length === 0) return;

      // Select an active session to authorize the autosave mutation
      const activeSession =
        sessions.find((s) => s.isConnected && !s.isReadonly) || sessions[0];
      if (!activeSession || !activeSession.meta) return;

      console.log(`[Sync Server] Autosaving board ${boardId}`);
      try {
        // Broadcast saving state to connected clients
        for (const session of room.getSessions()) {
          if (session.isConnected) {
            room.sendCustomMessage(session.sessionId, {
              type: "autosave:saving",
            });
          }
        }

        await saveBoardState(activeSession.meta.token, boardId, room);

        // Broadcast saved state with current time
        for (const session of room.getSessions()) {
          if (session.isConnected) {
            room.sendCustomMessage(session.sessionId, {
              type: "autosave:saved",
              lastSavedAt: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error(
          `[Sync Server] Autosave failed for board ${boardId}:`,
          err,
        );
        // Broadcast error state
        for (const session of room.getSessions()) {
          if (session.isConnected) {
            room.sendCustomMessage(session.sessionId, {
              type: "autosave:error",
            });
          }
        }
      }
    }, 30000);
  };

  // Listen for canvas document clock updates to trigger autosave
  storage.onChange(() => {
    debouncedSave();
  });

  rooms.set(boardId, room);
  return room;
}
