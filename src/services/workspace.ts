import { createClient } from "@/utils/supabase/server";
import { type Workspace, type WorkspaceRole, type WorkspaceMemberPreview } from "@/types/workspace";
import { isValidUUID } from "@/lib/utils";

interface WorkspaceMemberQueryRow {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    email: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
}

interface WorkspaceQueryResult {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  workspace_members?: WorkspaceMemberQueryRow[];
}



/**
 * Fetches all workspaces the user has access to (owned or joined) with owner information.
 */
export async function fetchAllUserWorkspaces(userId: string): Promise<Workspace[]> {
  const supabase = await createClient();

  // 1. Get workspaces owned by user
  const { data: ownedWorkspaces, error: ownedError } = await supabase
    .from("workspaces")
    .select(`
      *,
      workspace_members (
        id,
        user_id,
        role,
        profiles:user_id (
          email,
          name,
          avatar_url
        )
      )
    `)
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (ownedError) {
    console.error("Database error fetching owned workspaces:", ownedError);
    throw new Error(ownedError.message);
  }

  // 2. Get workspaces joined by user (via workspace_members)
  const { data: memberWorkspaces, error: memberError } = await supabase
    .from("workspace_members")
    .select(
      `
      workspace_id,
      role,
      workspaces:workspace_id (
        id,
        name,
        slug,
        owner_id,
        created_at,
        updated_at,
        workspace_members (
          id,
          user_id,
          role,
          profiles:user_id (
            email,
            name,
            avatar_url
          )
        )
      )
    `
    )
    .eq("user_id", userId);

  if (memberError) {
    console.error("Database error fetching joined workspaces:", memberError);
    throw new Error(memberError.message);
  }

  // Extract workspace objects from member records
  interface MemberWorkspaceRow {
    workspace_id: string;
    role: string;
    workspaces: WorkspaceQueryResult[] | null;
  }

  const mapMembers = (membersArray: WorkspaceMemberQueryRow[]): WorkspaceMemberPreview[] => {
    return (membersArray || []).map((m) => {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      return {
        id: m.id,
        user_id: m.user_id,
        role: m.role as WorkspaceRole,
        email: p?.email || "",
        name: p?.name || null,
        avatar_url: p?.avatar_url || null,
      };
    });
  };

  const joinedWorkspacesList = (memberWorkspaces || [])
    .flatMap((m) => {
      const row = m as unknown as MemberWorkspaceRow;
      const ws = row.workspaces;
      const role = row.role as WorkspaceRole;
      if (!ws) return [];
      const workspacesArray = Array.isArray(ws) ? ws : [ws];
      return workspacesArray.map((w) => ({
        ...w,
        currentUserRole: role,
        members_preview: mapMembers(w.workspace_members || []),
      })) as Workspace[];
    });

  // 3. Fetch owner profiles for all unique workspaces
  const ownedWorkspacesWithRole = (ownedWorkspaces || []).map((w) => ({
    ...w,
    currentUserRole: "owner" as WorkspaceRole,
    members_preview: mapMembers((w as unknown as WorkspaceQueryResult).workspace_members || []),
  }));
  const allWorkspaces = [...ownedWorkspacesWithRole, ...joinedWorkspacesList];
  const uniqueOwnerIds = [...new Set(allWorkspaces.map((w) => w.owner_id))];

  const { data: ownerProfiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in("id", uniqueOwnerIds);

  if (profileError) {
    console.warn("Database error fetching owner profiles:", profileError);
    // Continue without owner names if this fails
  }

  // Map owner names to workspaces
  const profileMap = new Map(
    (ownerProfiles || []).map((p: { id: string; name: string | null; email?: string | null }) => [
      p.id,
      p.name || p.email?.split("@")[0] || "Unknown",
    ])
  );

  // Combine and deduplicate workspaces (remove duplicates if user is both owner and member)
  const workspaceMap = new Map<
    string,
    Workspace & { owner_name?: string }
  >();

  allWorkspaces.forEach((workspace) => {
    if (!workspaceMap.has(workspace.id)) {
      workspaceMap.set(workspace.id, {
        ...workspace,
        owner_name: profileMap.get(workspace.owner_id),
      });
    }
  });

  // Return as array sorted by creation date
  return Array.from(workspaceMap.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
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
  if (!isValidUUID(workspaceId)) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Database error in fetchWorkspaceById:", error);
    }
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

/**
 * Deletes multiple workspaces.
 * The workspaces can only be deleted by their owner.
 */
export async function bulkDeleteWorkspaces(workspaceIds: string[], ownerId: string): Promise<void> {
  if (!workspaceIds.length) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("owner_id", ownerId)
    .in("id", workspaceIds);

  if (error) {
    console.error("Database error in bulkDeleteWorkspaces:", error);
    throw new Error(error.message);
  }
}
