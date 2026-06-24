import { createClient, createAdminClient } from "@/utils/supabase/server";
import { razorpay } from "@/lib/razorpay";
import {
  type PlanType,
  type UserSubscription,
  type PaymentVerificationInput,
  PLAN_LIMITS,
} from "@/types/billing";
import crypto from "crypto";

/**
 * Fetches the user's current subscription from the database.
 * Returns the default free plan if no subscription row exists.
 */
export async function getUserSubscription(
  userId: string,
): Promise<UserSubscription> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // If no subscription row exists, return free plan as default
    if (error?.code === "PGRST116") {
      return {
        user_id: userId,
        plan_type: "free" as PlanType,
        status: "active" as const,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    console.error("Database error in getUserSubscription:", error);
    throw new Error("Failed to fetch subscription.");
  }

  const subscription = data as UserSubscription;

  // Check if the subscription period has expired
  if (
    subscription.status === "active" &&
    subscription.current_period_end &&
    new Date(subscription.current_period_end) < new Date()
  ) {
    // Period has ended — persist to DB and return expired/free
    const adminSupabase = createAdminClient();
    await adminSupabase
      .from("user_subscriptions")
      .update({
        plan_type: "free",
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return {
      ...subscription,
      plan_type: "free" as PlanType,
      status: "expired" as const,
    };
  }

  return subscription;
}

/**
 * Creates a Razorpay order and inserts a pending payment record. 
 */
export async function createPaymentOrder(
  userId: string,
  planType: "pro" | "ultra",
  userEmail: string,
): Promise<{
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}> {
  const planLimits = PLAN_LIMITS[planType];
  const amount = planLimits.price; // Already in paise

  // 1. Create order with Razorpay
  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `ztx_${Date.now().toString(36)}_${planType}`,
    notes: {
      user_id: userId,
      plan_type: planType,
      email: userEmail,
    },
  });

  const orderAmount = typeof order.amount === "number" ? order.amount : amount;

  // 2. Insert pending payment record
  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert({
    user_id: userId,
    plan_type: planType,
    provider: "razorpay",
    provider_order_id: order.id,
    amount: orderAmount,
    currency: "INR",
    status: "pending",
  });

  if (error) {
    console.error("Database error inserting payment:", error);
    throw new Error("Failed to create payment record.");
  }

  return {
    order_id: order.id,
    amount: orderAmount,
    currency: order.currency,
    key_id: process.env.RAZORPAY_KEY_ID!,
  };
}

/**
 * Verifies a Razorpay payment signature and updates the payment & subscription.
 */
