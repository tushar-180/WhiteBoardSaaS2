"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import posthog from "posthog-js";

import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { WorkspaceList } from "./workspace-list";
import { CreateWorkspaceDialog } from "./dialogs/create-workspace-dialog";
import { type Workspace } from "@/types/workspace";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import RootLoading from "@/app/loading";

interface WorkspacesClientProps {
  initialWorkspaces: Workspace[];
  userId: string;
  userEmail?: string;
  userName?: string;
}

export function WorkspacesClient({
  initialWorkspaces,
  userId,
  userEmail,
  userName,
}: WorkspacesClientProps) {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Sync server data with client-side store on mount
  useEffect(() => {
    useWorkspaceStore.setState({
      workspaces: initialWorkspaces,
      user: userEmail ? { email: userEmail, name: userName || "" } : null,
    });
    posthog.identify(userId, {
      email: userEmail,
      name: userName,
    });
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, [initialWorkspaces, userId, userEmail, userName]);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const user = useWorkspaceStore((state) => state.user);

  if (!isMounted) {
    return <RootLoading />;
  }

  return (
    <>
      {/* Dashboard Main Workspace View */}
      <main className="flex-1 flex flex-col container mx-auto px-4 sm:px-6 lg:px-8 pb-2 sm:pb-4 pt-2 max-w-6xl">
        <div className="flex flex-col gap-4 mb-4 shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs mb-3 font-semibold text-muted-foreground hover:text-foreground transition-all w-fit hover:-translate-x-0.5 duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* Desktop Header Content */}
            <div className="space-y-1 hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl mb-1">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-extrabold">
                  {user?.name || "User"}
                </span>
                !
              </h1>
              <h2 className="text-base font-semibold text-muted-foreground">
                Workspaces
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed">
                Collaborative environments where you store and share whiteboard
                canvases.
              </p>
            </div>

            {/* Mobile Header Content */}
            <div className="flex items-center justify-between w-full sm:hidden">
              <h1 className="text-2xl font-bold text-foreground">Workspaces</h1>
              {workspaces.length > 0 && (
                <Button
                  onClick={() => setOpen(true)}
                  size="sm"
                  className="rounded-xl font-semibold shadow-xs active:scale-[0.99] transition-all duration-200 cursor-pointer"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  New
                </Button>
              )}
            </div>

            {/* Desktop Button */}
            {workspaces.length > 0 && (
              <Button
                onClick={() => setOpen(true)}
                size="sm"
                className="hidden sm:inline-flex w-full sm:w-auto rounded-xl font-semibold shadow-xs active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                <Plus className="mr-1 h-4 w-4" />
                New Workspace
              </Button>
            )}
          </div>
        </div>

        {workspaces.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <EmptyState onCreateClick={() => setOpen(true)} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <WorkspaceList userId={userId} onCreateClick={() => setOpen(true)} />
          </div>
        )}

        {/* Modal Dialog for creating workspaces */}
        <CreateWorkspaceDialog open={open} onOpenChange={setOpen} />
      </main>
    </>
  );
}
