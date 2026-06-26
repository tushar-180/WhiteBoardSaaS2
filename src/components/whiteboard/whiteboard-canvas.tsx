"use client";

import { useEffect, useRef, useState } from "react";
import { Tldraw, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import { WifiOff } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { type WhiteboardCanvasProps } from "@/types/whiteboard";
import { useWhiteboardSync } from "./hooks/use-whiteboard-sync";
import { useCollaboratorNotifications } from "./hooks/use-collaborator-notifications";

/**
 * Canvas skeleton placeholder shown while the sync server connects.
 * Uses a subtle grid pattern reminiscent of a whiteboard background
 * so the transition to Tldraw feels like the canvas simply "filling in"
 * rather than a swap between two completely different UIs.
 */
function CanvasLoadingPlaceholder({ showTimeout, onRetry }: { showTimeout: boolean; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-background">
      {/* Grid background pattern to mimic a whiteboard */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex flex-col items-center gap-5">
        {/* Pulsing tldraw-style spinner */}
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>

        <div className="space-y-1.5 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Connecting to whiteboard...
          </p>
          <p className="text-xs text-muted-foreground/50 max-w-[220px]">
            Establishing a secure real-time connection
          </p>
        </div>

        {showTimeout && (
          <div className="flex flex-col items-center gap-3 mt-2 p-4 bg-muted/30 rounded-xl border max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <WifiOff className="h-4 w-4" />
              <p className="text-xs font-semibold">Sync server unreachable</p>
            </div>
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              Taking longer than expected. The server may be waking up from inactivity.
            </p>
            <Button onClick={onRetry} size="sm" variant="outline" className="w-full mt-1 text-xs">
              Retry Connection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Single component rendering the collaborative whiteboard canvas.
 * All loading states (sync connection, tldraw SDK) are consolidated here
 * to avoid multiple sequential loading spinners in the UI.
 */
export default function WhiteboardCanvas(props: WhiteboardCanvasProps) {
  const [fatalError, setFatalError] = useState(false);

  if (fatalError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <p className="text-sm font-semibold text-destructive">
            Session Expired
          </p>
          <p className="text-xs text-muted-foreground max-w-[250px]">
            Your session has expired or is invalid. Please refresh the page to securely reconnect.
          </p>
          <Button onClick={() => window.location.reload()} size="sm" variant="outline" className="mt-2 text-xs">
            Refresh Session
          </Button>
        </div>
      </div>
    );
  }

  return <WhiteboardCanvasInner {...props} onFatalError={() => setFatalError(true)} />;
}

function WhiteboardCanvasInner({
  boardId,
  isReadonly,
  editorRef,
  currentUser,
  licenseKey,
  onFatalError,
}: WhiteboardCanvasProps & { onFatalError: () => void }) {
  const syncStore = useWhiteboardSync({ boardId, onFatalError });
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

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
      colorScheme: resolvedTheme === "dark" ? "dark" : "light",
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

  // Sync tldraw colorScheme with app theme
  useEffect(() => {
    if (!editorRef.current) return;
    const colorScheme = resolvedTheme === "dark" ? "dark" : "light";
    editorRef.current.user.updateUserPreferences({ colorScheme });
    if (containerRef.current) {
      containerRef.current.classList.toggle("tl-theme-dark", colorScheme === "dark");
      containerRef.current.classList.toggle("tl-theme-light", colorScheme === "light");
    }
  }, [resolvedTheme, editorRef]);

  // Sync readonly state when prop changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateInstanceState({ isReadonly: !!isReadonly });
    }
  }, [isReadonly, editorRef]);

  // Debug: Check if the component is unmounting unexpectedly
  useEffect(() => {
    console.log(`[Sync Debug] WhiteboardCanvasInner MOUNTED for board ${boardId}`);
    return () => {
      console.log(`[Sync Debug] WhiteboardCanvasInner UNMOUNTED for board ${boardId}`);
    };
  }, [boardId]);

  // Monitor connection loading duration to identify offline sync servers
  useEffect(() => {
    if (syncStore.status === "loading") {
      const timer = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, 10000);
      return () => {
        clearTimeout(timer);
        setShowTimeoutWarning(false);
      };
    }
  }, [syncStore.status]);

  // Single loading state: shown while sync is connecting
  // No separate loading from dynamic import — this is the ONE loading UI
  if (syncStore.status === "loading") {
    return (
      <CanvasLoadingPlaceholder
        showTimeout={showTimeoutWarning}
        onRetry={() => window.location.reload()}
      />
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
          <Button onClick={() => window.location.reload()} size="sm" variant="outline" className="mt-2 text-xs">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative animate-in fade-in duration-200">
      <Tldraw
        store={syncStore.store}
        licenseKey={licenseKey}
        onMount={handleMount}
      />
    </div>
  );
}
