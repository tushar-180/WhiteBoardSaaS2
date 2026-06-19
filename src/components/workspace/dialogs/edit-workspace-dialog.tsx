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
import { updateWorkspaceAction } from "@/actions/workspace";
import { workspaceSchema, type WorkspaceFormData } from "@/types/workspace";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface EditWorkspaceDialogProps {
  workspaceId: string;
  initialName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditWorkspaceDialog({
  workspaceId,
  initialName,
  open,
  onOpenChange,
  onSuccess,
}: EditWorkspaceDialogProps) {
  const [loading, setLoading] = useState(false);
  const { workspaces, setWorkspaces } = useWorkspaceStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: initialName,
    },
  });

  // Sync with new initials if dialog target changes
  useEffect(() => {
    if (open) {
      reset({
        name: initialName,
      });
    }
  }, [open, initialName, reset]);

  const onSubmit = async (data: WorkspaceFormData) => {
    setLoading(true);
    try {
      const updatedWorkspace = await updateWorkspaceAction(workspaceId, data.name);
      
      // Update global store
      setWorkspaces(
        workspaces.map((ws) => (ws.id === workspaceId ? { ...ws, name: updatedWorkspace.name } : ws))
      );

      toast.success(`Workspace renamed successfully!`);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      toast.error(
        (error as Error).message || "Failed to update workspace. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} loading={loading}>
      <DialogContent className="sm:max-w-md rounded-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Edit3 className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold">Rename Workspace</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Modify the name of your workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-workspace-name" className="text-xs font-semibold">
              Workspace Name
            </Label>
            <Input
              id="edit-workspace-name"
              type="text"
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
              type="submit"
              disabled={loading || !isDirty}
              className="h-10 rounded-xl px-4 font-semibold w-full sm:w-auto"
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
