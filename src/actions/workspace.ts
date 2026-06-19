"use server";

import { revalidatePath } from "next/cache";
import { requireActionAuth, createClient } from "@/utils/supabase/server";
import { insertWorkspace, deleteWorkspace, bulkDeleteWorkspaces, updateWorkspace } from "@/services/workspace";
import { bulkLeaveWorkspaces, fetchWorkspaceMemberRole } from "@/services/member";
import { type Workspace, workspaceSchema } from "@/types/workspace";
import { ROUTES } from "@/lib/constants";
import { getPostHogClient } from "@/lib/posthog-server";




/**
 * Creates a new workspace with a slug generated from the workspace name.
 */
export async function createWorkspaceAction(name: string): Promise<Workspace> {
  try {
    const { user } = await requireActionAuth("You must be logged in to create a workspace.");

    const validated = workspaceSchema.safeParse({ name });
    if (!validated.success) {
      throw new Error(validated.error.issues[0].message);
    }
    const trimmedName = validated.data.name;

    // Check if user already owns a workspace with this name (case-insensitive)
    const supabase = await createClient();
    const { data: existingWorkspace, error: checkError } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .ilike("name", trimmedName.trim())
      .maybeSingle();

    if (checkError) {
      console.error("Database error checking existing workspace:", checkError);
    }

    if (existingWorkspace) {
      throw new Error(`You have already created a workspace named "${trimmedName}".`);
    }

    // Slugify the workspace name
    const cleanSlug = trimmedName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // remove non-alphanumeric (excluding space/dash)
      .replace(/[\s_-]+/g, "-")   // replace spaces or multiple dashes with a single dash
      .replace(/^-+|-+$/g, "");  // trim outer dashes

    const randomHash = Math.random().toString(36).substring(2, 6);
    const slug = `${cleanSlug}-${randomHash}`;

    const newWorkspace = await insertWorkspace(trimmedName, slug, user.id);

    getPostHogClient().capture({
      distinctId: user.id,
      event: "workspace_created",
      properties: { workspace_id: newWorkspace.id, workspace_name: newWorkspace.name },
    });

    // Revalidate the caching of the workspaces list page
    revalidatePath(ROUTES.WORKSPACES);

    return newWorkspace;
  } catch (error: unknown) {
    throw new Error((error as Error).message || "Failed to create workspace.");
  }
}

/**
 * Deletes a workspace.
 */
export async function deleteWorkspaceAction(workspaceId: string): Promise<void> {
  try {
    const { user } = await requireActionAuth("You must be logged in to delete a workspace.");

    await deleteWorkspace(workspaceId, user.id);

    getPostHogClient().capture({
      distinctId: user.id,
      event: "workspace_deleted",
      properties: { workspace_id: workspaceId },
    });

    // Revalidate the caching of the workspaces list page
    revalidatePath(ROUTES.WORKSPACES);
  } catch (error: unknown) {
    throw new Error((error as Error).message || "Failed to delete workspace.");
  }
}

/**
 * Updates a workspace's details.
 */
export async function updateWorkspaceAction(workspaceId: string, name: string): Promise<Workspace> {
  try {
    const { user } = await requireActionAuth("You must be logged in to update a workspace.");

    // Validate access
    const role = await fetchWorkspaceMemberRole(workspaceId, user.id);
    if (role !== "owner" && role !== "admin") {
      throw new Error("You do not have permission to update this workspace.");
    }

    const validated = workspaceSchema.safeParse({ name });
    if (!validated.success) {
      throw new Error(validated.error.issues[0].message);
    }

    const updatedWorkspace = await updateWorkspace(workspaceId, validated.data.name);

    getPostHogClient().capture({
      distinctId: user.id,
      event: "workspace_updated",
      properties: { workspace_id: workspaceId, workspace_name: updatedWorkspace.name },
    });

    revalidatePath(ROUTES.WORKSPACES);
    revalidatePath(`${ROUTES.WORKSPACES}/${workspaceId}`);

    return updatedWorkspace;
  } catch (error: unknown) {
    throw new Error((error as Error).message || "Failed to update workspace.");
  }
}

/**
 * Deletes multiple workspaces.
 */
export async function bulkDeleteWorkspacesAction(workspaceIds: string[]): Promise<void> {
  try {
    const { user } = await requireActionAuth("You must be logged in to delete workspaces.");

    await bulkDeleteWorkspaces(workspaceIds, user.id);

    // Revalidate the caching of the workspaces list page
    revalidatePath(ROUTES.WORKSPACES);
  } catch (error: unknown) {
    throw new Error((error as Error).message || "Failed to delete workspaces.");
  }
}


/**
 * Leaves multiple workspaces.
 */
export async function bulkLeaveWorkspacesAction(workspaceIds: string[]): Promise<void> {
  try {
    const { user } = await requireActionAuth("You must be logged in to leave workspaces.");

    await bulkLeaveWorkspaces(workspaceIds, user.id);

    // Revalidate the caching of the workspaces list page
    revalidatePath(ROUTES.WORKSPACES);
  } catch (error: unknown) {
    throw new Error((error as Error).message || "Failed to leave workspaces.");
  }
}

