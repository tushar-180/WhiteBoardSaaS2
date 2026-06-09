import { redirect, notFound } from "next/navigation";
import { requireAuth } from "@/utils/supabase/server";
import { fetchWorkspaceById, hasWorkspaceAccess } from "@/services/workspace";
import { ROUTES } from "@/lib/constants";
import { fetchProfileById } from "@/services/profile";
import { fetchBoardsByWorkspace } from "@/services/board";
import { fetchWorkspaceMembers, fetchWorkspaceMemberRole } from "@/services/member";
import { fetchPendingInvitesByWorkspace } from "@/services/invite";
import { WorkspaceDetailsClient } from "@/components/workspace/workspace-details-client";

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspaceDetailPage({ params }: PageProps) {
  const { workspaceId } = await params;
  const { user } = await requireAuth();

  // 1. Fetch workspace details and check accessibility
  const workspace = await fetchWorkspaceById(workspaceId);

  if (!workspace) {
    notFound();
  }

  const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
  if (!hasAccess) {
    redirect(ROUTES.WORKSPACES);
  }

  // 2. Fetch current user role and member lists
  const currentUserRole =
    (await fetchWorkspaceMemberRole(workspaceId, user.id)) ||
    (workspace.owner_id === user.id ? "owner" : "viewer");

  // 3. Fetch boards, members, profile and invites in parallel
  const [boards, profile, members, invites] = await Promise.all([
    fetchBoardsByWorkspace(workspaceId),
    fetchProfileById(user.id),
    fetchWorkspaceMembers(workspaceId),
    currentUserRole === "owner" || currentUserRole === "admin"
      ? fetchPendingInvitesByWorkspace(workspaceId)
      : Promise.resolve([]),
  ]);

  const displayEmail = profile?.email || user.email || "";

  return (
<div className="px-4 md:px-8">
    <WorkspaceDetailsClient
      workspace={workspace}
      initialBoards={boards}
      initialMembers={members}
      initialInvites={invites}
      currentUserRole={currentUserRole}
      userEmail={displayEmail}
    />
  </div>
  );
}

