"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type WorkspaceRole } from "@/types/workspace";
import { useMemberStore } from "@/store/use-member-store";
import { removeMemberAction, updateMemberRoleAction } from "@/actions/member";
import { createClient } from "@/utils/supabase/client";
import { WorkspaceMemberRow } from "./workspace-member-row";

interface WorkspaceMembersListProps {
  workspaceId: string;
  currentUserRole: WorkspaceRole;
  userEmail?: string;
  onInviteClick: () => void;
}

export function WorkspaceMembersList({
  workspaceId,
  currentUserRole,
  userEmail,
  onInviteClick,
}: WorkspaceMembersListProps) {
  const router = useRouter();
  const members = useMemberStore((state) => state.members);
  const removeMember = useMemberStore((state) => state.removeMember);
  const updateMemberRole = useMemberStore((state) => state.updateMemberRole);
  
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);
  const [viewAllOpen, setViewAllOpen] = useState(false);

  // Track members in a ref to check deleted ID without re-subscribing
  const membersRef = useRef(members);
  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  // Subscribe to real-time member updates
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`members-sync-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_members",
        },
        (payload) => {
          console.log("[Realtime Members List] Change received:", payload);
          if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            const isMemberOfThisWorkspace = membersRef.current.some((m) => m.id === deletedId);
            if (isMemberOfThisWorkspace) {
              removeMember(deletedId);
              router.refresh();
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as { id: string; workspace_id: string; role: WorkspaceRole };
            if (updated.workspace_id === workspaceId) {
              updateMemberRole(updated.id, updated.role);
              router.refresh();
            }
          } else if (payload.eventType === "INSERT") {
            const inserted = payload.new as { workspace_id: string };
            if (inserted.workspace_id === workspaceId) {
              router.refresh();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, removeMember, updateMemberRole, router]);

  const handleRemoveMember = async (memberId: string) => {
    setActionLoadingId(memberId);
    setActiveMenuMemberId(null);
    try {
      await removeMemberAction(workspaceId, memberId);
      toast.success("Member removed from workspace.");
      router.refresh();
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
      toast.success(`Role updated to ${newRole}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to update member role.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === "owner" && b.role !== "owner") return -1;
    if (b.role === "owner" && a.role !== "owner") return 1;
    const timeA = a.joined_at ? new Date(a.joined_at).getTime() : 0;
    const timeB = b.joined_at ? new Date(b.joined_at).getTime() : 0;
    return timeA - timeB;
  });

  const INITIAL_VISIBLE_COUNT = 4;
  const visibleMembers = sortedMembers.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = sortedMembers.length > INITIAL_VISIBLE_COUNT;

  return (
    <div className={`flex flex-col max-h-[400px] rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-xs relative ${activeMenuMemberId ? "z-20" : "z-10"}`}>
      <div className="flex items-center justify-between shrink-0 mb-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Users className="h-4 w-4 text-primary/80" />
          Members
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
          {members.length}
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-1 pb-1 custom-scrollbar">
        {visibleMembers.map((member) => (
          <WorkspaceMemberRow
            key={member.id}
            member={member}
            currentUserRole={currentUserRole}
            userEmail={userEmail}
            activeMenuMemberId={activeMenuMemberId}
            setActiveMenuMemberId={setActiveMenuMemberId}
            handleChangeRole={handleChangeRole}
            handleRemoveMember={handleRemoveMember}
            actionLoadingId={actionLoadingId}
          />
        ))}
        {hasMore && (
          <Button
            variant="ghost"
            onClick={() => setViewAllOpen(true)}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
          >
            View all ({sortedMembers.length})
          </Button>
        )}
      </div>

      {canManage && (
        <div className="pt-4 shrink-0 mt-2 border-t border-border/40">
          <Button
            onClick={onInviteClick}
            variant="outline"
            disabled={actionLoadingId !== null}
            className="w-full h-8 rounded-xl text-xs font-semibold cursor-pointer border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60 transition-all duration-200"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Invite Member
          </Button>
        </div>
      )}

      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="max-w-md sm:max-w-xl max-h-[85vh] flex flex-col p-0 gap-0 border-border/50 bg-card/95 backdrop-blur-md">
          <DialogHeader className="p-5 border-b border-border/40 pb-4 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-primary/80" />
              All Workspace Members
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold ml-1">
                {sortedMembers.length}
              </span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Complete list of all members in this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-5 pt-4 space-y-3 min-h-0 custom-scrollbar">
            {sortedMembers.map((member) => (
              <WorkspaceMemberRow
                key={member.id}
                member={member}
                currentUserRole={currentUserRole}
                userEmail={userEmail}
                activeMenuMemberId={activeMenuMemberId}
                setActiveMenuMemberId={setActiveMenuMemberId}
                handleChangeRole={handleChangeRole}
                handleRemoveMember={handleRemoveMember}
                actionLoadingId={actionLoadingId}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
