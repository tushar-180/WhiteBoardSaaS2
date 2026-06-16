"use client";

import React from "react";
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
import { leaveWorkspaceAction } from "@/actions/member";
import { Loader2, LogOut } from "lucide-react";

interface LeaveWorkspaceDialogProps {
  workspaceId: string;
  workspaceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveWorkspaceDialog({
  workspaceId,
  workspaceName,
  open,
  onOpenChange,
}: LeaveWorkspaceDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirmLeave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      await leaveWorkspaceAction(workspaceId);
      toast.success(`You have left the workspace "${workspaceName}".`);
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to leave workspace.");
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-bold">Leave Workspace</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs pt-1">
            Are you sure you want to leave &quot;{workspaceName}&quot;?
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
            onClick={handleConfirmLeave}
            disabled={isLoading}
            className="h-10 rounded-xl px-4 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Leaving...
              </>
            ) : (
              "Leave Workspace"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
