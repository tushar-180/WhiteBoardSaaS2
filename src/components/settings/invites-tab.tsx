"use client";

import React, { useState, useEffect } from "react";
import { type Workspace } from "@/types/workspace";
import { type WorkspaceInvite } from "@/types/workspace";
import { getPendingInvitesAction, bulkRevokeInvitesAction, bulkInviteUsersAction, searchProfilesAction } from "@/actions/invite";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2, Loader2, Send, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import { type Profile } from "@/types/profile";

export function InvitesTab({ workspace }: { workspace: Workspace }) {
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRevoking, setIsRevoking] = useState(false);
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [emailList, setEmailList] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("viewer");
  const MAX_INVITES = 10;

  // Profile suggestion state
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Debounced profile search
  useEffect(() => {
    if (emailInput.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchProfilesAction(emailInput.trim());
        setSuggestions(results);
      } catch (err) {
        console.error("Search profiles error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [emailInput]);

  // Filter suggestions based on current input
  const filteredSuggestions = suggestions.filter(
    (p) => p.email.toLowerCase().includes(emailInput.trim().toLowerCase()),
  );

  const addEmailToList = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (emailList.includes(trimmed)) {
      toast.error(`${trimmed} is already in the list.`);
      return;
    }
    if (emailList.length >= MAX_INVITES) {
      toast.error(`Maximum ${MAX_INVITES} invites allowed.`);
      return;
    }
    setEmailList((prev) => [...prev, trimmed]);
  };

  const removeEmail = (email: string) => {
    setEmailList((prev) => prev.filter((e) => e !== email));
  };

  const selectSuggestion = (email: string) => {
    addEmailToList(email);
    setEmailInput("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = emailInput.trim();
      if (!trimmed) return;
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        toast.error("Please enter a valid email address.");
        return;
      }
      addEmailToList(trimmed);
      setEmailInput("");
    }
    if (e.key === "Backspace" && !emailInput && emailList.length > 0) {
      removeEmail(emailList[emailList.length - 1]);
    }
  };

  const lastFetchedWorkspaceId = React.useRef<string | null>(null);

  useEffect(() => {
    if (lastFetchedWorkspaceId.current === workspace.id) return;
    lastFetchedWorkspaceId.current = workspace.id;

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
    if (!emailList.length) return;

    try {
      setIsInviting(true);
      const res = await bulkInviteUsersAction(workspace.id, emailList, inviteRole as "viewer" | "editor" | "admin");
      
      if (res.successfulEmails.length > 0) {
        toast.success(`Sent invites to ${res.successfulEmails.length} user(s).`);
      }
      if (res.failedEmails.length > 0) {
        toast.error(`Failed or skipped ${res.failedEmails.length} email(s).`);
      }

      setEmailList([]);
      setEmailInput("");
      
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
      <form onSubmit={handleInvite} className="space-y-4">
        {/* Email Capsule Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="invite-emails" className="text-sm font-medium">
              Email Addresses
            </Label>
            <span className="text-xs text-muted-foreground">
              {emailList.length}/{MAX_INVITES}
            </span>
          </div>
          <div className="relative">
            <div
              className={`flex flex-wrap gap-1.5 p-2 min-h-10 rounded-xl border border-input bg-background/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all ${
                emailList.length > 0 ? "pt-2.5" : ""
              }`}
              onClick={() => document.getElementById("invite-emails")?.focus()}
            >
              {emailList.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 animate-in fade-in zoom-in-75 duration-150"
                >
                  <span className="max-w-[120px] truncate">{email}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEmail(email);
                    }}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                id="invite-emails"
                type="text"
                placeholder={emailList.length === 0 ? "Type email and press Enter..." : ""}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                autoComplete="off"
                disabled={emailList.length >= MAX_INVITES}
                className="flex-1 min-w-[160px] bg-transparent text-sm outline-none border-none ring-0 focus:ring-0 p-0.5 placeholder:text-muted-foreground/60 disabled:opacity-50"
              />
            </div>

            {searchLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Profile Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover/95 border border-border/80 rounded-xl shadow-lg p-1 space-y-0.5 max-h-48 overflow-y-auto backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="text-[10px] font-bold text-muted-foreground px-2.5 py-1 uppercase tracking-wider border-b border-border/40">
                  Registered Users
                </div>
                {filteredSuggestions.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onMouseDown={() => selectSuggestion(profile.email)}
                    className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-muted/80 flex flex-col gap-0.5 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-foreground">
                      {profile.name || profile.email.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {profile.email}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {emailList.length >= MAX_INVITES
              ? `Maximum ${MAX_INVITES} invites reached.`
              : "Press Enter to add each email. Backspace to remove the last one."}
          </p>
        </div>

        {/* Role + Send Invites row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="w-full sm:w-44 space-y-2">
            <Label htmlFor="invite-role" className="text-sm font-medium">
              Role
            </Label>
            <div className="relative">
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 hover:bg-background/80 focus:bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          <Button type="submit" disabled={isInviting || emailList.length === 0} className="w-full sm:w-auto">
            {isInviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send Invites
          </Button>
        </div>
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
                  <td className="p-3 sm:p-4 text-muted-foreground text-xs whitespace-nowrap hidden sm:table-cell">
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
