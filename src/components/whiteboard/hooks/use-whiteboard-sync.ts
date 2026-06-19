import { useCallback, useMemo, useEffect, useRef } from "react";
import { useSync } from "@tldraw/sync";
import { inlineBase64AssetStore } from "tldraw";
import { useWhiteboardStore } from "@/store/use-whiteboard-store";
import { getSyncUri } from "../utils/sync-uri";

interface UseWhiteboardSyncOptions {
  boardId: string;
}

/**
 * Custom hook to initialize the multiplayer synchronized store using @tldraw/sync,
 * handle custom messages from the sync server regarding autosave, and sync status to state.
 */
export function useWhiteboardSync({ boardId }: UseWhiteboardSyncOptions) {
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

  return syncStore;
}
