import { type Editor } from "tldraw";
import { type Board } from "./workspace";

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

export interface CurrentUser {
  id: string;
  name: string;
}

export interface WhiteboardEditorProps {
  board: Board;
  currentUser: CurrentUser;
  licenseKey?: string;
  isReadonly?: boolean;
}

export interface WhiteboardCanvasProps {
  boardId: string;
  workspaceId: string;
  initialCanvasData: unknown;
  editorRef: React.RefObject<Editor | null>;
  currentUser: CurrentUser;
  licenseKey?: string;
  isReadonly?: boolean;
}
