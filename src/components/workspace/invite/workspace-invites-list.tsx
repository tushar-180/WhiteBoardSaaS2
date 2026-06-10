"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Copy, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useMemberStore } from "@/store/use-member-store";
import { revokeInviteAction } from "@/actions/invite";
import { type WorkspaceInvite } from "@/types/workspace";

interface WorkspaceInvitesListProps {
  workspaceId: string;
}

export function WorkspaceInvitesList({ workspaceId }: WorkspaceInvitesListProps) {
  const router = useRouter();
  const invites = useMemberStore((state) => state.invites);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  const handleCopyInviteLink = (invite: WorkspaceInvite) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteLink = `${origin}/invite/${invite.token}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInviteId(invite.id);
    toast.success("Magic link copied to clipboard!");
    setTimeout(() => setCopiedInviteId(null), 2000);
  };

  const handleRevokeInvite = async (inviteId: string) => {
    setActionLoading(true);
    try {
      await revokeInviteAction(workspaceId, inviteId);
      toast.success("Invitation revoked successfully.");
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to revoke invitation.");
    } finally {
      setActionLoading(false);
    }
  };

  if (invites.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-xs space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
      {actionLoading && (
        <div className="absolute inset-0 z-50 bg-background/30 backdrop-blur-xs flex items-center justify-center rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-primary/80" />
          Pending Invites
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
          {invites.length}
        </span>
      </div>

      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-none">
                {invite.email}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider font-semibold">
                {invite.role}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopyInviteLink(invite)}
                className="h-6.5 w-6.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Copy invitation link"
              >
                {copiedInviteId === invite.id ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRevokeInvite(invite.id)}
                className="h-6.5 w-6.5 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                title="Revoke invitation"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
