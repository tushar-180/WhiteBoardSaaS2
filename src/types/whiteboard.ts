import { type Editor } from "tldraw";
import { type Board } from "./workspace";

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

export interface WhiteboardEditorProps {
  board: Board;
  licenseKey?: string;
  isReadonly?: boolean;
}

export interface WhiteboardCanvasProps {
  boardId: string;
  workspaceId: string;
  initialCanvasData: unknown;
  editorRef: React.RefObject<Editor | null>;
  licenseKey?: string;
  isReadonly?: boolean;
}
