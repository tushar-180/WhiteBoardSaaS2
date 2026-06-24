"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, Calendar, Hash, Shield, Crown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
  workspacePlan?: "free" | "pro" | "ultra";
}

export function WorkspaceDetailsClient({
  workspace,
  initialBoards,
  initialMembers,
  initialInvites,
  currentUserRole,
  userEmail,
  initialWorkspaces,
  workspacePlan = "free",
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
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Back navigation */}
        <Link
          href={ROUTES.WORKSPACES}
          className="inline-flex items-center gap-1.5 text-xs mb-4 font-semibold text-muted-foreground hover:text-foreground transition-all w-fit hover:-translate-x-0.5 duration-200 shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Workspaces
        </Link>

        {/* Workspace Header & Mobile Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between shrink-0 mb-6 gap-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 sm:text-4xl mb-1.5 drop-shadow-sm">
              {workspace.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground/80 font-mono leading-relaxed bg-muted/40 w-fit px-2 py-0.5 rounded-md border border-border/50">
              /{workspace.slug}
            </p>
          </motion.div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Tab Toggle */}
            <div className="flex lg:hidden bg-muted/40 p-1 rounded-xl border border-border/50 backdrop-blur-xs flex-1 sm:flex-initial relative">
              <button
                onClick={() => setMobileTab("boards")}
                className={`relative flex-1 sm:px-6 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 z-10 ${
                  mobileTab === "boards" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mobileTab === "boards" && (
                  <motion.div
                    layoutId="mobileTabActive"
                    className="absolute inset-0 bg-background shadow-xs border border-border/50 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                Boards
              </button>
              <button
                onClick={() => setMobileTab("settings")}
                className={`relative flex-1 sm:px-6 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 z-10 ${
                  mobileTab === "settings" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mobileTab === "settings" && (
                  <motion.div
                    layoutId="mobileTabActive"
                    className="absolute inset-0 bg-background shadow-xs border border-border/50 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                Settings
              </button>
            </div>

            {/* New Board Button */}
            {boards.length > 0 && currentUserRole !== "viewer" && currentUserRole !== "editor" && (
              <Button
                onClick={() => setBoardOpen(true)}
                size="sm"
                className={`rounded-xl font-semibold shadow-xs active:scale-[0.99] transition-all duration-200 shrink-0 ${mobileTab === "settings" ? "hidden lg:flex" : "flex"} relative overflow-hidden group`}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 via-white/20 to-primary/10 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Plus className="sm:mr-1 h-4 w-4 relative z-10" />
                <span className="hidden sm:inline relative z-10">New Board</span>
                <span className="sm:hidden ml-1 relative z-10">New</span>
              </Button>
            )}
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden min-h-0 relative z-10">
          {/* Left / Center - Boards Content */}
          <div className={`flex-1 flex-col overflow-hidden min-h-0 min-w-0 ${mobileTab === "boards" ? "flex" : "hidden lg:flex"}`}>
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

          {/* Right - Sidebar Metadata */}
          <div className={`w-full lg:w-[320px] xl:w-[360px] flex-1 lg:flex-none space-y-6 lg:border-l lg:border-border/40 lg:pl-8 overflow-y-auto pr-1.5 pb-4 min-h-0 shrink lg:shrink-0 custom-scrollbar ${mobileTab === "settings" ? "block" : "hidden lg:block"}`}>
            {/* Workspace Info Card */}
            <div className="rounded-xl border border-white/5 bg-card/20 p-5 backdrop-blur-xl shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

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
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Crown className="h-4 w-4 shrink-0 text-primary/70" />
                  <span className="capitalize flex items-center">
                    Plan: 
                    <span className="ml-2 font-bold bg-foreground text-background px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider select-none selection:bg-background selection:text-foreground">
                      {workspacePlan}
                    </span>
                  </span>
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
