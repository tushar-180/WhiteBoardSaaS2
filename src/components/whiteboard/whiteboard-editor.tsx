"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSnapshot, type Editor } from "tldraw";
import { useWhiteboardStore } from "@/store/use-whiteboard-store";
import { updateBoardCanvasAction } from "@/actions/board";
import { toast } from "sonner";
import { type WhiteboardEditorProps } from "@/types/whiteboard";
import { ROUTES } from "@/lib/constants";
import WhiteboardSaveStatus from "./whiteboard-save-status";

// Dynamically import the tldraw component with SSR disabled
const WhiteboardCanvas = dynamic(() => import("./whiteboard-canvas"), {
  ssr: false,
});

export default function WhiteboardEditor({
  board,
  licenseKey,
  isReadonly,
}: WhiteboardEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const saveStatus = useWhiteboardStore((state) => state.saveStatus);
  const setSaveStatus = useWhiteboardStore((state) => state.setSaveStatus);
  const setLastSavedAt = useWhiteboardStore((state) => state.setLastSavedAt);
  const resetStore = useWhiteboardStore((state) => state.reset);

  // Clean up the store state on unmount
  useEffect(() => {
    return () => {
      resetStore();
    };
  }, [resetStore]);

  // Warn user if they try to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        saveStatus === "unsaved" ||
        saveStatus === "saving" ||
        saveStatus === "error"
      ) {
        e.preventDefault();
        const message = "You have unsaved whiteboard changes.";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e as any).returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveStatus]);

  const handleManualSave = async () => {
    if (!editorRef.current) return;
    setSaveStatus("saving");
    try {
      const { document } = getSnapshot(editorRef.current.store);
      const cleanDocument = JSON.parse(JSON.stringify(document));
      await updateBoardCanvasAction(board.workspace_id, board.id, cleanDocument);
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      toast.success("Board saved to cloud successfully!");
    } catch (error) {
      console.error("Manual save error:", error);
      setSaveStatus("error");
      toast.error("Failed to save board drawing. Please check your connection.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative select-none">
      {/* Top Header */}
      <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`${ROUTES.WORKSPACES}/${board.workspace_id}`}
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
            title="Back to Workspace"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-foreground truncate">
              {board.name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[250px]">
              {board.description || "No description"}
            </span>
          </div>
        </div>

        {/* Real-time Save Status Indicators */}
        <WhiteboardSaveStatus onSave={handleManualSave} />
      </header>

      {/* Drawing Canvas Container */}
      <main className="flex-1 w-full h-[calc(100vh-64px)] relative bg-muted/20">
        <WhiteboardCanvas
          boardId={board.id}
          workspaceId={board.workspace_id}
          initialCanvasData={board.canvas_data}
          editorRef={editorRef}
          licenseKey={licenseKey}
          isReadonly={isReadonly}
        />
      </main>
    </div>
  );
}
