"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  ArrowLeft,
  Users,
  Calendar,
  Hash,
  Shield,
  MoreVertical,
  Trash2,
  Copy,
  Check,
  X,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BoardList } from "@/components/board/board-list";
import { EmptyBoards } from "@/components/board/empty-boards";
import { CreateBoardDialog } from "@/components/board/create-board-dialog";
import { InviteMemberDialog } from "@/components/workspace/invite-member-dialog";
import {
  type Workspace,
  type Board,
  type WorkspaceInvite,
  type WorkspaceRole,
} from "@/types/workspace";
import { type WorkspaceMemberWithProfile } from "@/services/member";
import { useBoardStore } from "@/store/use-board-store";
import { useMemberStore } from "@/store/use-member-store";
import { removeMemberAction, updateMemberRoleAction } from "@/actions/member";
import { revokeInviteAction } from "@/actions/invite";
import RootLoading from "@/app/loading";
import { ROUTES } from "@/lib/constants";

interface WorkspaceDetailsClientProps {
  workspace: Workspace;
  initialBoards: Board[];
  initialMembers: WorkspaceMemberWithProfile[];
  initialInvites: WorkspaceInvite[];
  currentUserRole: WorkspaceRole;
  userEmail?: string;
}

export function WorkspaceDetailsClient({
  workspace,
  initialBoards,
  initialMembers,
  initialInvites,
  currentUserRole,
  userEmail,
}: WorkspaceDetailsClientProps) {
  const router = useRouter();
  const [boardOpen, setBoardOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Track copy states for invites
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  // Active member action menu state
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync server data with client-side Zustand store on mount/update
  useEffect(() => {
    useBoardStore.setState({
      boards: initialBoards,
    });
    useMemberStore.setState({
      members: initialMembers,
      invites: initialInvites,
    });
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, [initialBoards, initialMembers, initialInvites]);

  // Click outside to close member action menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuMemberId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const boards = useBoardStore((state) => state.boards);
  const members = useMemberStore((state) => state.members);
  const invites = useMemberStore((state) => state.invites);

  if (!isMounted) {
    return <RootLoading />;
  }

  const formattedDate = new Date(workspace.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  const handleCopyInviteLink = (invite: WorkspaceInvite) => {
    // Reconstruct magic invite link
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteLink = `${origin}/invite/${invite.token}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInviteId(invite.id);
    toast.success("Magic link copied to clipboard!");
    setTimeout(() => setCopiedInviteId(null), 2000);
  };

  const handleRevokeInvite = async (inviteId: string) => {
    setActionLoading(true);
    try {
      await revokeInviteAction(workspace.id, inviteId);
      toast.success("Invitation revoked successfully.");
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to revoke invitation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setActionLoading(true);
    setActiveMenuMemberId(null);
    try {
      await removeMemberAction(workspace.id, memberId);
      toast.success("Member removed from workspace.");
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to remove member.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: WorkspaceRole) => {
    setActionLoading(true);
    setActiveMenuMemberId(null);
    try {
      await updateMemberRoleAction(workspace.id, memberId, newRole);
      toast.success(`Role updated to ${newRole}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to update member role.");
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeClass = (role: WorkspaceRole) => {
    switch (role) {
      case "owner":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "admin":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
      case "editor":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "viewer":
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  return (
    <>
      {/* Main Container */}
      <main className="flex-1 container mx-auto px-6 py-10 max-w-7xl relative">
        {actionLoading && (
          <div className="fixed inset-0 z-50 bg-background/30 backdrop-blur-xs flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Back navigation */}
        <Link
          href={ROUTES.WORKSPACES}
          className="inline-flex items-center gap-1.5 text-xs mb-6 font-semibold text-muted-foreground hover:text-foreground transition-all w-fit hover:-translate-x-0.5 duration-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Workspaces
        </Link>

        {/* Workspace Title & Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left / Center - Boards Content (Col Span 3) */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-1.5">
                  {workspace.name}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground/80 font-mono leading-relaxed">
                  /{workspace.slug}
                </p>
              </div>

              {boards.length > 0 && currentUserRole !== "viewer" && (
                <Button
                  onClick={() => setBoardOpen(true)}
                  size="sm"
                  className="rounded-xl font-semibold shadow-xs active:scale-[0.99] transition-all duration-200 cursor-pointer"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  New Board
                </Button>
              )}
            </div>

            <div className="border-t border-border/40 pt-6">
              {boards.length === 0 ? (
                currentUserRole !== "viewer" && (
                  <EmptyBoards onCreateClick={() => setBoardOpen(true)} />
                )
              ) : (
                <BoardList
                  boards={boards}
                  workspaceId={workspace.id}
                  currentUserRole={currentUserRole}
                  onCreateClick={() => setBoardOpen(true)}
                />
              )}
            </div>
          </div>

          {/* Right - Sidebar Metadata (Col Span 1) */}
          <div className="space-y-6 lg:border-l lg:border-border/40 lg:pl-8">
            {/* Workspace Info Card */}
            <div className="rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-xs space-y-4">
              <h3 className="text-sm font-bold text-foreground">
                Workspace Info
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4 shrink-0 text-primary/70" />
                  <span className="font-mono truncate">{workspace.id}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                  <span>Created {formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 shrink-0 text-primary/70" />
                  <span className="capitalize">Role: {currentUserRole}</span>
                </div>
              </div>
            </div>

            {/* Active Members Card */}
            <div className="rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary/80" />
                  Members
                </h3>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                  {members.length}
                </span>
              </div>

              <div className="space-y-3">
                {members.map((member) => {
                  const isOwner = member.role === "owner";
                  // Current user cannot edit their own details, and admins cannot edit other admins/owners
                  const isSelf = member.email === userEmail;
                  const canEditThisMember =
                    canManage &&
                    !isSelf &&
                    !isOwner &&
                    !(currentUserRole === "admin" && member.role === "admin");

                  const initials = (member.name || member.email)
                    .split("@")[0]
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-2 group relative"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-xs shrink-0">
                          {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-none">
                            {member.name || member.email.split("@")[0]}
                          </span>
                          <span className="text-[9px] text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                            {member.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold font-mono ${getRoleBadgeClass(member.role)}`}
                        >
                          {member.role}
                        </span>

                        {canEditThisMember && (
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setActiveMenuMemberId(
                                  member.id === activeMenuMemberId
                                    ? null
                                    : member.id,
                                )
                              }
                              className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>

                            {/* Dropdown Menu */}
                            {activeMenuMemberId === member.id && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 mt-1.5 w-36 bg-popover border border-border/80 rounded-xl shadow-lg p-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150"
                              >
                                <div className="text-[9px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider border-b border-border/40">
                                  Change Role
                                </div>
                                <button
                                  onClick={() =>
                                    handleChangeRole(member.id, "viewer")
                                  }
                                  className={`w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-muted/80 flex items-center gap-1.5 ${member.role === "viewer" ? "text-primary font-bold" : "text-foreground"}`}
                                >
                                  Viewer
                                </button>
                                <button
                                  onClick={() =>
                                    handleChangeRole(member.id, "editor")
                                  }
                                  className={`w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-muted/80 flex items-center gap-1.5 ${member.role === "editor" ? "text-primary font-bold" : "text-foreground"}`}
                                >
                                  Editor
                                </button>
                                {currentUserRole === "owner" && (
                                  <button
                                    onClick={() =>
                                      handleChangeRole(member.id, "admin")
                                    }
                                    className={`w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-muted/80 flex items-center gap-1.5 ${member.role === "admin" ? "text-primary font-bold" : "text-foreground"}`}
                                  >
                                    Admin
                                  </button>
                                )}
                                <div className="border-t border-border/40 my-1" />
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 flex items-center gap-1.5 font-semibold"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Kick Out
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {canManage && (
                <div className="pt-2">
                  <Button
                    onClick={() => setInviteOpen(true)}
                    variant="outline"
                    className="w-full h-8 rounded-xl text-xs font-semibold cursor-pointer border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60 transition-all duration-200"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Invite Member
                  </Button>
                </div>
              )}
            </div>

            {/* Pending Invites Card (Visible only to owners/admins) */}
            {canManage && invites.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card/40 p-5 backdrop-blur-xs space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-primary/80" />
                    Pending Invites
                  </h3>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                    {invites.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-none">
                          {invite.email}
                        </span>
                        <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider font-semibold">
                          {invite.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyInviteLink(invite)}
                          className="h-6.5 w-6.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Copy invitation link"
                        >
                          {copiedInviteId === invite.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevokeInvite(invite.id)}
                          className="h-6.5 w-6.5 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Revoke invitation"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Board Modal Dialog */}
        <CreateBoardDialog
          workspaceId={workspace.id}
          open={boardOpen}
          onOpenChange={setBoardOpen}
        />

        {/* Invite Member Dialog */}
        <InviteMemberDialog
          workspaceId={workspace.id}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      </main>
    </>
  );
}
