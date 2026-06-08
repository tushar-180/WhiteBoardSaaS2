"use client";

import { useEffect, useState, useRef } from "react";
import { Tldraw, getSnapshot, loadSnapshot, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import { useWhiteboardStore } from "@/store/use-whiteboard-store";
import { updateBoardCanvasAction } from "@/actions/board";
import { toast } from "sonner";
import { debounce } from "@/lib/utils";
import { type WhiteboardCanvasProps } from "@/types/whiteboard";

export default function WhiteboardCanvas({
  boardId,
  workspaceId,
  initialCanvasData,
  editorRef,
  licenseKey,
}: WhiteboardCanvasProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const setSaveStatus = useWhiteboardStore((state) => state.setSaveStatus);
  const setLastSavedAt = useWhiteboardStore((state) => state.setLastSavedAt);

  // Set the external ref when the internal editor changes
  useEffect(() => {
    editorRef.current = editor;
  }, [editor, editorRef]);

  // Persist the debounced auto-save function across renders while keeping latest parameters
  const debouncedSaveRef = useRef<((editorInstance: Editor) => void) | null>(
    null,
  );

  useEffect(() => {
    debouncedSaveRef.current = debounce(async (editorInstance: Editor) => {
      setSaveStatus("saving");
      try {
        const { document } = getSnapshot(editorInstance.store);
        const cleanDocument = JSON.parse(JSON.stringify(document));
        await updateBoardCanvasAction(workspaceId, boardId, cleanDocument);
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Auto-save error:", error);
        setSaveStatus("error");
        toast.error(
          "Failed to auto-save drawing changes. Your progress is kept in browser memory.",
        );
      }
    }, 2000);
  }, [boardId, workspaceId, setSaveStatus, setLastSavedAt]);

  // Handle load snapshot and change listener when editor is ready
  useEffect(() => {
    if (!editor) return;

    // 1. Load initial data if present and not empty
    if (
      initialCanvasData &&
      typeof initialCanvasData === "object" &&
      Object.keys(initialCanvasData).length > 0
    ) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        loadSnapshot(editor.store, { document: initialCanvasData as any });
      } catch (error) {
        console.error("Error loading canvas snapshot:", error);
      }
    }

    // Mark as initially saved once loaded
    setSaveStatus("saved");

    // 2. Listen to document store changes (excluding viewport camera moves, selection, cursors)
    const cleanup = editor.store.listen(
      () => {
        setSaveStatus("unsaved");
        if (debouncedSaveRef.current) {
          debouncedSaveRef.current(editor);
        }
      },
      { source: "user", scope: "document" },
    );

    return () => {
      cleanup();
    };
  }, [editor, initialCanvasData, setSaveStatus]);

  return (
    <div className="w-full h-full relative">
      <Tldraw
        licenseKey={licenseKey}
        onMount={(editorInstance) => {
          setEditor(editorInstance);
        }}
      />
    </div>
  );
}
