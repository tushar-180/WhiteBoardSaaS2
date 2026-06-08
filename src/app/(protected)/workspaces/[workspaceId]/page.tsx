import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { fetchWorkspaceById, hasWorkspaceAccess } from "@/services/workspace";
import { fetchProfileById } from "@/services/profile";
import { fetchBoardsByWorkspace } from "@/services/board";
import { WorkspaceDetailsClient } from "@/components/workspace/workspace-details-client";

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspaceDetailPage({ params }: PageProps) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch workspace details and check accessibility
  const workspace = await fetchWorkspaceById(workspaceId);

  if (!workspace) {
    notFound();
  }

  const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
  if (!hasAccess) {
    redirect("/workspaces");
  }

  // 2. Fetch boards and profile details in parallel
  const [boards, profile] = await Promise.all([
    fetchBoardsByWorkspace(workspaceId),
    fetchProfileById(user.id),
  ]);

  const displayName =
    profile?.name ||
    profile?.email?.split("@")[0] ||
    user.email?.split("@")[0] ||
    "User";
  const displayEmail = profile?.email || user.email || "";

  return (
    <WorkspaceDetailsClient
      workspace={workspace}
      initialBoards={boards}
      userName={displayName}
      userEmail={displayEmail}
    />
  );
}

