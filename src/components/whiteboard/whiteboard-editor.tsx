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

// Dynamically import the tldraw component with SSR disabled.
// The `loading` prop shows only a subtle dot-grid background (no text/spinner)
// so the canvas area is never blank while tldraw downloads.
// All actual loading indicators live inside WhiteboardCanvas to avoid cascading spinners.
const WhiteboardCanvas = dynamic(() => import("./whiteboard-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 w-full h-[calc(100vh-64px)] bg-background relative">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  ),
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
  const [localCurrentUserRole, setLocalCurrentUserRole] = useState(currentUser.role);
  const [isKicked, setIsKicked] = useState(false);

  // Subscribe to real-time changes to the user's role/membership in the workspace
  // This is deferred with requestIdleCallback to avoid blocking the main thread
  // during the critical tldraw canvas bootstrap (the primary UI concern).
  useEffect(() => {
    let teardown: (() => void) | undefined;

    const setupRealtime = () => {
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
            setIsKicked(true);
            toast.error(
              "Access revoked. You have been removed from this workspace.",
            );
          } else {
            setLocalIsReadonly(member.role === "viewer");
            setLocalCurrentUserRole(member.role);
          }
        } catch (err) {
          console.error("[Realtime Check] Failed to verify user role:", err);
        }
      };

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
            // Payload received — verify access below
            if (payload.eventType === "DELETE") {
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
                setLocalCurrentUserRole(updatedMember.role);
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

      verifyAccess();

      const handleFocus = () => {
        verifyAccess();
      };
      window.addEventListener("focus", handleFocus);

      // Store cleanup so it's called when the effect tears down
      teardown = () => {
        isMounted = false;
        supabase.removeChannel(channel);
        window.removeEventListener("focus", handleFocus);
      };
    };

    // Defer realtime subscription setup to avoid competing with tldraw bootstrap
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(() => setupRealtime(), { timeout: 2000 });
      return () => {
        cancelIdleCallback(id);
        teardown?.();
      };
    }
    // Fallback if requestIdleCallback is not available (Safari)
    const timer = setTimeout(setupRealtime, 500);
    return () => {
      clearTimeout(timer);
      teardown?.();
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
        // Modern browsers show a confirmation dialog when preventDefault() is called
        // on beforeunload, provided the user has interacted with the page.
        e.preventDefault();
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
      <EditorHeader board={board} onSave={handleManualSave} currentUser={{ ...currentUser, role: localCurrentUserRole }} />

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
