"use server";

import { revalidatePath } from "next/cache";
import { requireActionAuth, createClient } from "@/utils/supabase/server";
import {
  fetchBoardsByWorkspace,
  insertBoard,
  updateBoard,
  deleteBoard,
  updateBoardCanvas,
} from "@/services/board";
import { hasWorkspaceAccess } from "@/services/workspace";
import { type Board, boardSchema } from "@/types/workspace";
import { ROUTES } from "@/lib/constants";

/**
 * Retrieves all boards belonging to a workspace.
 */
export async function getBoardsAction(workspaceId: string): Promise<Board[]> {
  try {
    const { user } = await requireActionAuth("You must be logged in to load boards.");

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
    const { user } = await requireActionAuth("You must be logged in to create a board.");

    const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      throw new Error("You do not have access to modify this workspace.");
    }

    const validated = boardSchema.safeParse({ name, description });
    if (!validated.success) {
      throw new Error(validated.error.issues[0].message);
    }
    const { name: trimmedName, description: validatedDescription } = validated.data;

    // Check if a board with this name already exists in the workspace (case-insensitive)
    const supabase = await createClient();
    const { data: existingBoard, error: checkError } = await supabase
      .from("boards")
      .select("id")
      .eq("workspace_id", workspaceId)
      .ilike("name", trimmedName.trim())
      .maybeSingle();

    if (checkError) {
      console.error("Database error checking existing board:", checkError);
    }

    if (existingBoard) {
      throw new Error(`A board named "${trimmedName}" already exists in this workspace.`);
    }

    const board = await insertBoard(
      workspaceId,
      trimmedName,
      validatedDescription || null,
      user.id,
    );

    // Revalidate the workspace details route
    revalidatePath(`${ROUTES.WORKSPACES}/${workspaceId}`);

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
    const { user } = await requireActionAuth("You must be logged in to update a board.");

    const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      throw new Error("You do not have access to modify this workspace.");
    }

    const validated = boardSchema.safeParse({ name, description });
    if (!validated.success) {
      throw new Error(validated.error.issues[0].message);
    }
    const { name: trimmedName, description: validatedDescription } = validated.data;

    // Check if a board with this name already exists in the workspace (excluding current boardId) (case-insensitive)
    const supabase = await createClient();
    const { data: existingBoard, error: checkError } = await supabase
      .from("boards")
      .select("id")
      .eq("workspace_id", workspaceId)
      .neq("id", boardId)
      .ilike("name", trimmedName.trim())
      .maybeSingle();

    if (checkError) {
      console.error("Database error checking existing board:", checkError);
    }

    if (existingBoard) {
      throw new Error(`A board named "${trimmedName}" already exists in this workspace.`);
    }

    const board = await updateBoard(boardId, trimmedName, validatedDescription || null);

    // Revalidate the workspace details route
    revalidatePath(`${ROUTES.WORKSPACES}/${workspaceId}`);

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
    const { user } = await requireActionAuth("You must be logged in to delete a board.");

    const hasAccess = await hasWorkspaceAccess(workspaceId, user.id);
    if (!hasAccess) {
      throw new Error("You do not have access to modify this workspace.");
    }

    await deleteBoard(boardId);

    // Revalidate the workspace details route
    revalidatePath(`${ROUTES.WORKSPACES}/${workspaceId}`);
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
    const { user } = await requireActionAuth("You must be logged in to update canvas data.");

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

