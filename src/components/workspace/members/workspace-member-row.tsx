"use client";

import { MoreVertical, Trash2, Loader2, User, Eye, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type WorkspaceRole, type WorkspaceMemberWithProfile } from "@/types/workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkspaceMemberRowProps {
  member: WorkspaceMemberWithProfile;
  currentUserRole: WorkspaceRole;
  userEmail?: string;
  activeMenuMemberId: string | null;
  setActiveMenuMemberId: (id: string | null) => void;
  handleChangeRole: (memberId: string, newRole: WorkspaceRole) => Promise<void>;
  handleRemoveMember: (memberId: string) => Promise<void>;
  actionLoadingId: string | null;
}

export function WorkspaceMemberRow({
  member,
  currentUserRole,
  userEmail,
  activeMenuMemberId,
  setActiveMenuMemberId,
  handleChangeRole,
  handleRemoveMember,
  actionLoadingId,
}: WorkspaceMemberRowProps) {
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

  const isOwner = member.role === "owner";
  const isSelf = member.email === userEmail;
  const canManage = currentUserRole === "owner" || currentUserRole === "admin";
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
    <div className="flex items-center justify-between gap-2 group relative">
      <div className="flex items-center gap-2.5 min-w-0">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name || member.email}
            className="h-7 w-7 rounded-full object-cover shrink-0 border border-border/50"
          />
        ) : (
          <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-xs shrink-0">
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-bold text-foreground truncate">
            {member.name || member.email.split("@")[0]}
          </span>
          <span className="text-[9px] text-muted-foreground truncate">
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
          <DropdownMenu
            open={activeMenuMemberId === member.id}
            onOpenChange={(open) => setActiveMenuMemberId(open ? member.id : null)}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={actionLoadingId !== null}
                className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer outline-none focus-visible:ring-0"
              >
                {actionLoadingId === member.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <MoreVertical className="h-3.5 w-3.5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground tracking-wider py-1.5">
                Change Role
              </DropdownMenuLabel>
              {member.role !== "viewer" && (
                <DropdownMenuItem
                  onClick={() => handleChangeRole(member.id, "viewer")}
                  className="text-xs cursor-pointer rounded-lg"
                >
                  <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  Viewer
                </DropdownMenuItem>
              )}
              {member.role !== "editor" && (
                <DropdownMenuItem
                  onClick={() => handleChangeRole(member.id, "editor")}
                  className="text-xs cursor-pointer rounded-lg"
                >
                  <User className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  Editor
                </DropdownMenuItem>
              )}
              {currentUserRole === "owner" && member.role !== "admin" && (
                <DropdownMenuItem
                  onClick={() => handleChangeRole(member.id, "admin")}
                  className="text-xs cursor-pointer rounded-lg"
                >
                  <ShieldAlert className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => handleRemoveMember(member.id)}
                className="text-xs text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg font-semibold"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Kick Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
