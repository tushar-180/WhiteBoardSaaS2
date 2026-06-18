import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/utils/supabase/server";
import { UnauthorizedAccess } from "@/components/shared/unauthorized-access";
import { fetchBoardById } from "@/services/board";
import { hasWorkspaceAccess } from "@/services/workspace";
import ReactDOM from "react-dom";
import WhiteboardEditor from "@/components/whiteboard/whiteboard-editor";
import { fetchWorkspaceMemberRole } from "@/services/member";

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    boardId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { boardId } = await params;
  const board = await fetchBoardById(boardId);
  return {
    title: board ? board.name : "Board",
    description: board
      ? `Collaborate on the ${board.name} whiteboard in real-time.`
      : "Collaborative whiteboard canvas.",
  };
}

export default async function BoardDetailPage({ params }: PageProps) {
  const { boardId } = await params;
  const { supabase, user } = await requireAuth(
    `/login?next=${encodeURIComponent(`/board/${boardId}`)}`,
  );

  // 1. Fetch board details
  const board = await fetchBoardById(boardId);
  if (!board) {
    notFound();
  }

  // 2. Validate workspace access
  const hasAccess = await hasWorkspaceAccess(board.workspace_id, user.id);
  if (!hasAccess) {
    return <UnauthorizedAccess />;
  }

  const workspaceRole = await fetchWorkspaceMemberRole(
    board.workspace_id,
    user.id,
  );
  const isReadonly = workspaceRole === "viewer";
  const licenseKey = process.env.TLDRAW_API;

  // 3. Fetch user display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.name || user.user_metadata?.full_name || user.email || "Anonymous";

  const currentUser = {
    id: user.id,
    name: displayName,
  };

  // Preconnect to Tldraw's CDN to speed up the massive font payload downloads
  ReactDOM.preconnect("https://cdn.tldraw.com", { crossOrigin: "anonymous" });

  return (
    <WhiteboardEditor
      board={board}
      currentUser={currentUser}
      licenseKey={licenseKey}
      isReadonly={isReadonly}
    />
  );
}
