"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireActionAuth } from "@/utils/supabase/server";
import { sendWorkspaceInviteEmail } from "@/services/email";
import { getPostHogClient } from "@/lib/posthog-server";
import {
  createWorkspaceInvite,
  acceptWorkspaceInvite,
  revokeWorkspaceInvite,
  rejectWorkspaceInvite,
  fetchInviteByToken,
  fetchUserNotifications,
  dismissInviteNotification,
  checkIfInviteIsPending,
} from "@/services/invite";
import { fetchWorkspaceById } from "@/services/workspace";
import { fetchWorkspaceMemberRole, checkIfEmailIsMember } from "@/services/member";
import { type WorkspaceRole, inviteSchema, type WorkspaceInviteWithWorkspace } from "@/types/workspace";
import { ROUTES } from "@/lib/constants";
import { searchProfilesByEmail } from "@/services/profile";
import { type Profile } from "@/types/profile";

/**
 * Creates a workspace invite, generates a magic link, and attempts to send an email via Resend.
 * Only owners and admins can invite others.
 */
export async function createInviteAction(
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
): Promise<{ inviteLink: string; emailSent: boolean; emailError?: string }> {
  try {
    const { user } = await requireActionAuth(
      "You must be logged in to invite members.",
    );

    // 1. Validate inputs using inviteSchema
    const validated = inviteSchema.safeParse({ email, role });
    if (!validated.success) {
      throw new Error(validated.error.issues[0].message);
    }
    const trimmedEmail = validated.data.email.toLowerCase();
    const validatedRole = validated.data.role;

    // 2. Fetch workspace details
    const workspace = await fetchWorkspaceById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found.");
    }

    // 3. Verify that the caller is an owner or admin
    const currentUserRole = await fetchWorkspaceMemberRole(
      workspaceId,
      user.id,
    );
    if (
      !currentUserRole ||
      (currentUserRole !== "owner" && currentUserRole !== "admin")
    ) {
      throw new Error(
        "Only workspace owners and administrators can invite new members.",
      );
    }

    // 4. Check if the email is already a member of the workspace
    const existingMemberRole = await checkIfEmailIsMember(workspaceId, trimmedEmail);
    if (existingMemberRole) {
      throw new Error(
        `The email ${trimmedEmail} is already a member of this workspace as a ${existingMemberRole}.`,
      );
    }

    // 5. Check if an invite is already pending for this email
    const isPending = await checkIfInviteIsPending(workspaceId, trimmedEmail);
    if (isPending) {
      throw new Error(`An invitation for ${trimmedEmail} is already pending.`);
    }

    // 6. Create the invite row in the database
    const invite = await createWorkspaceInvite(
      workspaceId,
      trimmedEmail,
      validatedRole,
      user.id,
    );

    // 7. Build the invite link dynamically using environment variables or request headers
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    let inviteLink = "";

    if (baseUrl) {
      const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      inviteLink = `${cleanBaseUrl}/invite/${invite.token}`;
    } else {
      const headerStore = await headers();
      const forwardedHost = headerStore.get("x-forwarded-host");
      const host = forwardedHost || headerStore.get("host") || "localhost:3000";
      const forwardedProto = headerStore.get("x-forwarded-proto");
      const protocol = forwardedProto || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
      inviteLink = `${protocol}://${host}/invite/${invite.token}`;
    }

    // 8. Attempt to send invitation email using the email service
    const { success: emailSent, error: emailError } = await sendWorkspaceInviteEmail(
      trimmedEmail,
      workspace.name,
      validatedRole,
      inviteLink,
      user.email || "A workspace member",
      invite.id
    );

    if (!emailSent) {
      console.log("Logging invite link in server console:", inviteLink, "Error:", emailError);
    }

    getPostHogClient().capture({
      distinctId: user.id,
      event: "workspace_invite_sent",
      properties: {
        workspace_id: workspaceId,
        workspace_name: workspace.name,
        invited_role: validatedRole,
        email_sent: emailSent,
      },
    });

    // Revalidate paths
    revalidatePath(`${ROUTES.WORKSPACES}/${workspaceId}`);

    return { inviteLink, emailSent, emailError };
  } catch (error: unknown) {
    console.error("Action error in createInviteAction:", error);
    throw new Error((error as Error).message || "Failed to create invitation.");
  }
}

/**
 * Revokes a pending workspace invitation.
 * Only owners and admins can revoke invites.
 */
