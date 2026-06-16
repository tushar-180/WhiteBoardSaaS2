"use client";

import { LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type WorkspaceRole } from "@/types/workspace";

interface EmptyBoardsProps {
  onCreateClick: () => void;
  currentUserRole?: WorkspaceRole;
}

export function EmptyBoards({ onCreateClick, currentUserRole = "owner" }: EmptyBoardsProps) {
  const canCreate = currentUserRole !== "viewer" && currentUserRole !== "editor";

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center bg-card/40 border border-border/60 rounded-2xl shadow-xs backdrop-blur-xs relative overflow-hidden transition-all duration-300 max-w-lg mx-auto w-full">
      {/* Background decoration grid/dots pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(hsl(var(--foreground)/0.08)_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 shadow-xs">
        <LayoutGrid className="h-8 w-8" />
        {canCreate && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-background border border-border/50 text-muted-foreground shadow-xs">
            <Plus className="h-3.5 w-3.5 text-primary" />
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold tracking-tight text-foreground mb-2">
        No Boards in this Workspace
      </h3>
      
      {canCreate ? (
        <>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
            Boards are canvases where you sketch diagrams, brainstorm, and create flows. Create your first one to get started.
          </p>
          <Button
            onClick={onCreateClick}
            size="sm"
            className="rounded-xl font-semibold shadow-xs active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Board
          </Button>
        </>
      ) : (
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mb-2 leading-relaxed">
          This workspace currently doesn&apos;t have any boards.
        </p>
      )}
    </div>
  );
}
