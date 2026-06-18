import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/utils/supabase/server";
import { UnauthorizedAccess } from "@/components/shared/unauthorized-access";
import { fetchWorkspaceById, fetchAllUserWorkspaces, hasWorkspaceAccess } from "@/services/workspace";
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { workspaceId } = await params;
  const workspace = await fetchWorkspaceById(workspaceId);
  return {
    title: workspace ? workspace.name : "Workspace",
    description: workspace
      ? `Manage boards, members, and settings for the ${workspace.name} workspace.`
      : "Workspace details and management.",
  };
}

export default async function WorkspaceDetailPage({ params }: PageProps) {
  const { workspaceId } = await params;
  const { user } = await requireAuth(`/login?next=${encodeURIComponent(`/workspaces/${workspaceId}`)}`);

  // 1. Fetch workspace details and check accessibility
  const workspace = await fetchWorkspaceById(workspaceId);

  if (!workspace) {
    notFound();
  }

  const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
  if (!hasAccess) {
    return <UnauthorizedAccess />;
  }

  // 2. Fetch current user role and member lists
  const currentUserRole =
    (await fetchWorkspaceMemberRole(workspaceId, user.id)) ||
    (workspace.owner_id === user.id ? "owner" : "viewer");

  // 3. Fetch boards, members, invites, and all user workspaces in parallel
  const [boards, members, invites, workspaces] = await Promise.all([
    fetchBoardsByWorkspace(workspaceId),
    fetchWorkspaceMembers(workspaceId),
    currentUserRole === "owner" || currentUserRole === "admin"
      ? fetchPendingInvitesByWorkspace(workspaceId)
      : Promise.resolve([]),
    fetchAllUserWorkspaces(user.id),
  ]);

  return (
    <div className="px-4 md:px-8 flex-1 flex flex-col overflow-hidden min-h-0">
      <WorkspaceDetailsClient
        workspace={workspace}
        initialBoards={boards}
        initialMembers={members}
        initialInvites={invites}
        currentUserRole={currentUserRole}
        userEmail={user.email || ""}
        initialWorkspaces={workspaces}
      />
    </div>
  );
}

