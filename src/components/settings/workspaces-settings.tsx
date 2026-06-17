"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useSettingsStore } from "@/store/settings-store";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { bulkDeleteWorkspacesAction, bulkLeaveWorkspacesAction } from "@/actions/workspace";
import { toast } from "sonner";
import { LogOut, Trash2, Loader2, Building } from "lucide-react";

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
};

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
    } catch (error: any) {
      toast.error(error.message);
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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full relative h-full flex flex-col">
      <div className="mb-4 sm:mb-6 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold">My Workspaces</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage workspaces you own or have joined.</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {workspaces.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No workspaces found.
          </div>
        ) : (
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground">
                <tr>
                  <th className="p-3 sm:p-4 w-10 sm:w-12 font-medium">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      checked={selectedIds.length === workspaces.length && workspaces.length > 0} 
                      onChange={handleSelectAll} 
                    />
                  </th>
                  <th className="p-3 sm:p-4 font-medium">Workspace Name</th>
                  <th className="p-3 sm:p-4 font-medium">Role</th>
                  <th className="p-3 sm:p-4 font-medium hidden sm:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map(workspace => {
                  const isOwned = workspace.owner_id === user?.id;
                  const role = workspace.currentUserRole || (isOwned ? "owner" : "member");
                  
                  return (
                    <tr 
                      key={workspace.id} 
                      className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer group"
                      onClick={() => setActiveWorkspaceId(workspace.id)}
                    >
                      <td className="p-3 sm:p-4" onClick={e => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          checked={selectedIds.includes(workspace.id)} 
                          onChange={(e) => handleSelect(workspace.id, e.target.checked)} 
                        />
                      </td>
                      <td className="p-3 sm:p-4 font-medium">
                        <div className="flex items-center gap-2 max-w-[120px] sm:max-w-[300px] md:max-w-[400px]">
                          <Building className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="truncate" title={workspace.name}>{workspace.name}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">
                          {role}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden sm:table-cell">
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
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-popover border shadow-lg rounded-full px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-4 animate-in slide-in-from-bottom-5 max-w-[95vw] sm:max-w-none overflow-x-auto">
          <span className="text-xs sm:text-sm font-medium mr-1 sm:mr-2 shrink-0">{selectedIds.length} selected</span>
          
          {ownedSelected.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeleting} className="shrink-0 text-xs sm:text-sm">
              {isDeleting ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" /> : <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
              Delete {ownedSelected.length}
            </Button>
          )}
          
          {joinedSelected.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleBulkLeave} disabled={isLeaving} className="shrink-0 text-xs sm:text-sm">
              {isLeaving ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" /> : <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
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
