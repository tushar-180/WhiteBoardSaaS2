"use client";

import { useState } from "react";
import { type Workspace } from "@/types/workspace";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useSettingsStore } from "@/store/settings-store";
import { bulkDeleteWorkspacesAction, bulkLeaveWorkspacesAction } from "@/actions/workspace";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Trash2, LogOut, Loader2, ShieldAlert } from "lucide-react";

export function DangerZoneTab({ workspace, isOwner }: { workspace: Workspace, isOwner: boolean }) {
  const { deleteWorkspace } = useWorkspaceStore();
  const { setActiveWorkspaceId } = useSettingsStore();
  
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  const handleDelete = async () => {
    if (confirmName !== workspace.name) return;
    
    try {
      setIsDeleting(true);
      await bulkDeleteWorkspacesAction([workspace.id]);
      deleteWorkspace(workspace.id);
      setActiveWorkspaceId(null);
      toast.success("Workspace deleted successfully.");
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLeave = async () => {
    setConfirmLeaveOpen(true);
  };

  const executeLeave = async () => {
    setConfirmLeaveOpen(false);

    try {
      setIsLeaving(true);
      await bulkLeaveWorkspacesAction([workspace.id]);
      deleteWorkspace(workspace.id);
      setActiveWorkspaceId(null);
      toast.success("Left workspace successfully.");
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="border border-destructive/20 rounded-xl overflow-hidden bg-destructive/5 p-6 space-y-4">
        <div className="flex gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">
              {isOwner ? "Delete Workspace" : "Leave Workspace"}
            </h3>
            <p className="text-sm text-destructive/80 mt-1">
              {isOwner 
                ? "Permanently delete the workspace and all its boards. This action cannot be undone." 
                : "You will lose access to all boards in this workspace."}
            </p>
          </div>
        </div>

        <div className="pt-2">
          {isOwner ? (
            <div className="space-y-3 max-w-sm sm:ml-8">
              <label className="text-sm font-medium text-destructive/90">
                Type <span className="font-bold">{workspace.name}</span> to confirm
              </label>
              <Input 
                value={confirmName} 
                onChange={(e) => setConfirmName(e.target.value)}
                className="focus-visible:ring-destructive mt-2 border-destructive/30 bg-background py-2 px-3 h-10 rounded-lg shadow-sm"
                placeholder={workspace.name}
              />
              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={confirmName !== workspace.name || isDeleting}
                className="mt-2 w-full sm:w-auto rounded-lg shadow-sm"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete Workspace
              </Button>
            </div>
          ) : (
            <div className="sm:ml-8">
              <Button 
                variant="destructive" 
                onClick={handleLeave} 
                disabled={isLeaving}
                className="w-full sm:w-auto rounded-lg shadow-sm"
              >
                {isLeaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                Leave Workspace
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmLeaveOpen}
        onOpenChange={setConfirmLeaveOpen}
        title="Leave Workspace"
        description="Are you sure you want to leave this workspace? You will lose access to all boards in this workspace."
        confirmText="Leave Workspace"
        onConfirm={executeLeave}
        variant="destructive"
        loading={isLeaving}
      />
    </div>
  );
}
