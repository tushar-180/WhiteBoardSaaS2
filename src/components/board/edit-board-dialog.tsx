"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Edit3 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBoardAction } from "@/actions/board";
import { boardSchema, type BoardFormData } from "@/types/workspace";
import { useBoardStore } from "@/store/use-board-store";

interface EditBoardDialogProps {
  workspaceId: string;
  boardId: string;
  initialName: string;
  initialDescription: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditBoardDialog({
  workspaceId,
  boardId,
  initialName,
  initialDescription,
  open,
  onOpenChange,
  onSuccess,
}: EditBoardDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      name: initialName,
      description: initialDescription || "",
    },
  });

  // Sync with new initials if dialog target changes
  useEffect(() => {
    if (open) {
      reset({
        name: initialName,
        description: initialDescription || "",
      });
    }
  }, [open, initialName, initialDescription, reset]);

  const onSubmit = async (data: BoardFormData) => {
    setLoading(true);
    try {
      const updatedBoard = await updateBoardAction(
        workspaceId,
        boardId,
        data.name,
        data.description || null
      );
      useBoardStore.getState().updateBoard(updatedBoard);
      toast.success(`Board updated successfully!`);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      toast.error(
        (error as Error).message || "Failed to update board. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Edit3 className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold">Edit Board</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Modify the board&apos;s name and description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-board-name" className="text-xs font-semibold">
              Board Name
            </Label>
            <Input
              id="edit-board-name"
              type="text"
              className="h-10 rounded-xl bg-background/50 hover:bg-background/80 focus:bg-background"
              disabled={loading}
              {...register("name")}
            />
            {errors.name && (
              <span className="text-xs font-medium text-destructive px-1">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-board-desc" className="text-xs font-semibold">
              Description (Optional)
            </Label>
            <Input
              id="edit-board-desc"
              type="text"
              className="h-10 rounded-xl bg-background/50 hover:bg-background/80 focus:bg-background"
              disabled={loading}
              {...register("description")}
            />
            {errors.description && (
              <span className="text-xs font-medium text-destructive px-1">
                {errors.description.message}
              </span>
            )}
          </div>

          <DialogFooter className="sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isDirty}
              className="h-10 rounded-xl px-4 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
