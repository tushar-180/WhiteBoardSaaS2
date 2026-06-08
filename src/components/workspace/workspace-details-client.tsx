"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, Users, Calendar, Hash, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BoardList } from "@/components/board/board-list";
import { EmptyBoards } from "@/components/board/empty-boards";
import { CreateBoardDialog } from "@/components/board/create-board-dialog";
import { type Workspace, type Board } from "@/types/workspace";
import { useBoardStore } from "@/store/use-board-store";
import { WorkspaceNav } from "./workspace-nav";
import RootLoading from "@/app/loading";

interface WorkspaceDetailsClientProps {
  workspace: Workspace;
  initialBoards: Board[];
  userEmail?: string;
  userName?: string;
}

export function WorkspaceDetailsClient({
  workspace,
  initialBoards,
  userEmail,
  userName,
}: WorkspaceDetailsClientProps) {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Sync server data with client-side Zustand store on mount/update
  useEffect(() => {
    useBoardStore.setState({
      boards: initialBoards,
    });
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, [initialBoards]);

  const boards = useBoardStore((state) => state.boards);

  if (!isMounted) {
    return <RootLoading />;
  }

  const formattedDate = new Date(workspace.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl -z-10" />

      {/* Navigation Header */}
      <WorkspaceNav userEmail={userEmail} logoHref="/" />

      {/* Main Container */}
      <main className="flex-1 container mx-auto px-6 py-10 max-w-7xl">
        {/* Back navigation */}
        <Link
          href="/workspaces"
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

              {boards.length > 0 && (
                <Button
                  onClick={() => setOpen(true)}
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
                <EmptyBoards onCreateClick={() => setOpen(true)} />
              ) : (
                <BoardList
                  boards={boards}
                  onCreateClick={() => setOpen(true)}
                />
              )}
            </div>
          </div>

          {/* Right - Sidebar Metadata (Col Span 1) */}
          <div className="space-y-6 lg:border-l lg:border-border/40 lg:pl-8">
            {/* Workspace Info Card */}
            <div className="rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground">Workspace Info</h3>
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
                  <span>Role: Owner</span>
                </div>
              </div>
            </div>

            {/* Members Card Placeholder (Ready for Stage 3) */}
            <div className="rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary/80" />
                  Members
                </h3>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                  1
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-xs">
                    {(userName || userEmail || "U").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-foreground truncate">
                      {userName || "User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {userEmail}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Board Modal Dialog */}
        <CreateBoardDialog
          workspaceId={workspace.id}
          open={open}
          onOpenChange={setOpen}
        />
      </main>
    </div>
  );
}
