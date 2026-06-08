import { createClient } from "@/utils/supabase/server";
import { type Board } from "@/types/workspace";

/**
 * Fetches all boards belonging to a workspace.
 */
export async function fetchBoardsByWorkspace(
  workspaceId: string,
): Promise<Board[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Database error in fetchBoardsByWorkspace:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetches a single board by its ID.
 */
export async function fetchBoardById(boardId: string): Promise<Board | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .single();

  if (error) {
    console.error("Database error in fetchBoardById:", error);
    return null;
  }

  return data;
}

/**
 * Inserts a new board into the database.
 */
export async function insertBoard(
  workspaceId: string,
  name: string,
  description: string | null,
  userId: string,
): Promise<Board> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .insert({
      workspace_id: workspaceId,
      name,
      description: description || null,
      created_by: userId,
      canvas_data: {}, // start with an empty canvas object
    })
    .select()
    .single();

  if (error) {
    console.error("Database error in insertBoard:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Updates a board's basic details (name, description).
 */
export async function updateBoard(
  boardId: string,
  name: string,
  description: string | null,
): Promise<Board> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .update({
      name,
      description: description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", boardId)
    .select()
    .single();

  if (error) {
    console.error("Database error in updateBoard:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Deletes a board by its ID.
 */
export async function deleteBoard(boardId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("boards").delete().eq("id", boardId);

  if (error) {
    console.error("Database error in deleteBoard:", error);
    throw new Error(error.message);
  }
}

/**
 * Updates the canvas_data JSONB field of a board.
 */
export async function updateBoardCanvas(
  boardId: string,
  canvasData: unknown,
): Promise<Board> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .update({
      canvas_data: canvasData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", boardId)
    .select()
    .single();

  if (error) {
    console.error("Database error in updateBoardCanvas:", error);
    throw new Error(error.message);
  }

  return data;
}

