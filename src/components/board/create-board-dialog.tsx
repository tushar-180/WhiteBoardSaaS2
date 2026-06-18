"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LayoutGrid } from "lucide-react";
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
import { createBoardAction } from "@/actions/board";
import { boardSchema, type BoardFormData } from "@/types/workspace";
import { useBoardStore } from "@/store/use-board-store";

interface CreateBoardDialogProps {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateBoardDialog({
  workspaceId,
  open,
  onOpenChange,
  onSuccess,
}: CreateBoardDialogProps) {

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: BoardFormData) => {
    setLoading(true);
    try {
      const newBoard = await createBoardAction(
        workspaceId,
        data.name,
        data.description || null
      );
      useBoardStore.getState().addBoard(newBoard);
      toast.success(`Board "${newBoard.name}" created successfully!`);
      reset();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      toast.error(
        (error as Error).message || "Failed to create board. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} loading={loading}>
      <DialogContent className="w-[95vw] max-w-md rounded-2xl sm:rounded-2xl p-5 sm:p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold">New Board</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Create a whiteboard canvas to start planning and drawing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="board-name" className="text-xs font-semibold">
              Board Name
            </Label>
            <Input
              id="board-name"
              type="text"
              placeholder="e.g. User Journey Map, Architecture Sketch"
              className="h-10 rounded-xl bg-background/50 hover:bg-background/80 focus:bg-background"
              disabled={loading}
              maxLength={50}
              {...register("name")}
            />
            {errors.name && (
              <span className="text-xs font-medium text-destructive px-1">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-desc" className="text-xs font-semibold">
              Description (Optional)
            </Label>
            <Input
              id="board-desc"
              type="text"
              placeholder="Brief summary of the board's purpose"
              className="h-10 rounded-xl bg-background/50 hover:bg-background/80 focus:bg-background"
              disabled={loading}
              maxLength={255}
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
              className="h-10 rounded-xl w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 rounded-xl px-4 font-semibold w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Board"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
