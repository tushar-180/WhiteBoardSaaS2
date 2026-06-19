import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useWhiteboardStore } from "@/store/use-whiteboard-store";
import { toast } from "sonner";
import type {
  TLInstancePresence,
  TLInstancePresenceID,
  TLStore,
  TLRecord,
} from "tldraw";

interface UseCollaboratorNotificationsOptions {
  store: TLStore | undefined;
  userId: string;
  userName: string;
}

/**
 * Custom hook to listen for other users joining or leaving the collaboration session,
 * and to detect local user document record changes to trigger the "saving" state.
 */
export function useCollaboratorNotifications({
  store,
  userId,
  userName,
}: UseCollaboratorNotificationsOptions) {
  const setSaveStatus = useWhiteboardStore((state) => state.setSaveStatus);
  const profileNamesCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!store) return;

    // Get initial session IDs to prevent toast-spam on load
    const initialSessionIds = new Set<string>();
    try {
      const initialPresences = store
        .allRecords()
        .filter((record) => record.typeName === "instance_presence");
      initialPresences.forEach((presence) => {
        initialSessionIds.add(presence.id);
      });
    } catch (err) {
      console.error("Failed to query initial presences:", err);
    }

    const supabase = createClient();

    const unsubscribe = store.listen(
      async (entry) => {
        // Set saving state immediately when the user makes any local changes to document records
        if (entry.source === "user") {
          const docChanges = store.filterChangesByScope(entry.changes, "document");
          if (docChanges && (
            Object.keys(docChanges.added).length > 0 ||
            Object.keys(docChanges.updated).length > 0 ||
            Object.keys(docChanges.removed).length > 0
          )) {
            const isOffline = useWhiteboardStore.getState().isOffline;
            if (isOffline) {
              setSaveStatus("error");
            } else {
              setSaveStatus("saving");
            }
          }
        }

        // Only handle collaborator join/leave toasts for remote changes
        if (entry.source === "remote") {
          // Retrieve local presence at this instant to cross-reference
          const localPresence = store.get(
            `instance_presence:${store.id}` as unknown as TLInstancePresenceID
          ) as TLInstancePresence | undefined;

          // Look for added instance_presence records (joins)
          for (const record of Object.values(entry.changes.added) as TLRecord[]) {
            if (record.typeName === "instance_presence") {
              const presence = record as unknown as TLInstancePresence;

              // Skip if this presence ID was already loaded initially
              if (initialSessionIds.has(presence.id)) {
                continue;
              }

              // Skip local user's own presence
              if (presence.id === `instance_presence:${store.id}`) {
                continue;
              }
              if (localPresence) {
                if (presence.userId && localPresence.userId === presence.userId) {
                  continue;
                }
                if (presence.userName && localPresence.userName === presence.userName) {
                  continue;
                }
              }
              if (userId) {
                const prefixedUserId = userId.startsWith("user:") ? userId : `user:${userId}`;
                const cleanUserId = userId.startsWith("user:") ? userId.slice(5) : userId;
                if (
                  presence.userId === userId ||
                  presence.userId === prefixedUserId ||
                  presence.userId === cleanUserId
                ) {
                  continue;
                }
              }
              if (userName && presence.userName === userName) {
                continue;
              }

              let name = "A collaborator";
              if (presence.userId) {
                const cleanPresenceUserId = presence.userId.startsWith("user:")
                  ? presence.userId.slice(5)
                  : presence.userId;

                if (profileNamesCache.current.has(cleanPresenceUserId)) {
                  name = profileNamesCache.current.get(cleanPresenceUserId) || name;
                } else {
                  try {
                    const { data } = await supabase
                      .from("profiles")
                      .select("name")
                      .eq("id", cleanPresenceUserId)
                      .single();
                    if (data?.name) {
                      profileNamesCache.current.set(cleanPresenceUserId, data.name);
                      name = data.name;
                    } else {
                      name = presence.userName || "A collaborator";
                    }
                  } catch {
                    name = presence.userName || "A collaborator";
                  }
                }
              } else {
                name = presence.userName || "A collaborator";
              }

              toast.info(`${name} joined the board`);
            }
          }

          // Look for removed instance_presence records (leaves)
          for (const record of Object.values(entry.changes.removed) as TLRecord[]) {
            if (record.typeName === "instance_presence") {
              const presence = record as unknown as TLInstancePresence;

              // Remove from initial set so if they rejoin we can toast them
              initialSessionIds.delete(presence.id);

              // Skip local user's own presence
              if (presence.id === `instance_presence:${store.id}`) {
                continue;
              }
              if (localPresence) {
                if (presence.userId && localPresence.userId === presence.userId) {
                  continue;
                }
                if (presence.userName && localPresence.userName === presence.userName) {
                  continue;
                }
              }
              if (userId) {
                const prefixedUserId = userId.startsWith("user:") ? userId : `user:${userId}`;
                const cleanUserId = userId.startsWith("user:") ? userId.slice(5) : userId;
                if (
                  presence.userId === userId ||
                  presence.userId === prefixedUserId ||
                  presence.userId === cleanUserId
                ) {
                  continue;
                }
              }
              if (userName && presence.userName === userName) {
                continue;
              }

              const cleanPresenceUserId = presence.userId && presence.userId.startsWith("user:")
                ? presence.userId.slice(5)
                : presence.userId;

              const name =
                (cleanPresenceUserId &&
                  profileNamesCache.current.get(cleanPresenceUserId)) ||
                presence.userName ||
                "A collaborator";

              toast.info(`${name} left the board`);
            }
          }
        }
      },
      { source: "all" },
    );

    return () => {
      unsubscribe();
    };
  }, [store, userId, userName, setSaveStatus]);
}