export async function verifyPayment(
  input: PaymentVerificationInput,
): Promise<{ success: boolean }> {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = input;

  // 1. Verify signature cryptographically
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new Error("Invalid payment signature.");
  }

  // 2. Use admin client to update payment and subscription
  const adminSupabase = createAdminClient();

  // Fetch the payment record
  const { data: payment, error: fetchError } = await adminSupabase
    .from("payments")
    .select("*")
    .eq("provider_order_id", razorpay_order_id)
    .single();

  if (fetchError || !payment) {
    console.error("Payment not found for order:", razorpay_order_id);
    throw new Error("Payment record not found.");
  }

  // 3. Idempotency check — if already paid, skip
  if (payment.status === "paid") {
    return { success: true };
  }

  // 4. Also verify against Razorpay API for extra security
  try {
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.status !== "captured" ||
      Number(razorpayPayment.amount) !== payment.amount
    ) {
      throw new Error("Payment verification failed: order/amount mismatch or uncaptured payment.");
    }
  } catch (err) {
    // If Razorpay API call fails (e.g. network), fall through to signature-only verification
    // which is still secure for most cases
    if (err instanceof Error && err.message.includes("order/amount mismatch or uncaptured")) {
      throw err;
    }
    console.warn("[Billing] Razorpay API verification unavailable, falling back to signature-only:", err);
  }

  // 4. Update payment to paid
  const { error: updatePaymentError } = await adminSupabase
    .from("payments")
    .update({
      provider_payment_id: razorpay_payment_id,
      status: "paid",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (updatePaymentError) {
    console.error("Failed to update payment:", updatePaymentError);
    throw new Error("Failed to update payment status.");
  }

  // 5. Update or insert subscription using the plan_type from the payment record
  //    (never trust plan_type from the request body to prevent privilege escalation)
  // For one-time purchases, set period end to 30 days from now
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  const { error: upsertError } = await adminSupabase
    .from("user_subscriptions")
    .upsert(
      {
        user_id: payment.user_id,
        plan_type: payment.plan_type, // Use from DB, not request body
        status: "active",
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (upsertError) {
    console.error("Failed to update subscription:", upsertError);
    throw new Error("Failed to update subscription.");
  }

  return { success: true };
}

/**
 * Handles Razorpay webhook events for background payment processing.
 */
export async function handleWebhookEvent(
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const adminSupabase = createAdminClient();

  if (event === "payment.captured") {
    const paymentContainer = payload.payment as Record<string, unknown> | undefined;
    const paymentEntity = (paymentContainer?.entity || payload) as Record<string, unknown>;
    const orderId = (paymentEntity.order_id || paymentEntity.orderId) as string;
    const paymentId = paymentEntity.id as string;
    const notes = paymentEntity.notes as Record<string, unknown> | undefined;
    const planType = notes?.plan_type as string | undefined;

    if (!orderId) {
      console.warn("[Webhook] payment.captured missing order_id");
      return;
    }

    // Find the payment record
    const { data: payment } = await adminSupabase
      .from("payments")
      .select("*")
      .eq("provider_order_id", orderId)
      .single();

    if (!payment) {
      console.warn(`[Webhook] No payment record found for order ${orderId}`);
      return;
    }

    // Idempotency check — if already paid (e.g. verify route processed it first), skip
    if (payment.status === "paid") {
      console.log(`[Webhook] Payment ${paymentId} already processed, skipping.`);
      return;
    }

    // Update payment
    await adminSupabase
      .from("payments")
      .update({
        provider_payment_id: paymentId,
        status: "paid",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    // Update subscription
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    await adminSupabase.from("user_subscriptions").upsert(
      {
        user_id: payment.user_id,
        plan_type: (planType || payment.plan_type) as PlanType,
        status: "active",
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    console.log(
      `[Webhook] Successfully processed payment ${paymentId} for user ${payment.user_id}`,
    );
  }

  if (event === "payment.failed") {
    const paymentContainer = payload.payment as Record<string, unknown> | undefined;
    const paymentEntity = (paymentContainer?.entity || payload) as Record<string, unknown>;
    const orderId = (paymentEntity.order_id || paymentEntity.orderId) as string;

    if (!orderId) return;

    await adminSupabase
      .from("payments")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("provider_order_id", orderId);

    console.log(`[Webhook] Marked payment for order ${orderId} as failed`);
  }
}

function getPlanType(subscription: { plan_type: string }): PlanType {
  const pt = subscription.plan_type;
  if (pt === "pro" || pt === "ultra" || pt === "free") return pt;
  return "free";
}

/**
 * Checks whether the user can create a workspace based on their plan limit.
 * Throws a descriptive error if the limit is exceeded.
 * Soft limits: existing data is preserved, creation is blocked.
 */
export async function checkWorkspaceCreationLimit(
  userId: string,
): Promise<void> {
  const subscription = await getUserSubscription(userId);
  const planType = getPlanType(subscription);
  const limit = PLAN_LIMITS[planType].workspaces;

  // Unlimited
  if (limit === -1) return;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("workspaces")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", userId);

  if (error) {
    console.error("Error counting workspaces:", error);
    throw new Error("Could not verify workspace limit. Please try again.");
  }

  const currentCount = count ?? 0;

  if (currentCount >= limit) {
    const planName = PLAN_LIMITS[planType].label;
    throw new Error(
      `You've reached the ${planName} plan limit of ${limit} workspace${limit === 1 ? "" : "s"}. ` +
        `Upgrade to Pro (₹499) for up to 3 workspaces or Ultra (₹1499) for unlimited workspaces.`,
    );
  }
}

/**
 * Checks whether the workspace owner can create a board based on their plan limit.
 * Soft limits: existing data is preserved, creation is blocked.
 */
export async function checkBoardCreationLimit(
  workspaceId: string,
): Promise<void> {
  const supabase = await createClient();

  // Find workspace owner
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace) throw new Error("Workspace not found.");

  const subscription = await getUserSubscription(workspace.owner_id);
  const planType = getPlanType(subscription);
  const limit = PLAN_LIMITS[planType].boards;

  // Unlimited
  if (limit === -1) return;

  const { count, error } = await supabase
    .from("boards")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  if (error) {
    console.error("Error counting boards:", error);
    throw new Error("Could not verify board limit. Please try again.");
  }

  const currentCount = count ?? 0;

  if (currentCount >= limit) {
    const planName = PLAN_LIMITS[planType].label;
    throw new Error(
      `This workspace has reached the ${planName} plan limit of ${limit} board${limit === 1 ? "" : "s"}. ` +
        `Ask the workspace owner to upgrade for more boards.`,
    );
  }
}

/**
 * Checks whether the workspace owner can invite members based on their plan limit.
 * Counts existing members + pending invites.
 * Soft limits: existing data is preserved, invitations are blocked.
 */
export async function checkMemberInviteLimit(
  workspaceId: string,
): Promise<void> {
  const supabase = await createClient();

  // Find workspace owner
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace) throw new Error("Workspace not found.");

  const subscription = await getUserSubscription(workspace.owner_id);
  const planType = getPlanType(subscription);
  const limit = PLAN_LIMITS[planType].members;

  // Unlimited
  if (limit === -1) return;

  // Free plan: 0 members allowed
  if (limit === 0) {
    throw new Error(
      `The Free plan does not support additional members. Upgrade to Pro (₹499/month) for up to 10 members or Ultra (₹1499/month) for unlimited members.`,
    );
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

  const currentTotal = (memberCount ?? 0) + (inviteCount ?? 0);

  if (currentTotal >= limit) {
    throw new Error(
      `This workspace has reached the ${PLAN_LIMITS[planType].label} plan limit of ${limit} members. ` +
        `Ask the workspace owner to upgrade for more members.`,
    );
  }
}

/**
 * Fetches all payment transactions for a given user, ordered by most recent first.
 */
export async function getUserPayments(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Database error in getUserPayments:", error);
    return [];
  }

  return data;
}
