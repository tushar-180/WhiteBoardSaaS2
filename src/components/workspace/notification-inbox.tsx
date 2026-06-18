"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Bell, Loader2, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useNotificationStore } from "@/store/use-notification-store";
import {
  getUserNotificationsAction,
  dismissNotificationAction,
  acceptInviteAction,
  rejectInviteAction,
} from "@/actions/invite";
import { NotificationItem } from "./notifications/notification-item";

interface NotificationInboxProps {
  userEmail: string;
  userId?: string;
}

export function NotificationInbox({ userEmail, userId: propUserId }: NotificationInboxProps) {
  const router = useRouter();
  const { invites, isLoading, setInvites, removeInvite, setLoading } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(propUserId || null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current user ID on mount if not provided as prop
  useEffect(() => {
    if (userId) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
      }
    });
  }, [userId]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);

  // Fetch invites/notifications with debounce to coalesce rapid calls
  const fetchInvites = useCallback(async (skipLoading = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (!skipLoading) setLoading(true);
    try {
      const list = await getUserNotificationsAction();
      setInvites(list);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      fetchingRef.current = false;
      if (!skipLoading) setLoading(false);
    }
  }, [setInvites, setLoading]);

  const debouncedFetchInvites = useCallback(() => {
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(() => fetchInvites(true), 2000);
  }, [fetchInvites]);

  const debouncedFetchRef = useRef(debouncedFetchInvites);
  useEffect(() => {
    debouncedFetchRef.current = debouncedFetchInvites;
  }, [debouncedFetchInvites]);

  // Track invites in a ref to check deleted ID without re-subscribing
  const invitesRef = useRef(invites);
  useEffect(() => {
    invitesRef.current = invites;
  }, [invites]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  useEffect(() => {
    // Subscribe to realtime database changes for workspace_invites sent to or created by this user
    const supabase = createClient();
    const cleanEmail = userEmail.toLowerCase().trim();

    const channel = supabase
      .channel(`user-notifications-${cleanEmail}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_invites",
        },
        (payload) => {
          console.log("[Realtime] Invite change received:", payload);
          
          if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            const hasInvite = invitesRef.current.some((i) => i.id === deletedId);
            if (hasInvite) {
              removeInvite(deletedId);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as { id: string; email: string; created_by: string; status: string; inviter_seen: boolean };
            
            // 1. If it was marked seen/dismissed by the inviter, remove it from store directly
            if (updated.inviter_seen === true) {
              removeInvite(updated.id);
              return;
            }

            const isTargetEmailMatch = updated.email?.toLowerCase().trim() === cleanEmail;
            const isCreatedByMatch = userId && updated.created_by === userId;

            if (isCreatedByMatch) {
              debouncedFetchRef.current();
            } else if (isTargetEmailMatch) {
              if (updated.status !== "pending") {
                removeInvite(updated.id);
              } else {
                debouncedFetchRef.current();
              }
            }
          } else if (payload.eventType === "INSERT") {
            const inserted = payload.new as { email: string; created_by: string };
            const isTargetEmailMatch = inserted.email?.toLowerCase().trim() === cleanEmail;
            const isCreatedByMatch = userId && inserted.created_by === userId;
            if (isTargetEmailMatch || isCreatedByMatch) {
              debouncedFetchRef.current();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscription status for user-notifications-${cleanEmail}:`, status);
      });

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [userEmail, userId, removeInvite]);

  const handleAccept = async (inviteId: string, token: string) => {
    setActionLoadingId(`${inviteId}-accept`);
    try {
      const workspaceId = await acceptInviteAction(token);
      toast.success("Invitation accepted successfully!");
      removeInvite(inviteId);
      setIsOpen(false);
      router.push(`/workspaces/${workspaceId}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to accept invitation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (inviteId: string, token: string) => {
    setActionLoadingId(`${inviteId}-reject`);
    try {
      await rejectInviteAction(token);
      toast.success("Invitation declined.");
      removeInvite(inviteId);
    
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to decline invitation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDismiss = async (inviteId: string) => {
    setActionLoadingId(`${inviteId}-dismiss`);
    try {
      await dismissNotificationAction(inviteId);
      toast.success("Notification dismissed.");
      removeInvite(inviteId);
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to dismiss notification.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const notificationCount = invites.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] w-auto px-1 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold shadow-sm">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[70px] sm:top-auto sm:mt-2 w-auto sm:w-80 bg-popover/95 border border-border/80 rounded-xl shadow-xl p-3 z-50 space-y-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Inbox className="h-3.5 w-3.5 text-primary/80" />
              Notifications
            </h3>
            {notificationCount > 0 && (
              <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                {notificationCount} active
              </span>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2.5">
            {isLoading && invites.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs font-medium">Checking notifications...</span>
              </div>
            ) : invites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground space-y-1">
                <p className="text-xs font-medium">All caught up!</p>
                <p className="text-[10px] opacity-75">No new notifications.</p>
              </div>
            ) : (
              invites.map((invite) => (
                <NotificationItem
                  key={invite.id}
                  invite={invite}
                  actionLoadingId={actionLoadingId}
                  handleAccept={handleAccept}
                  handleReject={handleReject}
                  handleDismiss={handleDismiss}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
