import { useCallback, useMemo, useEffect, useRef } from "react";
import { useSync } from "@tldraw/sync";
import { inlineBase64AssetStore } from "tldraw";
import { useWhiteboardStore } from "@/store/use-whiteboard-store";
import { getSyncUri } from "../utils/sync-uri";

interface UseWhiteboardSyncOptions {
  boardId: string;
  onFatalError?: () => void;
}

/**
 * Custom hook to initialize the multiplayer synchronized store using @tldraw/sync,
 * handle custom messages from the sync server regarding autosave, and sync status to state.
 */
export function useWhiteboardSync({ boardId, onFatalError }: UseWhiteboardSyncOptions) {
  const setSaveStatus = useWhiteboardStore((state) => state.setSaveStatus);
  const setLastSavedAt = useWhiteboardStore((state) => state.setLastSavedAt);

  // Prevent infinite reconnect loops by tracking attempts and applying exponential backoff
  const reconnectAttempts = useRef(0);
  const lastAttemptTime = useRef(0);

  // Memoize the URI generation callback to keep it stable
  const getUri = useCallback(async () => {
    const now = Date.now();
    
    // If attempts are less than 2 seconds apart, count it as a rapid reconnect loop
    if (now - lastAttemptTime.current < 2000) {
      reconnectAttempts.current += 1;
    } else {
      reconnectAttempts.current = 1; // Reset if it's been a while since the last attempt
    }
    lastAttemptTime.current = now;

    // Apply exponential backoff if we are looping (more than 3 rapid attempts)
    if (reconnectAttempts.current > 3) {
      // Exponential backoff: 1s, 2s, 4s, 8s, up to a maximum of 30 seconds
      const backoffMs = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 3), 30000);
      console.warn(`[Sync] Reconnection loop detected. Backing off for ${backoffMs}ms before fetching token again.`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }

    return getSyncUri(boardId);
  }, [boardId]);

  // Handle custom messages from the sync server regarding autosave status
  const handleCustomMessage = useCallback((data: unknown) => {
    if (data && typeof data === "object") {
      const msg = data as { type?: string; lastSavedAt?: string };
      if (msg.type === "autosave:saving") {
        setSaveStatus("saving");
      } else if (msg.type === "autosave:saved") {
        setSaveStatus("saved");
        setLastSavedAt(new Date(msg.lastSavedAt || Date.now()));
      } else if (msg.type === "autosave:error") {
        setSaveStatus("error");
      }
    }
  }, [setSaveStatus, setLastSavedAt]);

  // Memoize sync options to prevent infinite reconnection loop on re-renders
  const syncOptions = useMemo(
    () => ({
      uri: getUri,
      assets: inlineBase64AssetStore,
      onCustomMessageReceived: handleCustomMessage,
    }),
    [getUri, handleCustomMessage],
  );

  const syncStore = useSync(syncOptions);

  const setIsOffline = useWhiteboardStore((state) => state.setIsOffline);

  // Synchronize WebSocket sync connection status with Whiteboard Zustand store
  useEffect(() => {
    const storeObj = syncStore as Record<string, unknown>;
    const connectionStatus = storeObj.connectionStatus as string | undefined;
    const offline = connectionStatus === "offline";
    
    setIsOffline(offline);
    
    if (syncStore.status === "loading") {
      setSaveStatus("idle");
    } else if (syncStore.status === "synced-remote") {
      if (offline) {
        setSaveStatus("error");
      } else {
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      }
    } else if (syncStore.status === "error") {
      setSaveStatus("error");
    }
  }, [syncStore, setSaveStatus, setLastSavedAt, setIsOffline]);

  // Detect infinite connection loops caused by token expiration or repeated 4999 errors
  const errorCount = useRef(0);
  const lastErrorTime = useRef(Date.now());

  useEffect(() => {
    if (syncStore.status === "error") {
      const now = Date.now();
      // If errors happen very quickly (less than 1.5 seconds apart), we are in an infinite reconnect loop
      if (now - lastErrorTime.current < 1500) {
        errorCount.current += 1;
      } else {
        errorCount.current = 1;
      }
      lastErrorTime.current = now;

      // Unmount the component and show a fatal error screen after 5 rapid failures
      if (errorCount.current > 5) {
        console.warn("[Sync] Fatal reconnection loop detected. Halting sync.");
        onFatalError?.();
      }
    }
  }, [syncStore.status, onFatalError]);

  return syncStore;
}
