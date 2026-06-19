import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/utils/supabase/server";
import { UnauthorizedAccess } from "@/components/shared/unauthorized-access";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { fetchBoardById } from "@/services/board";
import { hasWorkspaceAccess } from "@/services/workspace";
import { preconnect } from "react-dom";
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

  // 2. Run access checks + profile fetch in parallel
  const [hasAccess, workspaceRole, { data: profile }] = await Promise.all([
    hasWorkspaceAccess(board.workspace_id, user.id),
    fetchWorkspaceMemberRole(board.workspace_id, user.id),
    supabase.from("profiles").select("name, email, avatar_url").eq("id", user.id).single(),
  ]);

  if (!hasAccess) {
    return <UnauthorizedAccess />;
  }

  const isReadonly = workspaceRole === "viewer";
  const licenseKey = process.env.TLDRAW_API;

  const displayName =
    profile?.name || user.user_metadata?.full_name || user.email || "Anonymous";

  const currentUser = {
    id: user.id,
    name: displayName,
    email: profile?.email || user.email || "",
    avatar_url: profile?.avatar_url || null,
    role: workspaceRole || "viewer",
  };

  // Preconnect to Tldraw's CDN to speed up the massive font payload downloads
  preconnect("https://cdn.tldraw.com", { crossOrigin: "anonymous" });
  // Preconnect to the WebSocket sync server for faster connection setup
  const syncServerUrl = process.env.NEXT_PUBLIC_SYNC_SERVER_URL;
  if (syncServerUrl) {
    preconnect(syncServerUrl);
  }

  return (
    <ErrorBoundary>
      <WhiteboardEditor
        board={board}
        currentUser={currentUser}
        licenseKey={licenseKey}
        isReadonly={isReadonly}
      />
    </ErrorBoundary>
  );
}
