"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowLeft,
  Calendar,
  Hash,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BoardList } from "@/components/board/board-list";
import { EmptyBoards } from "@/components/board/empty-boards";
import { CreateBoardDialog } from "@/components/board/create-board-dialog";
import { InviteMemberDialog } from "@/components/workspace/dialogs/invite-member-dialog";
import { WorkspaceMembersList } from "@/components/workspace/members/workspace-members-list";
import { WorkspaceInvitesList } from "@/components/workspace/invite/workspace-invites-list";
import {
  type Workspace,
  type Board,
  type WorkspaceInvite,
  type WorkspaceRole,
  type WorkspaceMemberWithProfile,
} from "@/types/workspace";
import { useBoardStore } from "@/store/use-board-store";
import { useMemberStore } from "@/store/use-member-store";
import RootLoading from "@/app/loading";
import { ROUTES } from "@/lib/constants";

interface WorkspaceDetailsClientProps {
  workspace: Workspace;
  initialBoards: Board[];
  initialMembers: WorkspaceMemberWithProfile[];
  initialInvites: WorkspaceInvite[];
  currentUserRole: WorkspaceRole;
  userEmail?: string;
}

export function WorkspaceDetailsClient({
  workspace,
  initialBoards,
  initialMembers,
  initialInvites,
  currentUserRole,
  userEmail,
}: WorkspaceDetailsClientProps) {
  const [boardOpen, setBoardOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Sync server data with client-side Zustand store on mount/update
  useEffect(() => {
    useBoardStore.setState({
      boards: initialBoards,
    });
    useMemberStore.setState({
      members: initialMembers,
      invites: initialInvites,
    });
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, [initialBoards, initialMembers, initialInvites]);

  const boards = useBoardStore((state) => state.boards);

  if (!isMounted) {
    return <RootLoading />;
  }

  const formattedDate = new Date(workspace.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <>
      {/* Main Container */}
      <main className="flex-1 container mx-auto px-6 py-10 max-w-7xl relative">
        {/* Back navigation */}
        <Link
          href={ROUTES.WORKSPACES}
          className="inline-flex items-center gap-1.5 text-xs mb-6 font-semibold text-muted-foreground hover:text-foreground transition-all w-fit hover:-translate-x-0.5 duration-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Workspaces
        </Link>

        {/* Workspace Title & Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left / Center - Boards Content (Col Span 3) */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-1.5">
                  {workspace.name}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground/80 font-mono leading-relaxed">
                  /{workspace.slug}
                </p>
              </div>

              {boards.length > 0 && currentUserRole !== "viewer" && currentUserRole !== "editor" && (
                <Button
                  onClick={() => setBoardOpen(true)}
                  size="sm"
                  className="rounded-xl font-semibold shadow-xs active:scale-[0.99] transition-all duration-200 cursor-pointer"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  New Board
                </Button>
              )}
            </div>

            <div className="border-t border-border/40 pt-6">
              {boards.length === 0 ? (
                currentUserRole !== "viewer" && (
                  <EmptyBoards onCreateClick={() => setBoardOpen(true)} />
                )
              ) : (
                <BoardList
                  boards={boards}
                  currentUserRole={currentUserRole}
                  onCreateClick={() => setBoardOpen(true)}
                />
              )}
            </div>
          </div>

          {/* Right - Sidebar Metadata (Col Span 1) */}
          <div className="space-y-6 lg:border-l lg:border-border/40 lg:pl-8">
            {/* Workspace Info Card */}
            <div className="rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground">
                Workspace Info
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4 shrink-0 text-primary/70" />
                  <span className="font-mono truncate">{workspace.id}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                  <span>Created {formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 shrink-0 text-primary/70" />
                  <span className="capitalize">Role: {currentUserRole}</span>
                </div>
              </div>
            </div>

            {/* Active Members Card */}
            <WorkspaceMembersList
              workspaceId={workspace.id}
              currentUserRole={currentUserRole}
              userEmail={userEmail}
              onInviteClick={() => setInviteOpen(true)}
            />

            {/* Pending Invites Card (Visible only to owners/admins) */}
            {canManage && (
              <WorkspaceInvitesList workspaceId={workspace.id} />
            )}
          </div>
        </div>

        {/* Create Board Modal Dialog */}
        <CreateBoardDialog
          workspaceId={workspace.id}
          open={boardOpen}
          onOpenChange={setBoardOpen}
        />

        {/* Invite Member Dialog */}
        <InviteMemberDialog
          workspaceId={workspace.id}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      </main>
    </>
  );
}

