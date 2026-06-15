"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, ArrowRight, Trash2, Edit, Info } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { type Board, type WorkspaceRole } from "@/types/workspace";
import { EditBoardDialog } from "./edit-board-dialog";
import { DeleteBoardDialog } from "./delete-board-dialog";



interface BoardCardProps {
  board: Board;
  currentUserRole: WorkspaceRole;
}

export function BoardCard({ board, currentUserRole }: BoardCardProps) {
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  const formattedDate = new Date(board.created_at).toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );

  const formattedUpdatedDate = new Date(board.updated_at).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );

  const canEditBoard = currentUserRole === "owner" || currentUserRole === "admin";

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };



  return (
    <>
      <Link href={`/board/${board.id}`} className="block group">
        <Card className="h-full min-h-[160px] flex flex-col border border-border/60 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30 relative overflow-hidden rounded-xl p-4 sm:p-5 gap-0 ring-0 group cursor-pointer focus-within:ring-2 focus-within:ring-primary/50">
          {/* Decorative corner shape */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500" />

          {/* Action buttons (revealed on hover) */}
          <div className="absolute top-4 right-4 z-20 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
            {canEditBoard && (
              <>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="p-1.5 rounded-lg bg-background/80 hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500 border border-border/50 transition-colors duration-200 cursor-pointer"
                  title="Edit Board"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="p-1.5 rounded-lg bg-background/80 hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/50 transition-colors duration-200 cursor-pointer"
                  title="Delete Board"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}

          </div>

          <CardHeader className="p-0 gap-0 relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Board
              </span>
            </div>

            <CardTitle className="text-base font-bold text-foreground group-hover:text-indigo-500 transition-colors duration-200 truncate pr-16">
              {board.name}
            </CardTitle>

            <CardDescription className="text-xs text-muted-foreground/80 mt-1.5 line-clamp-2 min-h-[2rem]">
              {board.description || "No description provided."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 mt-5 flex items-center justify-between border-t border-border/40 pt-4 relative z-10">
            <div className="flex items-center gap-1.5 overflow-hidden pr-2">
              <span
                className="text-[11px] text-muted-foreground truncate"
                suppressHydrationWarning
              >
                Updated: {formattedUpdatedDate}
              </span>
              <div 
                className="text-muted-foreground/50 hover:text-indigo-500 transition-colors cursor-help shrink-0" 
                title={`Created: ${formattedDate}`}
              >
                <Info className="h-3 w-3" />
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shrink-0">
              Open Board{" "}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </CardContent>
        </Card>
      </Link>

      <EditBoardDialog
        workspaceId={board.workspace_id}
        boardId={board.id}
        initialName={board.name}
        initialDescription={board.description}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <DeleteBoardDialog
        workspaceId={board.workspace_id}
        boardId={board.id}
        boardName={board.name}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
