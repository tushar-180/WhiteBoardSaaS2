"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { WorkspaceList } from "./workspace-list";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { type Workspace } from "@/types/workspace";
import { signOutAction } from "@/actions/auth";

interface WorkspacesClientProps {
  initialWorkspaces: Workspace[];
  userEmail?: string;
}

export function WorkspacesClient({ initialWorkspaces, userEmail }: WorkspacesClientProps) {
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);

  const handleDeleteSuccess = (id: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="Zentrox Logo"
              width={32}
              height={32}
              className="object-contain h-auto"
            />
            <span className="font-black tracking-tight text-lg text-foreground">
              Zentrox
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-xs text-muted-foreground hidden sm:inline-block font-medium">
                {userEmail}
              </span>
            )}
            <form action={signOutAction}>
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="rounded-xl text-muted-foreground hover:text-foreground gap-1.5 h-9 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Dashboard Main Workspace View */}
      <main className="flex-1 container mx-auto px-6 py-10 max-w-6xl">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Workspaces
              </h1>
              <p className="text-sm text-muted-foreground">
                Collaborative environments where you store and share whiteboard canvases.
              </p>
            </div>
            {workspaces.length > 0 && (
              <Button
                onClick={() => setOpen(true)}
                size="sm"
                className="rounded-xl font-semibold shadow-xs active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                <Plus className="mr-1 h-4 w-4" />
                New Workspace
              </Button>
            )}
          </div>
        </div>

        {workspaces.length === 0 ? (
          <EmptyState onCreateClick={() => setOpen(true)} />
        ) : (
          <WorkspaceList
            workspaces={workspaces}
            onCreateClick={() => setOpen(true)}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}

        {/* Modal Dialog for creating workspaces */}
        <CreateWorkspaceDialog open={open} onOpenChange={setOpen} />
      </main>
    </div>
  );
}
