import { TLSocketRoom } from "@tldraw/sync-core";
import type { UnknownRecord } from "tldraw";
import { type RoomSessionMeta } from "./types";
import { getSupabaseClient } from "./database";

/**
 * Persists the current room snapshot back to the Supabase database.
 * Uses a user's Bearer token to authenticate database writes.
 */
export async function saveBoardState(
  token: string,
  boardId: string,
  room: TLSocketRoom<UnknownRecord, RoomSessionMeta>,
): Promise<void> {
  const supabase = getSupabaseClient(token);

  if (!room.storage.getSnapshot) {
    throw new Error("getSnapshot is not supported by the room's storage");
  }
  const snapshot = room.storage.getSnapshot();

  const { error } = await supabase
    .from("boards")
    .update({
      canvas_data: snapshot,
      updated_at: new Date().toISOString(),
    })
    .eq("id", boardId);

  if (error) {
    console.error(`[Sync Server] Database save failed for board ${boardId}:`, error.message);
    throw error;
  }

  console.log(`[Sync Server] Snapshot saved successfully to database for board ${boardId}`);
}
