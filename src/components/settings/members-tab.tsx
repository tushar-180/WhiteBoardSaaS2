"use client";

import { useState, useEffect } from "react";
import { type Workspace, type WorkspaceRole } from "@/types/workspace";
import { type WorkspaceMemberWithProfile } from "@/types/workspace";
import { getWorkspaceMembersAction, bulkRemoveMembersAction, updateMemberRoleAction } from "@/actions/member";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserCircle, Trash2, Loader2, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function MembersTab({ workspace, currentUserRole }: { workspace: Workspace, currentUserRole: WorkspaceRole }) {
  const [members, setMembers] = useState<WorkspaceMemberWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
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
    if (!confirm(`Are you sure you want to remove ${selectedIds.length} member(s)?`)) return;

    try {
      setIsRemoving(true);
      await bulkRemoveMembersAction(workspace.id, selectedIds);
      
      setMembers(prev => prev.filter(m => !selectedIds.includes(m.id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} member(s) removed.`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: WorkspaceRole) => {
    try {
      await updateMemberRoleAction(workspace.id, memberId, newRole);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      toast.success("Role updated successfully.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const isOwner = currentUserRole === "owner";
  const isAdmin = currentUserRole === "admin";

  return (
    <div className="relative pb-24 h-full">
      <div className="border border-border/50 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground">
            <tr>
              {isOwner && (
                <th className="p-4 w-12 font-medium">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    checked={selectedIds.length === members.filter(m => m.role !== "owner").length && members.length > 1} 
                    onChange={handleSelectAll} 
                  />
                </th>
              )}
              <th className="p-4 font-medium">Member</th>
              <th className="p-4 font-medium">Role</th>
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
                    <td className="p-4">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        checked={selectedIds.includes(member.id)} 
                        onChange={(e) => handleSelect(member.id, e.target.checked)}
                        disabled={member.role === "owner"} 
                      />
                    </td>
                  )}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border/50">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{member.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {canChangeRole ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 capitalize">
                            {member.role} <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-popover border shadow-lg rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium mr-2">{selectedIds.length} selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkRemove} disabled={isRemoving}>
            {isRemoving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Remove {selectedIds.length}
          </Button>
        </div>
      )}
    </div>
  );
}
