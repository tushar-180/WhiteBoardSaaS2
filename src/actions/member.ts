"use server";

import { revalidatePath } from "next/cache";
import { requireActionAuth, createClient } from "@/utils/supabase/server";
import { getPostHogClient } from "@/lib/posthog-server";
import { logActivity } from "@/services/activity";
import {
  fetchWorkspaceMemberRole,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
  fetchWorkspaceMembers,
  bulkRemoveWorkspaceMembers,
} from "@/services/member";
import { fetchWorkspaceById } from "@/services/workspace";
import { type WorkspaceRole, workspaceRoleSchema } from "@/types/workspace";
import { ROUTES } from "@/lib/constants";

/**
 * Removes a member from the workspace.
 * Only owners and admins can remove members. Admins cannot remove owners or other admins.
 */
export async function removeMemberAction(workspaceId: string, memberId: string): Promise<void> {
  try {
    const { user } = await requireActionAuth("You must be logged in to manage workspace members.");

    // 1. Fetch workspace details to check owner_id
    const workspace = await fetchWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found.");
    }

    // 2. Fetch current user's role in the workspace
    const currentUserRole = await fetchWorkspaceMemberRole(workspaceId, user.id);
    if (!currentUserRole || (currentUserRole !== "owner" && currentUserRole !== "admin")) {
      throw new Error("You do not have permission to remove members from this workspace.");
    }

    // 3. Fetch the target member's details to enforce role security
    const members = await fetchWorkspaceMembers(workspaceId);
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) {
      throw new Error("Member not found in workspace.");
    }

    // 4. Enforce security rules:
    // - Cannot remove the owner of the workspace.
    if (targetMember.role === "owner" || targetMember.user_id === workspace.owner_id) {
      throw new Error("The workspace owner cannot be removed.");
    }

    // - Admins cannot remove other admins (only owner can do this).
    if (currentUserRole === "admin" && targetMember.role === "admin") {
      throw new Error("Administrators cannot remove other administrators.");
    }

    // - Cannot remove yourself (users should leave via a different action, or let them remove themselves if they are not the owner).
    if (targetMember.user_id === user.id) {
      throw new Error("You cannot remove yourself. Use 'Leave Workspace' instead.");
    }

    // 5. Perform deletion
    await removeWorkspaceMember(workspaceId, memberId);

    getPostHogClient().capture({
      distinctId: user.id,
      event: "workspace_member_removed",
      properties: {
        workspace_id: workspaceId,
        removed_member_id: memberId,
        removed_member_role: targetMember.role,
      },
    });

    const supabase = await createClient();
    await logActivity(supabase, {
      workspaceId,
      actorId: user.id,
      actionType: "member_removed",
      entityType: "member",
      entityId: memberId,
      metadata: { email: targetMember.email, role: targetMember.role },
    });

    // Revalidate paths
    revalidatePath(`${ROUTES.WORKSPACES}/${workspaceId}`);
  } catch (error: unknown) {
    throw new Error((error as Error).message || "Failed to remove member.");
  }
}

/**
 * Updates a member's role in the workspace.
 * Only owners and admins can change roles. Admins cannot change owner/admin roles.
 */
export async function updateMemberRoleAction(
  workspaceId: string,
  memberId: string,
  newRole: WorkspaceRole
): Promise<void> {
  try {
    const { user } = await requireActionAuth("You must be logged in to update member roles.");

    // 1. Validate role value
    const validated = workspaceRoleSchema.safeParse(newRole);
    if (!validated.success || validated.data === "owner") {
      throw new Error("Invalid role selection.");
    }
    const validatedRole = validated.data;

    // 2. Fetch workspace to verify existence
    const workspace = await fetchWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found.");
    }

    // 3. Fetch current user's role
    const currentUserRole = await fetchWorkspaceMemberRole(workspaceId, user.id);
    if (!currentUserRole || (currentUserRole !== "owner" && currentUserRole !== "admin")) {
      throw new Error("You do not have permission to manage roles in this workspace.");
    }

    // 4. Fetch the target member's details
    const members = await fetchWorkspaceMembers(workspaceId);
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) {
      throw new Error("Member not found in workspace.");
    }

    // 5. Enforce security rules:
    // - Cannot modify the workspace owner's role
    if (targetMember.role === "owner" || targetMember.user_id === workspace.owner_id) {
      throw new Error("The workspace owner's role cannot be modified.");
    }

    // - Admins cannot modify other admins' roles
    if (currentUserRole === "admin" && targetMember.role === "admin") {
      throw new Error("Administrators cannot modify other administrators' roles.");
    }

    // - Admins cannot promote members to admin (only owner can promote/demote admins)
    if (currentUserRole === "admin" && newRole === "admin") {
      throw new Error("Only the workspace owner can promote members to Administrator.");
    }

    // - Cannot modify your own role
    if (targetMember.user_id === user.id) {
      throw new Error("You cannot modify your own role.");
    }

    // 6. Update role
    await updateWorkspaceMemberRole(workspaceId, memberId, validatedRole);

    getPostHogClient().capture({
      distinctId: user.id,
      event: "workspace_member_role_updated",
      properties: {
        workspace_id: workspaceId,
        member_id: memberId,
        previous_role: targetMember.role,
        new_role: validatedRole,
      },
    });

    const supabase = await createClient();
    await logActivity(supabase, {
      workspaceId,
      actorId: user.id,
      actionType: "role_changed",
      entityType: "member",
      entityId: memberId,
      metadata: { old_role: targetMember.role, new_role: validatedRole, email: targetMember.email },
    });

    // Revalidate paths
    revalidatePath(`${ROUTES.WORKSPACES}/${workspaceId}`);
  } catch (error: unknown) {
    throw new Error((error as Error).message || "Failed to update member role.");
  }
}

