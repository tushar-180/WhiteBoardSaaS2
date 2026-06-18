"use client";

import { useEffect, useState } from "react";
import { Tldraw, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      }, 10000); // 10 seconds connection timeout
      return () => {
        clearTimeout(timer);
        setShowTimeoutWarning(false);
      };
    }
  }, [syncStore.status]);

  if (syncStore.status === "loading") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10 z-50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm font-medium">Connecting...</p>
        </div>
        {showTimeoutWarning && (
          <div className="flex flex-col items-center gap-3 mt-6 p-4 bg-background rounded-xl border shadow-sm max-w-sm mx-4">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-semibold">Connection delayed</p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              The sync server is taking longer than expected. It might be sleeping or unreachable.
            </p>
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
              className="w-full mt-2"
            >
              Retry Connection
            </Button>
          </div>
        )}
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
