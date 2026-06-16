import { getSupabaseClient } from "./database";

export interface AuthResult {
  userId: string;
  email: string;
  isReadonly: boolean;
  canvasData: unknown;
}

/**
 * Validates the user session and checks whether the user is authorized to access the board.
 */
export async function authenticateAndAuthorize(
  token: string,
  boardId: string,
): Promise<AuthResult> {
  const supabase = getSupabaseClient(token);

  // 1. Authenticate the user session with Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    throw new Error(authError?.message || "Invalid JWT");
  }

  // 2. Fetch board details and verify board exists
  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("id, workspace_id, canvas_data")
    .eq("id", boardId)
    .single();

  if (boardError || !board) {
    throw new Error(`Board ${boardId} not found or access denied`);
  }

  // 3. Verify workspace exists
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", board.workspace_id)
    .single();

  if (workspaceError || !workspace) {
    throw new Error(`Workspace ${board.workspace_id} for board ${boardId} not found`);
  }

  // 4. Verify user belongs to workspace
  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", board.workspace_id)
    .eq("user_id", user.id)
    .single();

  if (memberError || !member) {
    throw new Error(`User ${user.id} does not have access to workspace ${board.workspace_id}`);
  }

  const isReadonly = member.role === "viewer";

  return {
    userId: user.id,
    email: user.email || "",
    isReadonly,
    canvasData: board.canvas_data,
  };
}