/**
 * Allows a user to leave a workspace.
 * Users cannot leave if they are the owner of the workspace.
 */
export async function leaveWorkspaceAction(workspaceId: string): Promise<void> {
  try {
    const { user } = await requireActionAuth("You must be logged in to leave a workspace.");

    // 1. Fetch workspace to check if user is the owner
    const workspace = await fetchWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found.");
    }

    // 2. Prevent owner from leaving
    if (workspace.owner_id === user.id) {
      throw new Error("Workspace owner cannot leave. Please delete the workspace or transfer ownership first.");
    }

    // 3. Find the member record for the current user
    const members = await fetchWorkspaceMembers(workspaceId);
    const currentMember = members.find((m) => m.user_id === user.id);
    if (!currentMember) {
      throw new Error("You are not a member of this workspace.");
    }

    // 4. Remove the user from the workspace
    await removeWorkspaceMember(workspaceId, currentMember.id);

    getPostHogClient().capture({
      distinctId: user.id,
      event: "workspace_left",
      properties: { workspace_id: workspaceId, role: currentMember.role },
    });

    const supabase = await createClient();
    await logActivity(supabase, {
      workspaceId,
      actorId: user.id,
      actionType: "member_left",
      entityType: "member",
      entityId: currentMember.id,
      metadata: { email: user.email, role: currentMember.role },
    });

    // Revalidate paths
    revalidatePath(ROUTES.WORKSPACES);
  } catch (error: unknown) {
    throw new Error((error as Error).message || "Failed to leave workspace.");
  }
}

/**
 * Fetches members of a workspace to display in the UI (e.g. avatar groups).
 */
export async function getWorkspaceMembersAction(workspaceId: string) {
  try {
    await requireActionAuth("You must be logged in to view workspace members.");
    
    return await fetchWorkspaceMembers(workspaceId);
  } catch {
    throw new Error("Failed to fetch workspace members. Please try again.");
  }
}

/**
 * Removes multiple members from the workspace.
 * Only owners can bulk remove members.
 */
export async function bulkRemoveMembersAction(workspaceId: string, memberIds: string[]): Promise<void> {
  try {
    const { user } = await requireActionAuth("You must be logged in to manage workspace members.");

    // 1. Fetch current user's role in the workspace
    const currentUserRole = await fetchWorkspaceMemberRole(workspaceId, user.id);
    if (!currentUserRole || currentUserRole !== "owner") {
      throw new Error("Only the workspace owner can bulk remove members.");
    }

    // 2. Fetch the target members details
    const members = await fetchWorkspaceMembers(workspaceId);
    
    // Prevent removing the owner or oneself
    const validMemberIds = memberIds.filter(id => {
      const member = members.find(m => m.id === id);
      if (!member) return false;
      if (member.role === "owner" || member.user_id === user.id) return false;
      return true;
    });

    if (validMemberIds.length === 0) return;

    // 3. Perform deletion
    await bulkRemoveWorkspaceMembers(workspaceId, validMemberIds);

    const supabase = await createClient();
    await Promise.all(
      validMemberIds.map((id) => {
        const targetMember = members.find((m) => m.id === id);
        if (targetMember) {
          return logActivity(supabase, {
            workspaceId,
            actorId: user.id,
            actionType: "member_removed",
            entityType: "member",
            entityId: id,
            metadata: { email: targetMember.email, role: targetMember.role },
          });
        }
      })
    );

    // Revalidate paths
    revalidatePath(`${ROUTES.WORKSPACES}/${workspaceId}`);
  } catch (error: unknown) {
    throw new Error((error as Error).message || "Failed to remove members.");
  }
}

