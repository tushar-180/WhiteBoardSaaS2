import { redirect, notFound } from "next/navigation";
import { requireAuth } from "@/utils/supabase/server";
import { fetchBoardById } from "@/services/board";
import { hasWorkspaceAccess } from "@/services/workspace";
import { ROUTES } from "@/lib/constants";
import WhiteboardEditor from "@/components/whiteboard/whiteboard-editor";
import { fetchWorkspaceMemberRole } from "@/services/member";

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    boardId: string;
  }>;
}

export default async function BoardDetailPage({ params }: PageProps) {
  const { boardId } = await params;
  const { supabase, user } = await requireAuth();

  // 1. Fetch board details
  const board = await fetchBoardById(boardId);
  if (!board) {
    notFound();
  }

  // 2. Validate workspace access
  const hasAccess = await hasWorkspaceAccess(board.workspace_id, user.id);
  if (!hasAccess) {
    redirect(ROUTES.WORKSPACES);
  }
  

  const workspaceRole = await fetchWorkspaceMemberRole(board.workspace_id, user.id);
  const isReadonly = workspaceRole === "viewer";
  const licenseKey = process.env.TLDRAW_API;

  // 3. Fetch user display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.name ||
    user.user_metadata?.full_name ||
    user.email ||
    "Anonymous";

  const currentUser = {
    id: user.id,
    name: displayName,
  };

  return (
    <WhiteboardEditor
      board={board}
      currentUser={currentUser}
      licenseKey={licenseKey}
      isReadonly={isReadonly}
    />
  );
}

