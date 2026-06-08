import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { fetchBoardById } from "@/services/board";
import { hasWorkspaceAccess } from "@/services/workspace";
import WhiteboardEditor from "@/components/whiteboard/whiteboard-editor";

export const revalidate = 0;

interface PageProps {
  params: Promise<{
    boardId: string;
  }>;
}

export default async function BoardDetailPage({ params }: PageProps) {
  const { boardId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch board details
  const board = await fetchBoardById(boardId);
  if (!board) {
    notFound();
  }

  // 2. Validate workspace access
  const hasAccess = await hasWorkspaceAccess(board.workspace_id, user.id);
  if (!hasAccess) {
    redirect("/workspaces");
  }

  const licenseKey = process.env.TLDRAW_API;

  return <WhiteboardEditor board={board} licenseKey={licenseKey} />;
}

