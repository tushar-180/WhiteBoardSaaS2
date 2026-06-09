import { createClient } from "@/utils/supabase/server";
import { type WorkspaceRole, type WorkspaceMember } from "@/types/workspace";

export interface WorkspaceMemberWithProfile {
  id: string;
  workspace_id: string;
  user_id: string;
  joined_at: string;
  role: WorkspaceRole;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

/**
 * Fetches all members of a workspace along with their public profile information.
 */
export async function fetchWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberWithProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select(`
      id,
      workspace_id,
      user_id,
      joined_at,
      role,
      profiles:user_id (
        email,
        name,
        avatar_url
      )
    `)
    .eq("workspace_id", workspaceId);

  if (error) {
    console.error("Database error in fetchWorkspaceMembers:", error);
    throw new Error(error.message);
  }

  interface MemberQueryRow {
    id: string;
    workspace_id: string;
    user_id: string;
    joined_at: string;
    role: string;
    profiles: {
      email: string;
      name: string | null;
      avatar_url: string | null;
    } | null;
  }

  const rows = (data || []) as unknown as MemberQueryRow[];

  return rows.map((row) => {
    const profile = row.profiles || { email: "", name: null, avatar_url: null };
    return {
      id: row.id,
      workspace_id: row.workspace_id,
      user_id: row.user_id,
      joined_at: row.joined_at,
      role: row.role as WorkspaceRole,
      email: profile.email || "",
      name: profile.name,
      avatar_url: profile.avatar_url,
    };
  });
}

/**
 * Fetches a user's role in a specific workspace.
 * Returns null if the user is not a member.
 */
export async function fetchWorkspaceMemberRole(
  workspaceId: string,
  userId: string
): Promise<WorkspaceRole | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // If it's a "no rows found" error, return null safely
    return null;
  }

  return data.role as WorkspaceRole;
}

/**
 * Checks if an email is already a member of a workspace.
 * Returns the member's role if they are a member, null otherwise.
 */
export async function checkIfEmailIsMember(
  workspaceId: string,
  email: string
): Promise<WorkspaceRole | null> {
  const supabase = await createClient();
  
  // Get the user_id from the email
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (profileError || !profile) {
    // Email not found in profiles, so definitely not a member
    return null;
  }

  // Now check if this user_id is a member of the workspace
  const role = await fetchWorkspaceMemberRole(workspaceId, profile.id);
  return role;
}

/**
 * Registers a user as a member of a workspace.
 */
export async function addWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole
): Promise<WorkspaceMember> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspaceId,
      user_id: userId,
      role,
    })
    .select()
    .single();

  if (error) {
    console.error("Database error in addWorkspaceMember:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Removes a member from a workspace.
 */
export async function removeWorkspaceMember(workspaceId: string, memberId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("id", memberId)
    .eq("workspace_id", workspaceId);

  if (error) {
    console.error("Database error in removeWorkspaceMember:", error);
    throw new Error(error.message);
  }
}

/**
 * Updates the workspace role of a member.
 */
export async function updateWorkspaceMemberRole(
  workspaceId: string,
  memberId: string,
  role: WorkspaceRole
): Promise<WorkspaceMember> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("id", memberId)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) {
    console.error("Database error in updateWorkspaceMemberRole:", error);
    throw new Error(error.message);
  }

  return data;
}
