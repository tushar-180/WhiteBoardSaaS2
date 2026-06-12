"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { type Board } from "@/types/workspace";
import { ROUTES } from "@/lib/constants";
import WhiteboardSaveStatus from "./whiteboard-save-status";

interface EditorHeaderProps {
  board: Board;
  onSave: () => void;
}

export function EditorHeader({ board, onSave }: EditorHeaderProps) {
  return (
    <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <Link
          href={`${ROUTES.WORKSPACES}/${board.workspace_id}`}
          className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
          title="Back to Workspace"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-foreground truncate">
            {board.name}
          </span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[250px]">
            {board.description || "No description"}
          </span>
        </div>
      </div>

      {/* Real-time Save Status Indicators */}
      <WhiteboardSaveStatus onSave={onSave} />
    </header>
  );
}
