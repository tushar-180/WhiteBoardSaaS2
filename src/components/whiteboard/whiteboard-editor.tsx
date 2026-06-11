"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSnapshot, type Editor } from "tldraw";
import { useWhiteboardStore } from "@/store/use-whiteboard-store";
import { updateBoardCanvasAction } from "@/actions/board";
import { toast } from "sonner";
import { type WhiteboardEditorProps } from "@/types/whiteboard";
import { ROUTES } from "@/lib/constants";
import { createClient } from "@/utils/supabase/client";
import WhiteboardSaveStatus from "./whiteboard-save-status";

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
          toast.error("Access revoked. You have been removed from this workspace.");
        } else {
          setLocalIsReadonly(member.role === "viewer");
        }
      } catch (err) {
        console.error("[Realtime Check] Failed to verify user role:", err);
      }
    };

    // Listen to changes on workspace_members for this user
    const channel = supabase
      .channel(`member-role-${board.workspace_id}-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_members",
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log("[Realtime] Received workspace member update:", payload);
          if (payload.eventType === "DELETE") {
            verifyAccess();
          } else if (payload.eventType === "UPDATE") {
            const updatedMember = payload.new as { workspace_id: string; role: string };
            if (updatedMember.workspace_id === board.workspace_id) {
              setLocalIsReadonly(updatedMember.role === "viewer");
            }
          }
        }
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
      toast.success("Board saved to cloud successfully!");
    } catch (error) {
      console.error("Manual save error:", error);
      setSaveStatus("error");
      toast.error(
        "Failed to save board drawing. Please check your connection.",
      );
    }
  };

  if (isKicked) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-radial from-background/90 via-background to-background z-50 p-6 animate-in fade-in duration-300">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Subtle red ambient glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex p-3 rounded-full bg-destructive/10 border border-destructive/20 text-destructive animate-pulse">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-2 relative z-10">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              You are no longer in this workspace
            </h1>
            <p className="text-sm text-muted-foreground">
              Your access has been revoked or your membership has been removed by the workspace administrator.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href={ROUTES.WORKSPACES}
              className="inline-flex w-full items-center justify-center h-10 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-md transition-all duration-200 active:scale-98 cursor-pointer"
            >
              Go to Workspaces
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
