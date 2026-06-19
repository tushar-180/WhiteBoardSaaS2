"use client";

import React, { useState, useEffect } from "react";
import { type Workspace, type WorkspaceRole } from "@/types/workspace";
import { type WorkspaceMemberWithProfile } from "@/types/workspace";
import { getWorkspaceMembersAction, bulkRemoveMembersAction, updateMemberRoleAction } from "@/actions/member";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getOptimizedAvatarUrl } from "@/lib/avatar";
import { UserCircle, Trash2, Loader2, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function MembersTab({ workspace, currentUserRole }: { workspace: Workspace, currentUserRole: WorkspaceRole }) {
  const [members, setMembers] = useState<WorkspaceMemberWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const lastFetchedWorkspaceId = React.useRef<string | null>(null);

  useEffect(() => {
    if (lastFetchedWorkspaceId.current === workspace.id) return;
    lastFetchedWorkspaceId.current = workspace.id;

    async function loadMembers() {
      try {
        const data = await getWorkspaceMembersAction(workspace.id);
        setMembers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMembers();
  }, [workspace.id]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(members.filter(m => m.role !== "owner").map(m => m.id));
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

  const handleBulkRemove = async () => {
    if (!selectedIds.length) return;
    setConfirmRemoveOpen(true);
  };

  const executeBulkRemove = async () => {
    setConfirmRemoveOpen(false);

    try {
      setIsRemoving(true);
      await bulkRemoveMembersAction(workspace.id, selectedIds);
      
      setMembers(prev => prev.filter(m => !selectedIds.includes(m.id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} member(s) removed.`);
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: WorkspaceRole) => {
    try {
      await updateMemberRoleAction(workspace.id, memberId, newRole);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      toast.success("Role updated successfully.");
    } catch (error: unknown) {
      toast.error((error as Error).message);
    }
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const isOwner = currentUserRole === "owner";
  const isAdmin = currentUserRole === "admin";

  return (
    <div className="relative pb-24 h-full">
      <div className="border border-border/50 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground">
            <tr>
              {isOwner && (
                <th className="p-3 sm:p-4 w-10 sm:w-12 font-medium">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    checked={selectedIds.length === members.filter(m => m.role !== "owner").length && members.length > 1} 
                    onChange={handleSelectAll} 
                  />
                </th>
              )}
              <th className="p-3 sm:p-4 font-medium">Member</th>
              <th className="p-3 sm:p-4 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => {
              let canChangeRole = false;
              if (isOwner && member.role !== "owner") canChangeRole = true;
              if (isAdmin && (member.role === "editor" || member.role === "viewer")) canChangeRole = true;

              return (
                <tr key={member.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  {isOwner && (
                    <td className="p-3 sm:p-4">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        checked={selectedIds.includes(member.id)} 
                        onChange={(e) => handleSelect(member.id, e.target.checked)}
                        disabled={member.role === "owner"} 
                      />
                    </td>
                  )}
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border/50">
                        {member.avatar_url ? (
                          <img src={getOptimizedAvatarUrl(member.avatar_url, 32)} alt="Avatar" width={32} height={32} loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate max-w-[100px] sm:max-w-none">{member.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-none">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4">
                    {canChangeRole ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 sm:h-8 capitalize text-xs sm:text-sm">
                            {member.role} <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {isOwner && <DropdownMenuItem onClick={() => handleRoleChange(member.id, "admin")}>Admin</DropdownMenuItem>}
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, "editor")}>Editor</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, "viewer")}>Viewer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted capitalize">
                        {member.role}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isOwner && selectedIds.length > 0 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-popover border shadow-lg rounded-full px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-4 animate-in slide-in-from-bottom-5 max-w-[95vw] sm:max-w-none">
          <span className="text-xs sm:text-sm font-medium shrink-0">{selectedIds.length} selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkRemove} disabled={isRemoving} className="shrink-0 text-xs sm:text-sm">
            {isRemoving ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" /> : <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
            Remove {selectedIds.length}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmRemoveOpen}
        onOpenChange={setConfirmRemoveOpen}
        title="Remove Members"
        description={`Are you sure you want to remove ${selectedIds.length} member(s)?`}
        confirmText={`Remove ${selectedIds.length}`}
        onConfirm={executeBulkRemove}
        variant="destructive"
        loading={isRemoving}
      />
    </div>
  );
}
