"use client";

import { Trash2, Loader2 } from "lucide-react";
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
import { deleteWorkspaceAction } from "@/actions/workspace";
import { useWorkspaceStore } from "@/store/use-workspace-store";

interface DeleteWorkspaceDialogProps {
  workspaceId: string;
  workspaceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWorkspaceDialog({
  workspaceId,
  workspaceName,
  open,
  onOpenChange,
}: DeleteWorkspaceDialogProps) {
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const setLoading = useWorkspaceStore((state) => state.setLoading);

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await deleteWorkspaceAction(workspaceId);
      toast.success(`Workspace "${workspaceName}" deleted successfully!`);
      deleteWorkspace(workspaceId);
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to delete workspace. Please try again.");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Trash2 className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold">Delete Workspace</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs pt-1">
            Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{workspaceName}&quot;</span>? 
            This action cannot be undone. All boards and data in this workspace will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="h-10 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="h-10 rounded-xl px-4 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Workspace"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
