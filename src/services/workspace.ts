import { createClient } from "@/utils/supabase/server";
import { type Workspace } from "@/types/workspace";

/**
 * Fetches all workspaces owned by a specific user.
 */
export async function fetchWorkspacesByOwner(userId: string): Promise<Workspace[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Database error in fetchWorkspacesByOwner:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Inserts a new workspace record into the database.
 */
export async function insertWorkspace(
  name: string,
  slug: string,
  ownerId: string
): Promise<Workspace> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name,
      slug,
      owner_id: ownerId,
    })
    .select()
    .single();

  if (error) {
    console.error("Database error in insertWorkspace:", error);
    throw new Error(error.message);
  }

  // Also register the creator as the 'owner' in the workspace_members table
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: data.id,
      user_id: ownerId,
      role: "owner",
    });

  if (memberError) {
    console.error("Database error in inserting workspace member:", memberError);
    // Roll back the workspace creation to prevent invalid/ownerless workspaces
    await supabase.from("workspaces").delete().eq("id", data.id);
    throw new Error(memberError.message);
  }

  return data;
}

/**
 * Deletes a workspace record from the database.
 * The workspace can only be deleted by its owner.
 */
export async function deleteWorkspace(workspaceId: string, ownerId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId)
    .eq("owner_id", ownerId);

  if (error) {
    console.error("Database error in deleteWorkspace:", error);
    throw new Error(error.message);
  }
}

/**
 * Fetches a single workspace by its ID.
 */
export async function fetchWorkspaceById(workspaceId: string): Promise<Workspace | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (error) {
    console.error("Database error in fetchWorkspaceById:", error);
    return null;
  }

  return data;
}

/**
 * Checks if a user has access to a workspace (either as owner or member).
 */
export async function hasWorkspaceAccess(workspaceId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  // 1. Check if the user is the owner of the workspace
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();

  if (wsError || !workspace) {
    return false;
  }

  if (workspace.owner_id === userId) {
    return true;
  }

  // 2. Check if the user is a registered member of the workspace
  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();

  if (memberError || !member) {
    return false;
  }

  return true;
}

