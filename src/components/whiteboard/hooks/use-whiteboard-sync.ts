import { useCallback, useMemo, useEffect } from "react";
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

  // Memoize the URI generation callback to keep it stable
  const getUri = useCallback(async () => {
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

  // Synchronize WebSocket sync connection status with Whiteboard Zustand store
  useEffect(() => {
    if (syncStore.status === "loading") {
      setSaveStatus("saving");
    } else if (syncStore.status === "synced-remote") {
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } else if (syncStore.status === "error") {
      setSaveStatus("error");
    }
  }, [syncStore.status, setSaveStatus, setLastSavedAt]);

  return syncStore;
}
