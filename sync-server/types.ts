import { type TLSocketRoom } from "@tldraw/sync-core";
import type { UnknownRecord } from "tldraw";

export interface RoomSessionMeta {
  token: string;
  userId: string;
  boardId: string;
}

export type SocketType = Parameters<
  TLSocketRoom<UnknownRecord, unknown>["handleSocketConnect"]
>[0]["socket"];
