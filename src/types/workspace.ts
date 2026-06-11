import { z } from "zod";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  owner_name?: string;
  currentUserRole?: WorkspaceRole;
  created_at: string;
  updated_at: string;
}

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  joined_at: string;
  role: WorkspaceRole;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  token: string;
  status: "pending" | "accepted" | "expired" | "revoked" | "rejected";
  created_by: string;
  accepted_by: string | null;
  role: WorkspaceRole;
}

export interface Board {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  canvas_data: unknown; // jsonb representation
}

export const workspaceRoleSchema = z.enum(["owner", "admin", "editor", "viewer"] as const);

export const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Workspace name must be at least 2 characters")
    .max(50, "Workspace name must be under 50 characters"),
});

export type WorkspaceFormData = z.infer<typeof workspaceSchema>;

export const boardSchema = z.object({
  name: z
    .string()
    .min(2, "Board name must be at least 2 characters")
    .max(50, "Board name must be under 50 characters"),
  description: z
    .string()
    .max(200, "Description must be under 200 characters")
    .optional()
    .nullable()
    .or(z.literal("")), // Accept empty string as well
});

export type BoardFormData = z.infer<typeof boardSchema>;

export const inviteSchema = z.object({
  email: z.email("Please enter a valid email address."),
  role: z.enum(["admin", "editor", "viewer"] as const),
});

export type InviteFormData = z.infer<typeof inviteSchema>;

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

export interface WorkspaceInviteWithWorkspace extends WorkspaceInvite {
  workspace_name: string;
}



