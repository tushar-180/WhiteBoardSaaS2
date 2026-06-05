"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { fetchWorkspacesByOwner, insertWorkspace, deleteWorkspace } from "@/services/workspace";
import { type Workspace } from "@/types/workspace";

/**
 * Retrieves all workspaces owned by the currently authenticated user.
 */
export async function getWorkspacesAction(): Promise<Workspace[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in to fetch workspaces.");
    }

    return await fetchWorkspacesByOwner(user.id);
  } catch (error: unknown) {
    console.error("Action error in getWorkspacesAction:", error);
    throw new Error((error as Error).message || "Failed to load workspaces.");
  }
}

/**
 * Creates a new workspace with a slug generated from the workspace name.
 */
export async function createWorkspaceAction(name: string): Promise<Workspace> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in to create a workspace.");
    }

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      throw new Error("Workspace name must be at least 2 characters long.");
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

    // Revalidate the caching of the workspaces list page
    revalidatePath("/workspaces");

    return newWorkspace;
  } catch (error: unknown) {
    console.error("Action error in createWorkspaceAction:", error);
    throw new Error((error as Error).message || "Failed to create workspace.");
  }
}

/**
 * Deletes a workspace.
 */
export async function deleteWorkspaceAction(workspaceId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in to delete a workspace.");
    }

    await deleteWorkspace(workspaceId, user.id);

    // Revalidate the caching of the workspaces list page
    revalidatePath("/workspaces");
  } catch (error: unknown) {
    console.error("Action error in deleteWorkspaceAction:", error);
    throw new Error((error as Error).message || "Failed to delete workspace.");
  }
}
