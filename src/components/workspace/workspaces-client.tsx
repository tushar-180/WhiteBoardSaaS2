"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Plus, ArrowLeft } from "lucide-react";
import posthog from "posthog-js";

import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { WorkspaceList } from "./workspace-list";
import { type Workspace } from "@/types/workspace";
import { useWorkspaceStore } from "@/store/use-workspace-store";

const CreateWorkspaceDialog = dynamic(() => import("./dialogs/create-workspace-dialog").then((m) => ({ default: m.CreateWorkspaceDialog })), { ssr: false });

interface WorkspacesClientProps {
  initialWorkspaces: Workspace[];
  userId: string;
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string | null;
}

export function WorkspacesClient({
  initialWorkspaces,
  userId,
  userEmail,
  userName,
  userAvatarUrl,
}: WorkspacesClientProps) {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Sync server data with client-side store on mount
  useEffect(() => {
    useWorkspaceStore.setState({
      workspaces: initialWorkspaces,
      user: userEmail ? { id: userId, email: userEmail, name: userName || "", avatar_url: userAvatarUrl ?? null } : null,
    });
    posthog.identify(userId, {
      email: userEmail,
      name: userName,
    });
    setIsMounted(true);
  }, [initialWorkspaces, userId, userEmail, userName, userAvatarUrl]);

  const storeWorkspaces = useWorkspaceStore((state) => state.workspaces);
  const storeUser = useWorkspaceStore((state) => state.user);

  // Use props for SSR and initial hydration to eliminate LCP delay,
  // then swap to Zustand store state once mounted
  const workspaces = isMounted && storeWorkspaces.length > 0 ? storeWorkspaces : initialWorkspaces;
  const currentUser = isMounted && storeUser ? storeUser : { id: userId, name: userName || "User", email: userEmail || "" };

  return (
    <>
      {/* Dashboard Main Workspace View */}
      <main className="flex-1 flex flex-col container mx-auto px-4 sm:px-6 lg:px-8 pb-2 sm:pb-4 pt-2 max-w-6xl relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="flex flex-col gap-4 mb-4 shrink-0 relative z-10">
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
                  {currentUser.name}
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
                  className="rounded-xl font-semibold shadow-xs active:scale-[0.99] transition-all duration-200 cursor-pointer relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 via-white/20 to-primary/10 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <Plus className="mr-1 h-4 w-4 relative z-10" />
                  <span className="relative z-10">New</span>
                </Button>
              )}
            </div>

            {/* Desktop Button */}
            {workspaces.length > 0 && (
              <Button
                onClick={() => setOpen(true)}
                size="sm"
                className="hidden sm:inline-flex w-full sm:w-auto rounded-xl font-semibold shadow-xs active:scale-[0.99] transition-all duration-200 cursor-pointer relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 via-white/20 to-primary/10 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Plus className="mr-1 h-4 w-4 relative z-10" />
                <span className="relative z-10">New Workspace</span>
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
            <WorkspaceList workspaces={workspaces} userId={userId} onCreateClick={() => setOpen(true)} />
          </div>
        )}

        {/* Modal Dialog for creating workspaces */}
        <Suspense fallback={null}>
          <CreateWorkspaceDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      </main>
    </>
  );
}
