"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, ArrowRight, Trash2, Edit, LogOut } from "lucide-react";
import { toast } from "sonner";
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
import { leaveWorkspaceAction } from "@/actions/member";

interface BoardCardProps {
  board: Board;
  workspaceId: string;
  currentUserRole: WorkspaceRole;
}

export function BoardCard({ board, workspaceId, currentUserRole }: BoardCardProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const formattedDate = new Date(board.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const canEditBoard = currentUserRole === "owner" || currentUserRole === "admin";
  const canLeaveWorkspace = currentUserRole !== "owner";

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

  const handleLeaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLeaving(true);
    try {
      await leaveWorkspaceAction(workspaceId);
      toast.success("You have left the workspace.");
      router.push("/workspaces");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to leave workspace.");
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <>
      <Link href={`/board/${board.id}`} className="block group">
        <Card className="h-full border border-border/60 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30 relative overflow-hidden rounded-xl p-5 gap-0 ring-0">
          {/* Decorative corner shape */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-300" />

          {/* Action buttons (revealed on hover) */}
          <div className="absolute top-4 right-4 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {canEditBoard && (
              <>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="p-1.5 rounded-lg bg-background/80 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/50 transition-colors duration-200 cursor-pointer"
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
            {canLeaveWorkspace && (
              <button
                type="button"
                onClick={handleLeaveClick}
                disabled={isLeaving}
                className="p-1.5 rounded-lg bg-background/80 hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 border border-border/50 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Leave Workspace"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <CardHeader className="p-0 gap-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Board
              </span>
            </div>

            <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 truncate pr-16">
              {board.name}
            </CardTitle>

            <CardDescription className="text-xs text-muted-foreground/80 mt-1.5 line-clamp-2 min-h-[2rem]">
              {board.description || "No description provided."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 mt-5 flex items-center justify-between border-t border-border/40 pt-4">
            <span
              className="text-[11px] text-muted-foreground"
              suppressHydrationWarning
            >
              Created: {formattedDate}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-all duration-300">
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
