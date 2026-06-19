"use client";

import { useState, useEffect } from "react";
import { Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WorkspaceMemberRow } from "@/components/workspace/members/workspace-member-row";
import { type WorkspaceRole, type WorkspaceMemberWithProfile } from "@/types/workspace";
import { type CurrentUser } from "@/types/whiteboard";
import {
  getWorkspaceMembersAction,
  removeMemberAction,
  updateMemberRoleAction,
} from "@/actions/member";

interface EditorMembersPopoverProps {
  workspaceId: string;
  currentUser: CurrentUser;
  children: React.ReactNode;
}

export function EditorMembersPopover({
  workspaceId,
  currentUser,
  children,
}: EditorMembersPopoverProps) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<WorkspaceMemberWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (open && members.length === 0) {
      const fetchMembers = async () => {
        setIsLoading(true);
        try {
          const data = await getWorkspaceMembersAction(workspaceId);
          setMembers(data);
        } catch (err) {
          toast.error("Failed to load workspace members.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchMembers();
    }
  }, [open, workspaceId, members.length]);

  const handleRemoveMember = async (memberId: string) => {
    setActionLoadingId(memberId);
    setActiveMenuMemberId(null);
    try {
      await removeMemberAction(workspaceId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Member removed from workspace.");
      setOpen(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to remove member.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: WorkspaceRole) => {
    setActionLoadingId(memberId);
    setActiveMenuMemberId(null);
    try {
      await updateMemberRoleAction(workspaceId, memberId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      setOpen(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to update member role.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === "owner" && b.role !== "owner") return -1;
    if (b.role === "owner" && a.role !== "owner") return 1;
    const timeA = a.joined_at ? new Date(a.joined_at).getTime() : 0;
    const timeB = b.joined_at ? new Date(b.joined_at).getTime() : 0;
    return timeA - timeB;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md p-0 shadow-xl border-border/50 bg-background/95 backdrop-blur-md overflow-hidden rounded-xl">
        <DialogTitle className="sr-only">Workspace Members</DialogTitle>
        <DialogDescription className="sr-only">Manage workspace members and roles.</DialogDescription>
        <div className="flex items-center justify-between p-4 pr-12 border-b border-border/40 bg-muted/20 shrink-0">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary/80" />
            Workspace Members
          </h3>
          {members.length > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
              {members.length}
            </span>
          )}
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No members found.
            </div>
          ) : (
            sortedMembers.map((member) => (
              <WorkspaceMemberRow
                key={member.id}
                member={member}
                currentUserRole={(currentUser.role as WorkspaceRole) || "viewer"}
                userEmail={currentUser.email}
                activeMenuMemberId={activeMenuMemberId}
                setActiveMenuMemberId={setActiveMenuMemberId}
                handleChangeRole={handleChangeRole}
                handleRemoveMember={handleRemoveMember}
                actionLoadingId={actionLoadingId}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
