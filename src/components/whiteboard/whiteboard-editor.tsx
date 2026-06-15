"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getSnapshot, type Editor } from "tldraw";
import { useWhiteboardStore } from "@/store/use-whiteboard-store";
import { updateBoardCanvasAction } from "@/actions/board";
import { toast } from "sonner";
import { type WhiteboardEditorProps } from "@/types/whiteboard";
import { createClient } from "@/utils/supabase/client";
import { KickedOverlay } from "./kicked-overlay";
import { EditorHeader } from "./editor-header";
import posthog from "posthog-js";

// Dynamically import the tldraw component with SSR disabled
const WhiteboardCanvas = dynamic(() => import("./whiteboard-canvas"), {
  ssr: false,
});

export default function WhiteboardEditor({
  board,
  currentUser,
  licenseKey,
  isReadonly,
}: WhiteboardEditorProps) {
  const router = useRouter();
  const editorRef = useRef<Editor | null>(null);
  const saveStatus = useWhiteboardStore((state) => state.saveStatus);
  const setSaveStatus = useWhiteboardStore((state) => state.setSaveStatus);
  const setLastSavedAt = useWhiteboardStore((state) => state.setLastSavedAt);
  const resetStore = useWhiteboardStore((state) => state.reset);

  const [localIsReadonly, setLocalIsReadonly] = useState(isReadonly);
  const [isKicked, setIsKicked] = useState(false);

  // Subscribe to real-time changes to the user's role/membership in the workspace
  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const verifyAccess = async () => {
      try {
        const { data: member, error } = await supabase
          .from("workspace_members")
          .select("role")
          .eq("workspace_id", board.workspace_id)
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (!isMounted) return;

        if (error || !member) {
          // No member record found, user is kicked from workspace
          setIsKicked(true);
          toast.error(
            "Access revoked. You have been removed from this workspace.",
          );
        } else {
          setLocalIsReadonly(member.role === "viewer");
        }
      } catch (err) {
        console.error("[Realtime Check] Failed to verify user role:", err);
      }
    };

    // Listen to changes on workspace_members
    const channel = supabase
      .channel(`member-role-${board.workspace_id}-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_members",
        },
        (payload) => {
          console.log("[Realtime] Received workspace member update:", payload);
          if (payload.eventType === "DELETE") {
            // Since DELETE payload.old only contains the primary key ID, we must check if our access was removed
            verifyAccess();
          } else if (payload.eventType === "UPDATE") {
            const updatedMember = payload.new as {
              user_id: string;
              workspace_id: string;
              role: string;
            };
            if (
              updatedMember.user_id === currentUser.id &&
              updatedMember.workspace_id === board.workspace_id
            ) {
              setLocalIsReadonly(updatedMember.role === "viewer");
            }
          } else if (payload.eventType === "INSERT") {
            const newMember = payload.new as {
              user_id: string;
              workspace_id: string;
            };
            if (
              newMember.user_id === currentUser.id &&
              newMember.workspace_id === board.workspace_id
            ) {
              verifyAccess();
            }
          }
        },
      )
      .subscribe();

    // Verify status immediately on mount to capture any race conditions
    verifyAccess();

    // Recheck status when window regains focus (e.g., coming back from lock or background)
    const handleFocus = () => {
      verifyAccess();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
    };
  }, [board.workspace_id, currentUser.id, router]);

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
      await updateBoardCanvasAction(
        board.workspace_id,
        board.id,
        cleanDocument,
      );
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      posthog.capture("board_saved_manually", {
        board_id: board.id,
        workspace_id: board.workspace_id,
      });
      toast.success("Board saved to cloud successfully!");
    } catch (error) {
      console.error("Manual save error:", error);
      posthog.captureException(error);
      setSaveStatus("error");
      toast.error(
        "Failed to save board drawing. Please check your connection.",
      );
    }
  };

  if (isKicked) {
    return <KickedOverlay />;
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative select-none">
      {/* Top Header */}
      <EditorHeader board={board} onSave={handleManualSave} />

      {/* Drawing Canvas Container */}
      <main className="flex-1 w-full h-[calc(100vh-64px)] relative bg-muted/20">
        <WhiteboardCanvas
          key={`${board.id}-${localIsReadonly}`}
          boardId={board.id}
          workspaceId={board.workspace_id}
          initialCanvasData={board.canvas_data}
          editorRef={editorRef}
          currentUser={currentUser}
          licenseKey={licenseKey}
          isReadonly={localIsReadonly}
        />
      </main>
    </div>
  );
}