export async function revokeInviteAction(
  workspaceId: string,
  inviteId: string,
): Promise<void> {
  try {
    const { user } = await requireActionAuth(
      "You must be logged in to revoke invitations.",
    );

    // 1. Fetch current user's role
    const currentUserRole = await fetchWorkspaceMemberRole(
      workspaceId,
      user.id,
    );
    if (
      !currentUserRole ||
      (currentUserRole !== "owner" && currentUserRole !== "admin")
    ) {
      throw new Error(
        "You do not have permission to revoke invitations in this workspace.",
      );
    }

    // 2. Revoke invitation in database
    await revokeWorkspaceInvite(workspaceId, inviteId);

    // Revalidate paths
    revalidatePath(`${ROUTES.WORKSPACES}/${workspaceId}`);
  } catch (error: unknown) {
    console.error("Action error in revokeInviteAction:", error);
    throw new Error((error as Error).message || "Failed to revoke invitation.");
  }
}

/**
 * Rejects a workspace invitation for the currently logged-in user.
 */
export async function rejectInviteAction(token: string): Promise<void> {
  try {
    const { user } = await requireActionAuth(
      "You must be logged in to reject invitations.",
    );

    // Reject the invite
    await rejectWorkspaceInvite(token, user.id);

    getPostHogClient().capture({
      distinctId: user.id,
      event: "workspace_invite_declined",
      properties: { invite_token: token },
    });

    // Revalidate workspaces list path
    revalidatePath(ROUTES.WORKSPACES);
  } catch (error: unknown) {
    console.error("Action error in rejectInviteAction:", error);
    throw new Error((error as Error).message || "Failed to reject invitation.");
  }
}

/**
 * Accepts a workspace invitation for the currently logged-in user.
 * Only accepts if the user's email matches the invited email.
 */
export async function acceptInviteAction(token: string): Promise<string> {
  try {
    const { user } = await requireActionAuth(
      "You must be logged in to accept invitations.",
    );

    // 1. Fetch the invite to verify email matches
    const invite = await fetchInviteByToken(token);
    if (!invite) {
      throw new Error("Invitation is invalid, expired, or has already been accepted.");
    }

    // 2. Verify that the current user's email matches the invited email
    const userEmail = user.email?.toLowerCase().trim() || "";
    const invitedEmail = invite.email.toLowerCase().trim();
    
    if (userEmail !== invitedEmail) {
      throw new Error(
        `This invitation was sent to ${invite.email}. Please log in with that email address to accept this invitation.`,
      );
    }

    // 3. Accept the invite. The service handles joining member and updating invite status
    const workspaceId = await acceptWorkspaceInvite(token, user.id);

    getPostHogClient().capture({
      distinctId: user.id,
      event: "workspace_invite_accepted",
      properties: {
        workspace_id: workspaceId,
        invite_token: token,
        role: invite.role,
      },
    });

    // Revalidate workspaces list path
    revalidatePath(ROUTES.WORKSPACES);
    revalidatePath(`${ROUTES.WORKSPACES}/${workspaceId}`);

    return workspaceId;
  } catch (error: unknown) {
    console.error("Action error in acceptInviteAction:", error);
    throw new Error((error as Error).message || "Failed to accept invitation.");
  }
}

/**
 * Searches for public profiles matching the query email. done
 */
export async function searchProfilesAction(query: string): Promise<Profile[]> {
  try {
    await requireActionAuth("You must be logged in to search profiles.");
    return await searchProfilesByEmail(query);
  } catch (error) {
    console.error("Action error in searchProfilesAction:", error);
    return [];
  }
}


/**
 * Fetches all notifications for the logged-in user (incoming invites + outgoing statuses).
 */
export async function getUserNotificationsAction(): Promise<WorkspaceInviteWithWorkspace[]> {
  try {
    const { user } = await requireActionAuth("You must be logged in to fetch notifications.");
    if (!user.email) return [];
    return await fetchUserNotifications(user.email, user.id);
  } catch (error) {
    console.error("Action error in getUserNotificationsAction:", error);
    return [];
  }
}

/**
 * Dismisses an outgoing invite notification (marks it seen by inviter).
 */
export async function dismissNotificationAction(inviteId: string): Promise<void> {
  try {
    const { user } = await requireActionAuth("You must be logged in to dismiss notifications.");
    await dismissInviteNotification(inviteId, user.id);
  } catch (error) {
    console.error("Action error in dismissNotificationAction:", error);
    throw new Error((error as Error).message || "Failed to dismiss notification.");
  }
}
