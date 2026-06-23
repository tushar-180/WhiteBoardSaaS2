"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Crown, Infinity, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCards } from "@/components/billing/pricing-cards";
import { getUserSubscriptionAction } from "@/actions/settings";
import { useRazorpay } from "@/hooks/use-razorpay";
import { type PlanType, PLAN_LIMITS } from "@/types/billing";
import { cn, formatDate } from "@/lib/utils";

export function BillingSettings() {
  const [subscription, setSubscription] = useState<{
    plan_type: PlanType;
    status: string;
    current_period_end: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);
  const { openRazorpay, isProcessing } = useRazorpay();

  const fetchSubscription = useCallback(async () => {
    try {
      const data = await getUserSubscriptionAction();
      setSubscription(data as typeof subscription);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch subscription data on mount (using ref to avoid lint warnings)
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchSubscription();
    }
  }, [fetchSubscription]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPlan = (subscription?.plan_type as PlanType) || "free";
  const isActive = subscription?.status === "active";
  const planLimits = PLAN_LIMITS[currentPlan];

  const planIcons: Record<PlanType, React.ElementType> = {
    free: Sparkles,
    pro: Crown,
    ultra: Infinity,
  };
  const PlanIcon = planIcons[currentPlan];

  const planColors: Record<PlanType, string> = {
    free: "bg-muted text-muted-foreground",
    pro: "bg-indigo-500/10 text-indigo-500",
    ultra: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-1 space-y-8">
      {/* Current Plan Card */}
      <div>
        <h2 className="text-base font-bold mb-1">Current Plan</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Manage your Zentrox subscription and billing.
        </p>

        <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-lg", planColors[currentPlan])}>
                <PlanIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold capitalize text-foreground text-sm">{currentPlan}</p>
                <p className="text-xs text-muted-foreground">
                  {isActive ? "Active" : "Expired"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                {currentPlan === "free" ? "₹0" : currentPlan === "pro" ? "₹499/mo" : "₹1499/mo"}
              </span>
            </div>
          </div>

          {subscription?.current_period_end && (
            <div className="text-xs text-muted-foreground border-t border-border/30 pt-3">
              Current period ends: {formatDate(subscription.current_period_end)}
            </div>
          )}

          <div className="border-t border-border/30 pt-3 space-y-2">
            <p className="text-xs font-semibold text-foreground">Plan Limits</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-muted/30 rounded-lg p-2.5">
                <p className="text-sm font-bold text-foreground">
                  {planLimits.workspaces === -1 ? "∞" : planLimits.workspaces}
                </p>
                <p className="text-[10px] text-muted-foreground">Workspaces</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2.5">
                <p className="text-sm font-bold text-foreground">
                  {planLimits.boards === -1 ? "∞" : planLimits.boards}
                </p>
                <p className="text-[10px] text-muted-foreground">Boards per WS</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2.5">
                <p className="text-sm font-bold text-foreground">
                  {planLimits.members === -1 ? "∞" : planLimits.members}
                </p>
                <p className="text-[10px] text-muted-foreground">Members</p>
              </div>
            </div>
          </div>

          {currentPlan !== "ultra" && (
            <div className="pt-2">
              <Button
                onClick={() => openRazorpay(currentPlan === "free" ? "pro" : "ultra")}
                disabled={isProcessing}
                className="w-full rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
              >
                <Crown className="h-3.5 w-3.5 mr-1.5" />
                {isProcessing ? "Processing..." : currentPlan === "free" ? "Upgrade to Pro" : "Upgrade to Ultra"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Cards Comparison */}
      <div>
        <h2 className="text-base font-bold mb-1">Compare Plans</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Choose the plan that works best for your team.
        </p>
        <PricingCards
          currentPlan={currentPlan}
          onSelectPlan={openRazorpay}
          isLoading={isProcessing}
        />
      </div>
    </div>
  );
}
