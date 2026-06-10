"use client";

import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BoardCard } from "./board-card";
import { type Board, type WorkspaceRole } from "@/types/workspace";

interface BoardListProps {
  boards: Board[];
  currentUserRole: WorkspaceRole;
  onCreateClick: () => void;
}

export function BoardList({
  boards,
  currentUserRole,
  onCreateClick,
}: BoardListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {/* Create New Board Card – only for non‑viewer roles */}
      {currentUserRole !== "viewer" && currentUserRole !== "editor" && (
        <button
          onClick={onCreateClick}
          className="block text-left group h-full cursor-pointer focus:outline-none"
        >
          <Card className="h-full min-h-[160px] border border-dashed border-border/100 bg-background/30 transition-all duration-300 hover:border-primary/60 hover:bg-muted/10 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 ring-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 border border-border/80 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 shadow-xs">
              <Plus className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm text-foreground/80 group-hover:text-primary transition-colors duration-200">
              Create Board
            </span>
            <span className="text-[11px] text-muted-foreground max-w-[180px] leading-relaxed">
              Create a new whiteboard canvas for your designs.
            </span>
          </Card>
        </button>
      )}

      {/* Boards List */}
      {boards.map((board) => (
        <BoardCard
          key={board.id}
          board={board}
          currentUserRole={currentUserRole}
        />
      ))}
    </div>
  );
}
