"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, ArrowRight, Trash2, LogOut } from "lucide-react";
import { LeaveWorkspaceDialog } from "./dialogs/leave-workspace-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { type Workspace } from "@/types/workspace";
import { DeleteWorkspaceDialog } from "./dialogs/delete-workspace-dialog";
import { ROUTES } from "@/lib/constants";
import { WorkspaceAvatarGroup } from "./workspace-avatar-group";
import { GlowingStarsBackgroundCard } from "@/components/ui/glowing-stars";


interface WorkspaceCardProps {
  workspace: Workspace;
  userId: string;
}

export function WorkspaceCard({ workspace, userId }: WorkspaceCardProps) {
  const [open, setOpen] = useState(false);
  const isOwner = workspace.owner_id === userId;
  const canLeaveWorkspace = !isOwner;
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);

  const formattedDate = new Date(workspace.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };



  const getRoleBadgeClass = (role: string) => {
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

  return (
    <>
      <Link
        href={`${ROUTES.WORKSPACES}/${workspace.id}`}
        className="block group h-full w-full"
      >
        <GlowingStarsBackgroundCard className="h-full max-w-none max-h-none flex flex-col border border-border/60 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30 relative overflow-hidden rounded-xl p-4 sm:p-5 gap-0 ring-0">

          {/* Delete Icon Button - Only for Owner */}
          {isOwner && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-background/80 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 cursor-pointer"
              title="Delete Workspace"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {!isOwner && canLeaveWorkspace && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenLeaveDialog(true); }}
              className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-background/80 hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 border border-border/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              title="Leave Workspace"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          <CardHeader className="p-0 gap-0 mt-2 sm:mt-0">
            <div className="flex items-center justify-between gap-2 mb-3 pr-10">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Folder className="h-4 w-4" />
                </div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Workspace
                </span>
                {workspace.currentUserRole && (
                  <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold font-mono ${getRoleBadgeClass(workspace.currentUserRole)}`}>
                    {workspace.currentUserRole}
                  </span>
                )}
              </div>
            </div>
            <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 truncate pr-16 relative z-10">
              {workspace.name}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 font-mono truncate pr-16 relative z-10">
              /{workspace.slug}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 mt-5 flex items-center justify-between border-t border-border/40 pt-4">
            <div className="flex flex-col gap-1">
              <span
                className="text-[11px] text-muted-foreground"
                suppressHydrationWarning
              >
                Created: {formattedDate}
              </span>
              {workspace.owner_name && (
                <span className="text-[10px] text-muted-foreground/70">
                  Owner: <span className="font-semibold text-muted-foreground">{workspace.owner_name}</span>
                </span>
              )}
            </div>
            <div className="relative flex items-center justify-end min-w-[60px] h-6">
              <WorkspaceAvatarGroup members={workspace.members_preview} />
              <span className="absolute right-0 flex items-center gap-1 text-[11px] font-bold text-primary opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                Open{" "}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </CardContent>
        </GlowingStarsBackgroundCard>
      </Link>

      <DeleteWorkspaceDialog
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        open={open}
        onOpenChange={setOpen}
      />
      <LeaveWorkspaceDialog
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        open={openLeaveDialog}
        onOpenChange={setOpenLeaveDialog}
      />
    </>
  );
}
