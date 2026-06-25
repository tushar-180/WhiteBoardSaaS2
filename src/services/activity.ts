import { SupabaseClient } from "@supabase/supabase-js";
import {
  ActivityActionType,
  ActivityEntityType,
  WorkspaceActivityWithProfile,
} from "@/types/activity";

interface LogActivityParams {
  workspaceId: string;
  actorId: string;
  actionType: ActivityActionType;
  entityType: ActivityEntityType;
  entityId?: string;
  metadata?: Record<string, any>;
}

/**
 * Logs an activity into the workspace_activities table.
 * Does not throw an error if it fails (fails silently) to avoid breaking main application flow.
 */
export async function logActivity(
  client: SupabaseClient,
  params: LogActivityParams
) {
  try {
    const { error } = await client.from("workspace_activities").insert({
      workspace_id: params.workspaceId,
      actor_id: params.actorId,
      action_type: params.actionType,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      metadata: params.metadata || {},
    });

    if (error) {
      console.error("[logActivity] Error inserting activity:", error.message);
    }
  } catch (err) {
    console.error("[logActivity] Exception logging activity:", err);
  }
}

/**
 * Fetches recent activities for a workspace, joining with profiles for actor details.
 */
export async function fetchWorkspaceActivities(
  client: SupabaseClient,
  workspaceId: string,
  limit: number = 50
): Promise<WorkspaceActivityWithProfile[]> {
  const { data, error } = await client
    .from("workspace_activities")
    .select(`
      *,
      profiles:actor_id (
        name,
        email,
        avatar_url
      )
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("[fetchWorkspaceActivities] Error fetching activities:", error?.message);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    workspace_id: row.workspace_id,
    actor_id: row.actor_id,
    action_type: row.action_type,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    metadata: row.metadata,
    created_at: row.created_at,
    actor_name: row.profiles?.name || null,
    actor_email: row.profiles?.email || null,
    actor_avatar_url: row.profiles?.avatar_url || null,
  })) as WorkspaceActivityWithProfile[];
}
