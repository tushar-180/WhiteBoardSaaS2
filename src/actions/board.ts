"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  fetchBoardsByWorkspace,
  insertBoard,
  updateBoard,
  deleteBoard,
  updateBoardCanvas,
} from "@/services/board";
import { hasWorkspaceAccess } from "@/services/workspace";
import { type Board } from "@/types/workspace";

/**
 * Retrieves all boards belonging to a workspace.
 */
export async function getBoardsAction(workspaceId: string): Promise<Board[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in to load boards.");
    }

    const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      throw new Error("You do not have access to this workspace.");
    }

    return await fetchBoardsByWorkspace(workspaceId);
  } catch (error: unknown) {
    console.error("Action error in getBoardsAction:", error);
    throw new Error((error as Error).message || "Failed to load boards.");
  }
}

/**
 * Creates a new board in a workspace.
 */
export async function createBoardAction(
  workspaceId: string,
  name: string,
  description: string | null,
): Promise<Board> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in to create a board.");
    }

    const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      throw new Error("You do not have access to modify this workspace.");
    }

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      throw new Error("Board name must be at least 2 characters long.");
    }

    const board = await insertBoard(
      workspaceId,
      trimmedName,
      description,
      user.id,
    );

    // Revalidate the workspace details route
    revalidatePath(`/workspaces/${workspaceId}`);

    return board;
  } catch (error: unknown) {
    console.error("Action error in createBoardAction:", error);
    throw new Error((error as Error).message || "Failed to create board.");
  }
}

/**
 * Updates basic details of a board.
 */
export async function updateBoardAction(
  workspaceId: string,
  boardId: string,
  name: string,
  description: string | null,
): Promise<Board> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in to update a board.");
    }

    const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      throw new Error("You do not have access to modify this workspace.");
    }

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      throw new Error("Board name must be at least 2 characters long.");
    }

    const board = await updateBoard(boardId, trimmedName, description);

    // Revalidate the workspace details route
    revalidatePath(`/workspaces/${workspaceId}`);

    return board;
  } catch (error: unknown) {
    console.error("Action error in updateBoardAction:", error);
    throw new Error((error as Error).message || "Failed to update board.");
  }
}

/**
 * Deletes a board from a workspace.
 */
export async function deleteBoardAction(
  workspaceId: string,
  boardId: string,
): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in to delete a board.");
    }

    const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      throw new Error("You do not have access to modify this workspace.");
    }

    await deleteBoard(boardId);

    // Revalidate the workspace details route
    revalidatePath(`/workspaces/${workspaceId}`);
  } catch (error: unknown) {
    console.error("Action error in deleteBoardAction:", error);
    throw new Error((error as Error).message || "Failed to delete board.");
  }
}

/**
 * Updates a board's canvas data.
 */
export async function updateBoardCanvasAction(
  workspaceId: string,
  boardId: string,
  canvasData: unknown,
): Promise<Board> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in to update canvas data.");
    }

    const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      throw new Error("You do not have access to modify this workspace.");
    }

    const board = await updateBoardCanvas(boardId, canvasData);
    return board;
  } catch (error: unknown) {
    console.error("Action error in updateBoardCanvasAction:", error);
    throw new Error(
      (error as Error).message || "Failed to update board canvas.",
    );
  }
}

