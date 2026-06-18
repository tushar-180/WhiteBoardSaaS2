"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, FolderPlus } from "lucide-react";
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
import { createWorkspaceAction } from "@/actions/workspace";
import { workspaceSchema, type WorkspaceFormData } from "@/types/workspace";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: WorkspaceFormData) => {
    setLoading(true);
    try {
      const newWorkspace = await createWorkspaceAction(data.name);
      toast.success(`Workspace "${newWorkspace.name}" created successfully!`);
      reset();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to create workspace. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-md rounded-2xl sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderPlus className="h-4 w-4" />
            </div>
            <DialogTitle className="text-lg font-bold">New Workspace</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Workspaces organize your boards and collaboration settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="workspace-name" className="text-xs font-semibold">
              Workspace Name
            </Label>
            <Input
              id="workspace-name"
              type="text"
              placeholder="e.g. Acme Corporation, Side Project"
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
              disabled={loading}
              className="h-10 rounded-xl px-4 font-semibold w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
