import { createClient } from "@/utils/supabase/server";
import { type WorkspaceInvite, type WorkspaceRole, type WorkspaceInviteWithWorkspace } from "@/types/workspace";

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
    if (inviteError.code === "PGRST116") {
      console.warn("Invite not found or no longer pending.");
      return null;
    }
    console.error("Database error in fetchInviteByToken:", inviteError);
    return null;
  }
  if (!invite) {
    console.warn("Invite data missing after query.");
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
    created_at: invite.created_at,
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
    created_at: invite.created_at,
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
 * Checks if a pending invite already exists for a specific email in a workspace.
 */
export async function checkIfInviteIsPending(
  workspaceId: string,
  email: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_invites")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("email", email.trim().toLowerCase())
    .eq("status", "pending")
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Database error in checkIfInviteIsPending:", error);
    return false;
  }

  return !!data;
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
    // If the member was added but the invite status update fails, attempt to rollback
    // by removing the member we just added to maintain consistency
    try {
      await supabase
        .from("workspace_members")
        .delete()
        .eq("workspace_id", invite.workspace_id)
        .eq("user_id", userId);
    } catch {
      // Rollback failure is logged but does not throw, as the primary error
      // is the invite status update failure which we bubble up
      console.error("Failed to rollback member addition after invite update error");
    }
    throw new Error("Failed to accept invitation. Please try again.");
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



/**
 * Fetches all notifications for a user, including:
 * 1. Pending invites sent to their email (incoming)
 * 2. Accepted/rejected status updates for invites created by them which they haven't dismissed yet (outgoing status)
 */
export async function fetchUserNotifications(
  email: string,
  userId: string,
): Promise<WorkspaceInviteWithWorkspace[]> {
  const supabase = await createClient();

  // 1. Fetch incoming pending invites
  const { data: incoming, error: incomingError } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .eq("status", "pending");

  if (incomingError) {
    console.error("Database error fetching incoming invites:", incomingError);
  }

  // 2. Fetch outgoing accepted/rejected status updates not dismissed yet
  const { data: outgoing, error: outgoingError } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("created_by", userId)
    .in("status", ["accepted", "rejected"])
    .eq("inviter_seen", false);

  if (outgoingError) {
    console.error("Database error fetching outgoing invite statuses:", outgoingError);
  }

  const allInvites = [...(incoming || []), ...(outgoing || [])];
  if (allInvites.length === 0) return [];

  // Batch-fetch workspaces
  const workspaceIds = Array.from(new Set(allInvites.map((i) => i.workspace_id)));
  const { data: workspaces, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, name")
    .in("id", workspaceIds);

  if (workspaceError) {
    console.error("Database error fetching workspaces for notifications:", workspaceError);
  }

  const workspaceMap = new Map<string, string>();
  workspaces?.forEach((w) => {
    workspaceMap.set(w.id, w.name);
  });

  // Batch-fetch profiles
  const creatorIds = incoming?.map((i) => i.created_by) || [];
  const inviteeIds = outgoing?.map((o) => o.accepted_by).filter((id): id is string => id !== null) || [];
  const profileIds = Array.from(new Set([...creatorIds, ...inviteeIds]));

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in("id", profileIds);

  if (profileError) {
    console.error("Database error fetching profiles for notifications:", profileError);
  }

  const profileMap = new Map<string, string>();
  profiles?.forEach((p) => {
    profileMap.set(p.id, p.name || p.email || "Someone");
  });

  return allInvites.map((invite) => {
    const isIncoming = invite.email.toLowerCase().trim() === email.toLowerCase().trim();
    
    let relativeName = "Someone";
    if (isIncoming) {
      relativeName = profileMap.get(invite.created_by) || "Someone";
    } else if (invite.accepted_by) {
      relativeName = profileMap.get(invite.accepted_by) || invite.email || "Someone";
    }

    return {
      id: invite.id,
      workspace_id: invite.workspace_id,
      email: invite.email,
      token: invite.token,
      status: invite.status,
      created_by: invite.created_by,
      accepted_by: invite.accepted_by,
      role: invite.role as WorkspaceRole,
      workspace_name: workspaceMap.get(invite.workspace_id) || "Unknown Workspace",
      inviter_name: isIncoming ? relativeName : undefined,
      invitee_name: !isIncoming ? relativeName : undefined,
      created_at: invite.created_at,
    };
  });
}

/**
 * Marks an outgoing invite notification as dismissed/seen by the inviter.
 */
export async function dismissInviteNotification(inviteId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspace_invites")
    .update({ inviter_seen: true })
    .eq("id", inviteId)
    .eq("created_by", userId);

  if (error) {
    console.error("Database error in dismissInviteNotification:", error);
    throw new Error(error.message);
  }
}

/**
 * Revokes multiple pending workspace invitations.
 */
export async function bulkRevokeWorkspaceInvites(workspaceId: string, inviteIds: string[]): Promise<void> {
  if (!inviteIds.length) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspace_invites")
    .update({ status: "revoked" })
    .eq("workspace_id", workspaceId)
    .in("id", inviteIds);

  if (error) {
    console.error("Database error in bulkRevokeWorkspaceInvites:", error);
    throw new Error(error.message);
  }
}

/**
 * Inserts multiple workspace invitation records into the database.
 */
export async function bulkCreateWorkspaceInvites(
  workspaceId: string,
  emails: string[],
  role: WorkspaceRole,
  inviterId: string
): Promise<WorkspaceInvite[]> {
  if (!emails.length) return [];
  const supabase = await createClient();
  
  const invitesToInsert = emails.map((email) => ({
    workspace_id: workspaceId,
    email: email.trim().toLowerCase(),
    token: crypto.randomUUID(),
    status: "pending",
    created_by: inviterId,
    role,
  }));

  const { data, error } = await supabase
    .from("workspace_invites")
    .insert(invitesToInsert)
    .select();

  if (error) {
    console.error("Database error in bulkCreateWorkspaceInvites:", error);
    throw new Error(error.message);
  }

  return data;
}

