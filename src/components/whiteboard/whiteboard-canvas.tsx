"use client";

import { useEffect, useState } from "react";
import { Tldraw, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import { type WhiteboardCanvasProps } from "@/types/whiteboard";
import { useWhiteboardSync } from "./hooks/use-whiteboard-sync";
import { useCollaboratorNotifications } from "./hooks/use-collaborator-notifications";

/**
 * Clean & modular component rendering the collaborative whiteboard canvas.
 */
export default function WhiteboardCanvas({
  boardId,
  isReadonly,
  editorRef,
  currentUser,
  licenseKey,
}: WhiteboardCanvasProps) {
  const syncStore = useWhiteboardSync({ boardId });
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useCollaboratorNotifications({
    store: syncStore.store,
    userId: currentUser.id,
    userName: currentUser.name,
  });

  // Handle editor mount
  const handleMount = (editorInstance: Editor) => {
    editorRef.current = editorInstance;
    editorInstance.updateInstanceState({ isReadonly: !!isReadonly });
    editorInstance.user.updateUserPreferences({
      id: currentUser.id,
      name: currentUser.name,
    });
  };

  // Keep editor user preferences in sync
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.user.updateUserPreferences({
        id: currentUser.id,
        name: currentUser.name,
      });
    }
  }, [currentUser.name, currentUser.id, editorRef]);

  // Sync readonly state when prop changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateInstanceState({ isReadonly: !!isReadonly });
    }
  }, [isReadonly, editorRef]);

  // Monitor connection loading duration to identify offline sync servers
  useEffect(() => {
    if (syncStore.status === "loading") {
      const timer = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, 10000); // 5 seconds connection timeout
      return () => {
        clearTimeout(timer);
        setShowTimeoutWarning(false);
      };
    }
  }, [syncStore.status]);

  if (syncStore.status === "loading") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4 text-center px-4 max-w-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-foreground">
            Connecting to collaboration session...
          </p>
          {showTimeoutWarning && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground">
                The connection is taking longer than usual. The server might be offline or unreachable.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow transition-all duration-200"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (syncStore.status === "error") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <p className="text-sm font-semibold text-destructive">
            Connection failed
          </p>
          <p className="text-xs text-muted-foreground max-w-[250px]">
            We are having trouble connecting to the realtime sync server.
            Retrying...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Tldraw
        store={syncStore.store}
        licenseKey={licenseKey}
        onMount={handleMount}
      />
    </div>
  );
}
