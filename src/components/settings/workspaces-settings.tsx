"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { bulkDeleteWorkspacesAction, bulkLeaveWorkspacesAction } from "@/actions/workspace";
import { toast } from "sonner";
import { LogOut, Trash2, Loader2, Crown, Users } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

export function WorkspacesSettings() {
  const { workspaces, user, deleteWorkspace } = useWorkspaceStore();
  const { setActiveWorkspaceId } = useSettingsStore();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(workspaces.map(w => w.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const selectedWorkspaces = workspaces.filter(w => selectedIds.includes(w.id));
  const ownedSelected = selectedWorkspaces.filter(w => w.owner_id === user?.id);
  const joinedSelected = selectedWorkspaces.filter(w => w.owner_id !== user?.id);

  const handleBulkDelete = async () => {
    if (!ownedSelected.length) return;
    setConfirmDeleteOpen(true);
  };

  const executeBulkDelete = async () => {
    setConfirmDeleteOpen(false);
    const idsToDelete = ownedSelected.map(w => w.id);

    try {
      setIsDeleting(true);
      await bulkDeleteWorkspacesAction(idsToDelete);
      
      // Update local store optimistically
      idsToDelete.forEach(id => deleteWorkspace(id));
      setSelectedIds(prev => prev.filter(id => !idsToDelete.includes(id)));
      toast.success(`${idsToDelete.length} workspace(s) deleted successfully.`);
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkLeave = async () => {
    if (!joinedSelected.length) return;
    setConfirmLeaveOpen(true);
  };

  const executeBulkLeave = async () => {
    setConfirmLeaveOpen(false);
    const idsToLeave = joinedSelected.map(w => w.id);

    try {
      setIsLeaving(true);
      await bulkLeaveWorkspacesAction(idsToLeave);
      
      // Update local store optimistically
      idsToLeave.forEach(id => deleteWorkspace(id));
      setSelectedIds(prev => prev.filter(id => !idsToLeave.includes(id)));
      toast.success(`Left ${idsToLeave.length} workspace(s) successfully.`);
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col flex-1 space-y-6 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Workspaces</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage workspaces you own or have joined.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {workspaces.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground border border-border rounded-lg bg-card/50">
            No workspaces found.
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-card flex-1 relative shadow-sm">
            <table className="w-full text-left text-sm table-fixed">
              <thead className="bg-card sticky top-0 z-10 border-b border-border text-muted-foreground shadow-sm">
                <tr>
                  <th className="p-3 sm:p-4 w-12 font-medium">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground cursor-pointer bg-background"
                      checked={selectedIds.length === workspaces.length && workspaces.length > 0} 
                      onChange={handleSelectAll} 
                    />
                  </th>
                  <th className="p-3 sm:p-4 text-xs uppercase tracking-wider font-semibold">Workspace Name</th>
                  <th className="p-3 sm:p-4 w-24 sm:w-32 text-xs uppercase tracking-wider font-semibold">Role</th>
                  <th className="p-3 sm:p-4 w-28 sm:w-40 text-xs uppercase tracking-wider font-semibold hidden sm:table-cell">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {workspaces.map(workspace => {
                  const isOwned = workspace.owner_id === user?.id;
                  const role = workspace.currentUserRole || (isOwned ? "owner" : "member");
                  
                  return (
                    <tr 
                      key={workspace.id} 
                      className="group transition-colors hover:bg-muted/30 cursor-pointer"
                      onClick={() => setActiveWorkspaceId(workspace.id)}
                    >
                      <td className="p-3 sm:p-4" onClick={e => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground cursor-pointer bg-background"
                          checked={selectedIds.includes(workspace.id)} 
                          onChange={(e) => handleSelect(workspace.id, e.target.checked)} 
                        />
                      </td>
                      <td className="p-3 sm:p-4 font-medium text-foreground truncate">
                        <div className="flex items-center gap-2">
                          {isOwned ? (
                            <Crown className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="truncate" title={workspace.name}>{workspace.name}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase",
                          role === "owner" ? "bg-amber-500/10 text-amber-600 dark:text-amber-500" :
                          role === "editor" ? "bg-blue-500/10 text-blue-600 dark:text-blue-500" :
                          "bg-muted text-foreground"
                        )}>
                          {role}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden sm:table-cell text-xs whitespace-nowrap">
                        {formatDate(workspace.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border shadow-md rounded-xl px-4 py-2.5 flex items-center gap-3 animate-in slide-in-from-bottom-5 max-w-[95vw] sm:max-w-none overflow-x-auto">
          <span className="text-xs font-semibold mr-1 shrink-0 text-foreground">{selectedIds.length} selected</span>
          
          {ownedSelected.length > 0 && (
            <Button variant="default" size="sm" onClick={handleBulkDelete} disabled={isDeleting} className="shrink-0 h-8 text-xs bg-red-600 hover:bg-red-700 text-white">
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
              Delete {ownedSelected.length}
            </Button>
          )}
          
          {joinedSelected.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleBulkLeave} disabled={isLeaving} className="shrink-0 h-8 text-xs">
              {isLeaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5 mr-1.5" />}
              Leave {joinedSelected.length}
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete Workspaces"
        description={`Are you sure you want to delete ${ownedSelected.length} workspace(s)? This action cannot be undone.`}
        confirmText={`Delete ${ownedSelected.length}`}
        onConfirm={executeBulkDelete}
        variant="destructive"
        loading={isDeleting}
      />

      <ConfirmDialog
        open={confirmLeaveOpen}
        onOpenChange={setConfirmLeaveOpen}
        title="Leave Workspaces"
        description={`Are you sure you want to leave ${joinedSelected.length} workspace(s)?`}
        confirmText={`Leave ${joinedSelected.length}`}
        onConfirm={executeBulkLeave}
        variant="destructive"
        loading={isLeaving}
      />
    </div>
  );
}
