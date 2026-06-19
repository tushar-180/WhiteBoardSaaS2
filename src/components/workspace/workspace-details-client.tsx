"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, Calendar, Hash, Shield } from "lucide-react";

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
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { ROUTES } from "@/lib/constants";
import { hasManagePermission } from "@/lib/utils";

interface WorkspaceDetailsClientProps {
  workspace: Workspace;
  initialBoards: Board[];
  initialMembers: WorkspaceMemberWithProfile[];
  initialInvites: WorkspaceInvite[];
  currentUserRole: WorkspaceRole;
  userEmail?: string;
  initialWorkspaces: Workspace[];
}

export function WorkspaceDetailsClient({
  workspace,
  initialBoards,
  initialMembers,
  initialInvites,
  currentUserRole,
  userEmail,
  initialWorkspaces,
}: WorkspaceDetailsClientProps) {
  const [boardOpen, setBoardOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [mobileTab, setMobileTab] = useState<"boards" | "settings">("boards");

  // Sync server data with client-side Zustand store on mount/update
  useEffect(() => {
    useBoardStore.setState({
      boards: initialBoards,
    });
    useMemberStore.setState({
      members: initialMembers,
      invites: initialInvites,
    });
    useWorkspaceStore.setState((state) => ({
      workspaces: state.workspaces.length > 0 ? state.workspaces : initialWorkspaces,
    }));
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, [initialBoards, initialMembers, initialInvites, workspace, initialWorkspaces]);

  const storeBoards = useBoardStore((state) => state.boards);
  
  // Use props for SSR and initial hydration to eliminate LCP delay,
  // then swap to Zustand store state once mounted
  const boards = isMounted && storeBoards.length > 0 ? storeBoards : initialBoards;

  const formattedDate = new Date(workspace.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const canManage = hasManagePermission(currentUserRole);

  return (
    <>
      {/* Main Container */}
      <main className="flex-1 flex flex-col container mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-4 max-w-7xl relative overflow-hidden min-h-0">
        {/* Back navigation */}
        <Link
          href={ROUTES.WORKSPACES}
          className="inline-flex items-center gap-1.5 text-xs mb-4 font-semibold text-muted-foreground hover:text-foreground transition-all w-fit hover:-translate-x-0.5 duration-200 shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Workspaces
        </Link>

        {/* Workspace Header & Mobile Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between shrink-0 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-1.5">
              {workspace.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground/80 font-mono leading-relaxed">
              /{workspace.slug}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Tab Toggle */}
            <div className="flex lg:hidden bg-muted/40 p-1 rounded-xl border border-border/50 backdrop-blur-xs flex-1 sm:flex-initial">
              <button
                onClick={() => setMobileTab("boards")}
                className={`flex-1 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  mobileTab === "boards" ? "bg-background text-foreground shadow-xs border border-border/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-transparent"
                }`}
              >
                Boards
              </button>
              <button
                onClick={() => setMobileTab("settings")}
                className={`flex-1 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  mobileTab === "settings" ? "bg-background text-foreground shadow-xs border border-border/50" : "text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-transparent"
                }`}
              >
                Settings
              </button>
            </div>

            {/* New Board Button */}
            {boards.length > 0 && currentUserRole !== "viewer" && currentUserRole !== "editor" && (
              <Button
                onClick={() => setBoardOpen(true)}
                size="sm"
                className={`rounded-xl font-semibold shadow-xs active:scale-[0.99] transition-all duration-200 shrink-0 ${mobileTab === "settings" ? "hidden lg:flex" : "flex"}`}
              >
                <Plus className="sm:mr-1 h-4 w-4" />
                <span className="hidden sm:inline">New Board</span>
                <span className="sm:hidden ml-1">New</span>
              </Button>
            )}
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden min-h-0">
          {/* Left / Center - Boards Content (Col Span 3) */}
          <div className={`lg:col-span-3 flex-col overflow-hidden min-h-0 ${mobileTab === "boards" ? "flex" : "hidden lg:flex"}`}>
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 lg:border-t lg:border-border/40 lg:pt-2">
              {boards.length === 0 ? (
                <div className="flex-1 flex items-center justify-center overflow-y-auto">
                  <EmptyBoards 
                    onCreateClick={() => setBoardOpen(true)} 
                    currentUserRole={currentUserRole}
                  />
                </div>
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
          <div className={`lg:col-span-1 space-y-6 lg:border-l lg:border-border/40 lg:pl-8 overflow-y-auto pr-1.5 pb-4 min-h-0 shrink-0 lg:shrink ${mobileTab === "settings" ? "block" : "hidden lg:block"}`}>
            {/* Workspace Info Card */}
            <div className="rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-xs space-y-4">
              <h2 className="text-sm font-bold text-foreground">
                Workspace Info
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4 shrink-0 text-primary/70" />
                  <span className="font-mono truncate">{workspace.id}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                  <span suppressHydrationWarning>Created {formattedDate}</span>
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
            {canManage && <WorkspaceInvitesList workspaceId={workspace.id} />}
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
