"use server";

import { requireActionAuth, createAdminClient } from "@/utils/supabase/server";
import { fetchProfileById } from "@/services/profile";
import { fetchAllUserWorkspaces } from "@/services/workspace";
import { getUserSubscription } from "@/services/billing";

export async function getSettingsDataAction() {
  const { user } = await requireActionAuth("You must be logged in to view settings.");

  const [profile, workspaces] = await Promise.all([
    fetchProfileById(user.id),
    fetchAllUserWorkspaces(user.id),
  ]);

  return {
    user: {
      id: user.id,
      email: user.email || "",
      name: profile?.name || user.email?.split("@")[0] || "User",
      avatar_url: profile?.avatar_url ?? null,
    },
    workspaces,
  };
}

/**
 * Fetches the current user's subscription details.
 * Delegates to the billing service which handles:
 * - Default free plan when no DB row exists
 * - Expiry detection with DB persistence (status→expired, plan_type→free)
 */
export async function getUserSubscriptionAction(): Promise<{
  plan_type: string;
  status: string;
  current_period_end: string | null;
}> {
  const { user } = await requireActionAuth("You must be logged in to view billing.");

  const subscription = await getUserSubscription(user.id);

  return {
    plan_type: subscription.plan_type,
    status: subscription.status,
    current_period_end: subscription.current_period_end,
  };
}

/**
 * Cancels the current user's paid subscription and downgrades to free plan.
 */
export async function cancelSubscriptionAction(): Promise<void> {
  const { user } = await requireActionAuth("You must be logged in to manage billing.");

  const adminSupabase = createAdminClient();

  const { data: sub, error: fetchError } = await adminSupabase
    .from("user_subscriptions")
    .select("plan_type")
    .eq("user_id", user.id)
    .single();

  if (fetchError || !sub) {
    throw new Error("No active subscription found.");
  }

  if (sub.plan_type === "free") {
    throw new Error("You are already on the Free plan.");
  }

  const { error: updateError } = await adminSupabase
    .from("user_subscriptions")
    .update({
      plan_type: "free",
      status: "expired",
      current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Error canceling subscription:", updateError);
    throw new Error("Failed to cancel subscription. Please try again.");
  }
}
