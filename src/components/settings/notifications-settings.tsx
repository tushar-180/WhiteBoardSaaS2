"use client";

import { useEffect, useState } from "react";
import { getUserNotificationsAction, dismissNotificationAction, acceptInviteAction, rejectInviteAction } from "@/actions/invite";
import { type WorkspaceInviteWithWorkspace } from "@/types/workspace";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, Check, X, Building } from "lucide-react";
import { useWorkspaceStore } from "@/store/use-workspace-store";

export function NotificationsSettings() {
  const { user } = useWorkspaceStore();
  const [notifications, setNotifications] = useState<WorkspaceInviteWithWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getUserNotificationsAction();
        setNotifications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const handleAccept = async (token: string) => {
    try {
      await acceptInviteAction(token);
      setNotifications(prev => prev.filter(n => n.token !== token));
      toast.success("Joined workspace successfully.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async (token: string) => {
    try {
      await rejectInviteAction(token);
      setNotifications(prev => prev.filter(n => n.token !== token));
      toast.success("Invitation rejected.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissNotificationAction(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const incoming = notifications.filter(n => n.email.toLowerCase().trim() === user?.email.toLowerCase().trim() && n.status === "pending");
  const outgoingStatuses = notifications.filter(n => n.created_by === user?.id && (n.status === "accepted" || n.status === "rejected"));

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-1">Manage your pending invitations and updates.</p>
      </div>

      <div className="space-y-8">
        {incoming.length === 0 && outgoingStatuses.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center text-muted-foreground border border-border/50 rounded-lg bg-muted/20">
            <Bell className="w-12 h-12 mb-4 opacity-50" />
            <p>You're all caught up!</p>
            <p className="text-sm mt-1">No new notifications.</p>
          </div>
        ) : null}

        {incoming.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-border/50 pb-2">Workspace Invitations</h3>
            <div className="space-y-3">
              {incoming.map(invite => (
                <div key={invite.id} className="p-4 rounded-lg border border-border/50 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      <span className="font-bold">{invite.inviter_name}</span> invited you to join <span className="font-bold">{invite.workspace_name}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Building className="w-4 h-4" />
                      <span className="capitalize">{invite.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleReject(invite.token)}>
                      <X className="w-4 h-4 mr-2" /> Decline
                    </Button>
                    <Button size="sm" onClick={() => handleAccept(invite.token)}>
                      <Check className="w-4 h-4 mr-2" /> Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {outgoingStatuses.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-border/50 pb-2">Invitation Updates</h3>
            <div className="space-y-3">
              {outgoingStatuses.map(invite => (
                <div key={invite.id} className="p-4 rounded-lg border border-border/50 bg-card flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      <span className="font-bold">{invite.invitee_name}</span> {invite.status === "accepted" ? "accepted" : "declined"} your invitation to <span className="font-bold">{invite.workspace_name}</span>.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDismiss(invite.id)} className="shrink-0 text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
