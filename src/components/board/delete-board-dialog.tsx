"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteBoardAction } from "@/actions/board";
import { useBoardStore } from "@/store/use-board-store";

interface DeleteBoardDialogProps {
  workspaceId: string;
  boardId: string;
  boardName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteBoardDialog({
  workspaceId,
  boardId,
  boardName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteBoardDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteBoardAction(workspaceId, boardId);
      useBoardStore.getState().deleteBoard(boardId);
      toast.success(`Board "${boardName}" deleted successfully!`);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      toast.error(
        (error as Error).message || "Failed to delete board. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} loading={loading}>
      <DialogContent className="sm:max-w-md rounded-2xl sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold">Delete Board</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Are you sure you want to delete <strong className="text-foreground font-semibold">&quot;{boardName}&quot;</strong>? This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-10 rounded-xl w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="h-10 rounded-xl px-4 font-semibold cursor-pointer w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Board"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
