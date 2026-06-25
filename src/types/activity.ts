export type ActivityActionType =
  | "workspace_created"
  | "workspace_renamed"
  | "board_created"
  | "board_renamed"
  | "board_deleted"
  | "member_invited"
  | "invite_rejected"
  | "invite_revoked"
  | "member_joined"
  | "role_changed"
  | "member_removed"
  | "member_left"
  | "member_renamed";

export type ActivityEntityType = "workspace" | "board" | "member" | "invite";

export interface WorkspaceActivity {
  id: string;
  workspace_id: string;
  actor_id: string;
  action_type: ActivityActionType;
  entity_type: ActivityEntityType;
  entity_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface WorkspaceActivityWithProfile extends WorkspaceActivity {
  actor_name: string | null;
  actor_email: string | null;
  actor_avatar_url: string | null;
}
