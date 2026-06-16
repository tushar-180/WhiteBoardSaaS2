"use client";

import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type WorkspaceInviteWithWorkspace } from "@/types/workspace";

interface NotificationItemProps {
  invite: WorkspaceInviteWithWorkspace;
  actionLoadingId: string | null;
  handleAccept: (inviteId: string, token: string) => Promise<void>;
  handleReject: (inviteId: string, token: string) => Promise<void>;
  handleDismiss: (inviteId: string) => Promise<void>;
}

export function NotificationItem({
  invite,
  actionLoadingId,
  handleAccept,
  handleReject,
  handleDismiss,
}: NotificationItemProps) {
  const isAcceptLoading = actionLoadingId === `${invite.id}-accept`;
  const isRejectLoading = actionLoadingId === `${invite.id}-reject`;
  const isDismissLoading = actionLoadingId === `${invite.id}-dismiss`;
  const isActionLoading = isAcceptLoading || isRejectLoading || isDismissLoading;
  const isIncoming = invite.status === "pending";

  if (isIncoming) {
    return (
      <div className="p-2.5 rounded-lg border border-border/40 bg-card/40 hover:bg-card/75 transition-colors space-y-2.5">
        <div className="space-y-1">
          <p className="text-[11px] font-bold leading-normal text-foreground">
            Invite to join <span className="text-primary font-black">&ldquo;{invite.workspace_name}&rdquo;</span>
          </p>
          {invite.inviter_name && (
            <p className="text-[10px] text-muted-foreground">
              Sent by: <span className="font-semibold text-foreground">{invite.inviter_name}</span>
            </p>
          )}
          <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider">
            Role: {invite.role}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={isActionLoading || !!actionLoadingId}
            onClick={() => handleAccept(invite.id, invite.token)}
            className="flex-1 h-7 rounded-lg text-[10px] font-bold bg-primary text-primary-foreground hover:opacity-90 gap-1 cursor-pointer"
          >
            {isAcceptLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isActionLoading || !!actionLoadingId}
            onClick={() => handleReject(invite.id, invite.token)}
            className="flex-1 h-7 rounded-lg text-[10px] font-bold border-border/80 hover:bg-muted text-foreground gap-1 cursor-pointer"
          >
            {isRejectLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3" />
            )}
            Decline
          </Button>
        </div>
      </div>
    );
  }

  // Outgoing invite status update (accepted or rejected)
  const isAccepted = invite.status === "accepted";
  const inviteeName = invite.invitee_name || invite.email;

  return (
    <div
      className={`relative p-2.5 rounded-lg border transition-colors flex flex-col gap-1.5 ${
        isAccepted
          ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
          : "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10"
      }`}
    >
      <div className="pr-6 space-y-1">
        <p className="text-[11px] font-medium leading-normal text-foreground">
          <span className="font-bold">{inviteeName}</span>{" "}
          {isAccepted ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">accepted</span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400 font-bold">declined</span>
          )}{" "}
          your invite to <span className="font-bold">&ldquo;{invite.workspace_name}&rdquo;</span>
        </p>
        <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider">
          Role: {invite.role}
        </p>
      </div>

      <Button
        size="icon"
        variant="ghost"
        disabled={isActionLoading || !!actionLoadingId}
        onClick={() => handleDismiss(invite.id)}
        className="absolute top-1.5 right-1.5 h-5 w-5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
        title="Dismiss"
      >
        {isDismissLoading ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
