import { redirect, notFound } from "next/navigation";
import { requireAuth } from "@/utils/supabase/server";
import { fetchBoardById } from "@/services/board";
import { hasWorkspaceAccess } from "@/services/workspace";
import { ROUTES } from "@/lib/constants";
import WhiteboardEditor from "@/components/whiteboard/whiteboard-editor";

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    boardId: string;
  }>;
}

export default async function BoardDetailPage({ params }: PageProps) {
  const { boardId } = await params;
  const { user } = await requireAuth();

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

  const licenseKey = process.env.TLDRAW_API;

  return <WhiteboardEditor board={board} licenseKey={licenseKey} />;
}

