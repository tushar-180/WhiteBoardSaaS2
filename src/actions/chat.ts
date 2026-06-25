"use server";

import { requireActionAuth } from "@/utils/supabase/server";
import { fetchBoardMessages, insertBoardMessage } from "@/services/chat";
import { hasWorkspaceAccess } from "@/services/workspace";
import { type BoardMessage } from "@/types/chat";

export async function getBoardMessagesAction(
  boardId: string,
  workspaceId: string,
): Promise<BoardMessage[]> {
  try {
    const { user } = await requireActionAuth("You must be logged in to load chat.");

    const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      throw new Error("You do not have access to this workspace chat.");
    }

    return await fetchBoardMessages(boardId, workspaceId);
  } catch (error: unknown) {
    throw new Error((error as Error).message || "Failed to load chat messages.");
  }
}

export async function sendBoardMessageAction(
  workspaceId: string,
  boardId: string,
  content: string,
  replyToMessageId?: string | null,
): Promise<BoardMessage> {
  try {
    const { user } = await requireActionAuth("You must be logged in to send a message.");

    const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      throw new Error("You do not have access to send messages in this workspace.");
    }

    if (!content.trim()) {
      throw new Error("Message content cannot be empty.");
    }

    return await insertBoardMessage(boardId, user.id, content, replyToMessageId);
  } catch (error: unknown) {
    throw new Error((error as Error).message || "Failed to send message.");
  }
}
