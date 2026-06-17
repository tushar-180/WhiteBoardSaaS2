"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Copy, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMemberStore } from "@/store/use-member-store";
import { revokeInviteAction } from "@/actions/invite";
import { type WorkspaceInvite } from "@/types/workspace";

interface WorkspaceInvitesListProps {
  workspaceId: string;
}

export function WorkspaceInvitesList({ workspaceId }: WorkspaceInvitesListProps) {
  const router = useRouter();
  const invites = useMemberStore((state) => state.invites);
  const removeInvite = useMemberStore((state) => state.removeInvite);
  
  const [loadingInviteId, setLoadingInviteId] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [viewAllOpen, setViewAllOpen] = useState(false);

  const handleCopyInviteLink = (invite: WorkspaceInvite) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteLink = `${origin}/invite/${invite.token}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInviteId(invite.id);
    toast.success("Magic link copied to clipboard!");
    setTimeout(() => setCopiedInviteId(null), 2000);
  };

  const handleRevokeInvite = async (inviteId: string) => {
    setLoadingInviteId(inviteId);
    try {
      await revokeInviteAction(workspaceId, inviteId);
      removeInvite(inviteId); // Remove instantly from UI upon success
      toast.success("Invitation revoked successfully.");
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to revoke invitation.");
    } finally {
      setLoadingInviteId(null);
    }
  };

  if (invites.length === 0) {
    return null;
  }

  const INITIAL_VISIBLE_COUNT = 4;
  const visibleInvites = invites.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = invites.length > INITIAL_VISIBLE_COUNT;

  return (
    <div className="flex flex-col max-h-[300px] rounded-xl border bg-card p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">

      <div className="flex items-center justify-between shrink-0 mb-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-primary/80" />
          Pending Invites
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
          {invites.length}
        </span>
      </div>

      <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0 pr-1 pb-1 custom-scrollbar">
        {visibleInvites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between gap-2 p-2 rounded-lg border border-transparent hover:bg-muted/40 hover:border-border/50 transition-all group"
          >
            <div className="flex flex-col min-w-0 flex-1 px-1">
              <span className="text-sm font-medium text-foreground truncate">
                {invite.email}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-semibold mt-0.5">
                {invite.role}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopyInviteLink(invite)}
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                title="Copy invitation link"
              >
                {copiedInviteId === invite.id ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRevokeInvite(invite.id)}
                disabled={loadingInviteId === invite.id}
                className="h-7 w-7 rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                title="Revoke invitation"
              >
                {loadingInviteId === invite.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
        {hasMore && (
          <Button
            variant="ghost"
            onClick={() => setViewAllOpen(true)}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
          >
            View all ({invites.length})
          </Button>
        )}
      </div>

      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-md sm:max-w-xl max-h-[85vh] flex flex-col p-0 gap-0 border-border/50 bg-card/95 backdrop-blur-md">
          <DialogHeader className="p-5 border-b border-border/40 pb-4 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <ShieldAlert className="h-5 w-5 text-primary/80" />
              All Pending Invites
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold ml-1">
                {invites.length}
              </span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Complete list of all pending invitations for this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-1.5 min-h-0 custom-scrollbar">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg border border-transparent hover:bg-muted/40 hover:border-border/50 transition-all group"
              >
                <div className="flex flex-col min-w-0 flex-1 px-1">
                  <span className="text-sm font-medium text-foreground truncate">
                    {invite.email}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-semibold mt-0.5">
                    {invite.role}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyInviteLink(invite)}
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                    title="Copy invitation link"
                  >
                    {copiedInviteId === invite.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRevokeInvite(invite.id)}
                    disabled={loadingInviteId === invite.id}
                    className="h-7 w-7 rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                    title="Revoke invitation"
                  >
                    {loadingInviteId === invite.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
