"use server";

import { requireActionAuth, createClient } from "@/utils/supabase/server";
import { PLAN_LIMITS, type PlanType } from "@/types/billing";

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  planType: PlanType;
}

/**
 * Checks if the current user can create a workspace based on their plan.
 */
export async function checkWorkspaceLimitAction(): Promise<LimitCheckResult> {
  const { user } = await requireActionAuth("You must be logged in.");

  const supabase = await createClient();

  // Get subscription
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("plan_type")
    .eq("user_id", user.id)
    .single();

  const planType: PlanType = (sub?.plan_type as PlanType) || "free";
  const limit = PLAN_LIMITS[planType].workspaces;

  // Unlimited
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1, planType };
  }

  const { count } = await supabase
    .from("workspaces")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const current = count ?? 0;

  return { allowed: current < limit, current, limit, planType };
}

/**
 * Checks if the workspace owner can create a board based on their plan.
 */
export async function checkBoardLimitAction(
  workspaceId: string,
): Promise<LimitCheckResult> {
  const supabase = await createClient();

  // Find workspace owner
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    return { allowed: false, current: 0, limit: 0, planType: "free" };
  }

  // Get subscription
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("plan_type")
    .eq("user_id", workspace.owner_id)
    .single();

  const planType: PlanType = (sub?.plan_type as PlanType) || "free";
  const limit = PLAN_LIMITS[planType].boards;

  // Unlimited
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1, planType };
  }

  const { count } = await supabase
    .from("boards")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  const current = count ?? 0;

  return { allowed: current < limit, current, limit, planType };
}

/**
 * Checks if the workspace owner can invite members based on their plan.
 */
export async function checkMemberLimitAction(
  workspaceId: string,
): Promise<LimitCheckResult> {
  const supabase = await createClient();

  // Find workspace owner
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace) {
    return { allowed: false, current: 0, limit: 0, planType: "free" };
  }

  // Get subscription
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("plan_type")
    .eq("user_id", workspace.owner_id)
    .single();

  const planType: PlanType = (sub?.plan_type as PlanType) || "free";
  const limit = PLAN_LIMITS[planType].members;

  // Unlimited
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1, planType };
  }

  // Count existing members
  const { count: memberCount } = await supabase
    .from("workspace_members")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  // Count pending invites
  const { count: inviteCount } = await supabase
    .from("workspace_invites")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "pending");

  const current = (memberCount ?? 0) + (inviteCount ?? 0);

  return { allowed: current < limit, current, limit, planType };
}
