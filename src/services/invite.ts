import { createClient } from "@/utils/supabase/server";
import { type WorkspaceInvite, type WorkspaceRole } from "@/types/workspace";

export interface WorkspaceInviteWithWorkspace extends WorkspaceInvite {
  workspace_name: string;
}

/**
 * Fetches an invite by its unique token if it is pending.
 */
export async function fetchInviteByToken(
  token: string,
): Promise<WorkspaceInviteWithWorkspace | null> {
  const supabase = await createClient();
  
  // First, fetch the invite without the relationship
  const { data: invite, error: inviteError } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (inviteError) {
    // No rows returned – treat as not found rather than a DB failure
    if ((inviteError as any).code === "PGRST116") {
      console.warn("Invite not found (no pending record) for token:", token);
      return null;
    }
    console.error("Database error in fetchInviteByToken:", inviteError);
    return null;
  }
  if (!invite) {
    console.warn("Invite not found for token:", token);
    return null;
  }

  // Then, fetch the workspace name separately
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", invite.workspace_id)
    .single();

  if (workspaceError) {
    console.warn(
      "Could not fetch workspace details for invite:",
      workspaceError,
    );
  }

  const workspaceName = workspace?.name || "Unknown Workspace";

  return {
    id: invite.id,
    workspace_id: invite.workspace_id,
    email: invite.email,
    token: invite.token,
    status: invite.status,
    created_by: invite.created_by,
    accepted_by: invite.accepted_by,
    role: invite.role as WorkspaceRole,
    workspace_name: workspaceName,
  };
}

/**
 * Fetches an invite by its unique token regardless of status.
 * Useful for checking if an invite exists and determining its current status.
 */
export async function fetchInviteByTokenAnyStatus(
  token: string,
): Promise<WorkspaceInviteWithWorkspace | null> {
  const supabase = await createClient();
  
  // Fetch the invite without status filter
  const { data: invite, error: inviteError } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("token", token)
    .single();

  if (inviteError || !invite) {
    return null;
  }

  // Then, fetch the workspace name separately
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", invite.workspace_id)
    .single();

  if (workspaceError) {
    console.warn(
      "Could not fetch workspace details for invite:",
      workspaceError,
    );
  }

  const workspaceName = workspace?.name || "Unknown Workspace";

  return {
    id: invite.id,
    workspace_id: invite.workspace_id,
    email: invite.email,
    token: invite.token,
    status: invite.status,
    created_by: invite.created_by,
    accepted_by: invite.accepted_by,
    role: invite.role as WorkspaceRole,
    workspace_name: workspaceName,
  };
}

/**
 * Fetches all pending invites for a specific workspace.
 */
export async function fetchPendingInvitesByWorkspace(
  workspaceId: string,
): Promise<WorkspaceInvite[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending");

  if (error) {
    console.error("Database error in fetchPendingInvitesByWorkspace:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Inserts a new workspace invitation record into the database.
 */
export async function createWorkspaceInvite(
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
  inviterId: string,
): Promise<WorkspaceInvite> {
  const supabase = await createClient();
  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from("workspace_invites")
    .insert({
      workspace_id: workspaceId,
      email: email.trim().toLowerCase(),
      token,
      status: "pending",
      created_by: inviterId,
      role,
    })
    .select()
    .single();

  if (error) {
    console.error("Database error in createWorkspaceInvite:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Accepts a workspace invitation. Inserts the member and updates the invite status.
 * Returns the workspace ID.
 * Only accepts invites with "pending" status - revoked, accepted, or expired invites are rejected.
 */
export async function acceptWorkspaceInvite(
  token: string,
  userId: string,
): Promise<string> {
  const supabase = await createClient();

  // 1. Fetch the invite to verify it exists and is pending
  const { data: invite, error: inviteError } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (inviteError || !invite) {
    // Provide more specific error message
    // Check if invite exists but with different status
    const { data: existingInvite } = await supabase
      .from("workspace_invites")
      .select("status")
      .eq("token", token)
      .single();

    if (existingInvite?.status === "revoked") {
      throw new Error("This invitation has been revoked and cannot be accepted.");
    }
    if (existingInvite?.status === "accepted") {
      throw new Error("This invitation has already been accepted.");
    }
    if (existingInvite?.status === "expired") {
      throw new Error("This invitation has expired.");
    }

    throw new Error("Invitation is invalid or no longer available.");
  }

  // 2. Add the user to workspace_members
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: invite.workspace_id,
      user_id: userId,
      role: invite.role,
    });

  if (memberError) {
    // If the user is already a member, we might get a unique constraint error.
    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", invite.workspace_id)
      .eq("user_id", userId)
      .single();

    if (!existingMember) {
      console.error(
        "Database error in adding member from invite:",
        memberError,
      );
      throw new Error("Failed to join workspace: " + memberError.message);
    }
    // If they are already a member, we can just proceed to mark the invite accepted.
  }

  // 3. Mark invitation as accepted
  const { error: updateError } = await supabase
    .from("workspace_invites")
    .update({
      status: "accepted",
      accepted_by: userId,
    })
    .eq("id", invite.id);

  if (updateError) {
    console.error("Database error updating invite status:", updateError);
    // Note: In postgres, if the member was added but update fails, it could leave database inconsistent,
    // but in a server action we do standard sequential operations.
  }

  return invite.workspace_id;
}

/**
 * Revokes a pending workspace invitation.
 */
export async function revokeWorkspaceInvite(
  workspaceId: string,
  inviteId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspace_invites")
    .update({ status: "revoked" })
    .eq("id", inviteId)
    .eq("workspace_id", workspaceId);

  if (error) {
    console.error("Database error in revokeWorkspaceInvite:", error);
    throw new Error(error.message);
  }
}

/**
 * Rejects a pending workspace invitation by the invited user.
 */
export async function rejectWorkspaceInvite(
  token: string,
  userId: string,
): Promise<string> {
  const supabase = await createClient();

  // 1. Fetch the invite to verify it exists and is pending
  const { data: invite, error: inviteError } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (inviteError || !invite) {
    throw new Error("Invitation is invalid or no longer available.");
  }

  // 2. Mark invitation as rejected
  const { error: updateError } = await supabase
    .from("workspace_invites")
    .update({
      status: "rejected",
      accepted_by: userId,
    })
    .eq("id", invite.id);

  if (updateError) {
    console.error("Database error updating invite status to rejected:", updateError);
    throw new Error("Failed to reject invitation.");
  }

  return invite.workspace_id;
}
