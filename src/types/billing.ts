import { z } from "zod";

export type PlanType = "free" | "pro" | "ultra";

export type SubscriptionStatus = "active" | "expired";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentProvider = "razorpay";

export interface UserSubscription {
  user_id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  plan_type: Extract<PlanType, "pro" | "ultra">;
  provider: PaymentProvider;
  provider_order_id: string;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export const PLAN_LIMITS: Record<PlanType, {
  workspaces: number;
  boards: number;
  members: number;
  label: string;
  price: number;
}> = {
  free: { workspaces: 1, boards: 3, members: 0, label: "Free", price: 0 },
  pro: { workspaces: 3, boards: 10, members: 10, label: "Pro", price: 49900 }, // ₹499 (in paise)
  ultra: { workspaces: -1, boards: -1, members: -1, label: "Ultra", price: 149900 }, // ₹1499 (in paise)
} as const;

export const PLAN_PRICES_INR: Record<"pro" | "ultra", number> = {
  pro: 499,
  ultra: 1499,
};

export const planTypeSchema = z.enum(["free", "pro", "ultra"] as const);
export const billingPlanSchema = z.enum(["pro", "ultra"] as const);

export type BillingPlan = z.infer<typeof billingPlanSchema>;

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  planType: PlanType;
}

export interface PaymentVerificationInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
