"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, MoreVertical, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { type WorkspaceRole } from "@/types/workspace";
import { useMemberStore } from "@/store/use-member-store";
import { removeMemberAction, updateMemberRoleAction } from "@/actions/member";

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
  
  const [actionLoading, setActionLoading] = useState(false);
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuMemberId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemoveMember = async (memberId: string) => {
    setActionLoading(true);
    setActiveMenuMemberId(null);
    try {
      await removeMemberAction(workspaceId, memberId);
      toast.success("Member removed from workspace.");
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to remove member.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: WorkspaceRole) => {
    setActionLoading(true);
    setActiveMenuMemberId(null);
    try {
      await updateMemberRoleAction(workspaceId, memberId, newRole);
      toast.success(`Role updated to ${newRole}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to update member role.");
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeClass = (role: WorkspaceRole) => {
    switch (role) {
      case "owner":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "admin":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
      case "editor":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "viewer":
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <div className={`rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-xs space-y-4 relative ${activeMenuMemberId ? "z-20" : "z-10"}`}>
      {actionLoading && (
        <div className="absolute inset-0 z-50 bg-background/30 backdrop-blur-xs flex items-center justify-center rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Users className="h-4 w-4 text-primary/80" />
          Members
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
          {members.length}
        </span>
      </div>

      <div className="space-y-3">
        {members.map((member) => {
          const isOwner = member.role === "owner";
          const isSelf = member.email === userEmail;
          const canEditThisMember =
            canManage &&
            !isSelf &&
            !isOwner &&
            !(currentUserRole === "admin" && member.role === "admin");

          const initials = (member.name || member.email)
            .split("@")[0]
            .substring(0, 2)
            .toUpperCase();

          return (
            <div
              key={member.id}
              className="flex items-center justify-between gap-2 group relative"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-xs shrink-0">
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-none">
                    {member.name || member.email.split("@")[0]}
                  </span>
                  <span className="text-[9px] text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                    {member.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold font-mono ${getRoleBadgeClass(member.role)}`}
                >
                  {member.role}
                </span>

                {canEditThisMember && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setActiveMenuMemberId(
                          member.id === activeMenuMemberId ? null : member.id,
                        )
                      }
                      className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>

                    {activeMenuMemberId === member.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 mt-1.5 w-36 bg-popover border border-border/80 rounded-xl shadow-lg p-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150"
                      >
                        <div className="text-[9px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider border-b border-border/40">
                          Change Role
                        </div>
                        <button
                          onClick={() => handleChangeRole(member.id, "viewer")}
                          className={`w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-muted/80 flex items-center gap-1.5 ${member.role === "viewer" ? "text-primary font-bold" : "text-foreground"}`}
                        >
                          Viewer
                        </button>
                        <button
                          onClick={() => handleChangeRole(member.id, "editor")}
                          className={`w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-muted/80 flex items-center gap-1.5 ${member.role === "editor" ? "text-primary font-bold" : "text-foreground"}`}
                        >
                          Editor
                        </button>
                        {currentUserRole === "owner" && (
                          <button
                            onClick={() => handleChangeRole(member.id, "admin")}
                            className={`w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-muted/80 flex items-center gap-1.5 ${member.role === "admin" ? "text-primary font-bold" : "text-foreground"}`}
                          >
                            Admin
                          </button>
                        )}
                        <div className="border-t border-border/40 my-1" />
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 flex items-center gap-1.5 font-semibold"
                        >
                          <Trash2 className="h-3 w-3" />
                          Kick Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {canManage && (
        <div className="pt-2">
          <Button
            onClick={onInviteClick}
            variant="outline"
            className="w-full h-8 rounded-xl text-xs font-semibold cursor-pointer border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60 transition-all duration-200"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Invite Member
          </Button>
        </div>
      )}
    </div>
  );
}
