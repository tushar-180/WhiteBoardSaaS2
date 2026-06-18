"use client";

import { useState, useEffect } from "react";
import { type Workspace } from "@/types/workspace";
import { type WorkspaceInvite } from "@/types/workspace";
import { getPendingInvitesAction, bulkRevokeInvitesAction, bulkInviteUsersAction } from "@/actions/invite";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
};

export function InvitesTab({ workspace }: { workspace: Workspace }) {
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRevoking, setIsRevoking] = useState(false);
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [emailsInput, setEmailsInput] = useState("");

  useEffect(() => {
    async function loadInvites() {
      try {
        const data = await getPendingInvitesAction(workspace.id);
        setInvites(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadInvites();
  }, [workspace.id]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(invites.map(i => i.id));
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

  const handleBulkRevoke = async () => {
    if (!selectedIds.length) return;
    setConfirmRevokeOpen(true);
  };

  const executeBulkRevoke = async () => {
    setConfirmRevokeOpen(false);

    try {
      setIsRevoking(true);
      await bulkRevokeInvitesAction(workspace.id, selectedIds);
      
      setInvites(prev => prev.filter(i => !selectedIds.includes(i.id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} invite(s) revoked.`);
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setIsRevoking(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailList = emailsInput.split(",").map(e => e.trim()).filter(e => e);
    if (!emailList.length) return;

    try {
      setIsInviting(true);
      const res = await bulkInviteUsersAction(workspace.id, emailList, "viewer");
      
      if (res.successfulEmails.length > 0) {
        toast.success(`Sent invites to ${res.successfulEmails.length} user(s).`);
      }
      if (res.failedEmails.length > 0) {
        toast.error(`Failed or skipped ${res.failedEmails.length} email(s).`);
      }

      setEmailsInput("");
      
      // Reload invites
      const data = await getPendingInvitesAction(workspace.id);
      setInvites(data);
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="relative pb-24 h-full flex flex-col gap-6 sm:gap-8">
      <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start">
        <div className="flex-1 space-y-2">
          <Input 
            placeholder="email@example.com, another@example.com..." 
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Separate multiple emails with commas. Sent as viewer by default.</p>
        </div>
        <Button type="submit" disabled={isInviting || !emailsInput.trim()} className="w-full sm:w-auto">
          {isInviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Send Invites
        </Button>
      </form>

      {invites.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-border/50 rounded-lg bg-muted/20">
          No pending invites.
        </div>
      ) : (
        <div className="border border-border/50 rounded-lg overflow-hidden flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border/50 text-muted-foreground sticky top-0">
              <tr>
                <th className="p-3 sm:p-4 w-10 sm:w-12 font-medium">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    checked={selectedIds.length === invites.length && invites.length > 0} 
                    onChange={handleSelectAll} 
                  />
                </th>
                <th className="p-3 sm:p-4 font-medium">Email</th>
                <th className="p-3 sm:p-4 font-medium">Role</th>
                <th className="p-3 sm:p-4 font-medium hidden sm:table-cell">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {invites.map(invite => (
                <tr key={invite.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3 sm:p-4">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      checked={selectedIds.includes(invite.id)} 
                      onChange={(e) => handleSelect(invite.id, e.target.checked)} 
                    />
                  </td>
                  <td className="p-3 sm:p-4 font-medium max-w-[120px] sm:max-w-none truncate">{invite.email}</td>
                  <td className="p-3 sm:p-4 capitalize">{invite.role}</td>
                  <td className="p-3 sm:p-4 text-muted-foreground hidden sm:table-cell">
                    {formatDate(invite.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 bg-popover border shadow-lg rounded-full px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-4 animate-in slide-in-from-bottom-5 max-w-[95vw] sm:max-w-none">
          <span className="text-xs sm:text-sm font-medium shrink-0">{selectedIds.length} selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkRevoke} disabled={isRevoking} className="shrink-0 text-xs sm:text-sm">
            {isRevoking ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" /> : <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
            Revoke {selectedIds.length}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmRevokeOpen}
        onOpenChange={setConfirmRevokeOpen}
        title="Revoke Invites"
        description={`Are you sure you want to revoke ${selectedIds.length} invite(s)?`}
        confirmText={`Revoke ${selectedIds.length}`}
        onConfirm={executeBulkRevoke}
        variant="destructive"
        loading={isRevoking}
      />
    </div>
  );
}
