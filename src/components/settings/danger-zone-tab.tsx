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
import { Trash2, LogOut, Loader2, AlertTriangle } from "lucide-react";

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
    } catch (error: any) {
      toast.error(error.message);
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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="border border-red-200 dark:border-red-900/50 rounded-lg overflow-hidden bg-red-50/50 dark:bg-red-950/10">
        <div className="p-6 border-b border-red-200 dark:border-red-900/50 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <h3 className="font-bold text-red-600 text-lg">Danger Zone</h3>
            <p className="text-sm text-red-600/80 mt-1">
              Proceed with caution. Actions taken here are irreversible.
            </p>
          </div>
        </div>

        <div className="p-6">
          {isOwner ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Delete Workspace</h4>
              <p className="text-sm text-muted-foreground">
                This will permanently delete the workspace and all its boards.
              </p>
              
              <div className="space-y-2 mt-4 max-w-sm">
                <label className="text-sm font-medium">Type <span className="font-bold">{workspace.name}</span> to confirm</label>
                <Input 
                  value={confirmName} 
                  onChange={(e) => setConfirmName(e.target.value)}
                  className="border-red-200 focus-visible:ring-red-500"
                />
              </div>

              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={confirmName !== workspace.name || isDeleting}
                className="mt-4"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete Workspace
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Leave Workspace</h4>
              <p className="text-sm text-muted-foreground">
                You will lose access to all boards in this workspace.
              </p>

              <Button 
                variant="destructive" 
                onClick={handleLeave} 
                disabled={isLeaving}
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
