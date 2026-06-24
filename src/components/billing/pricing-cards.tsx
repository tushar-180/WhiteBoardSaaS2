"use client";

import { Check, Sparkles, Crown, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_PRICES_INR, type PlanType } from "@/types/billing";
import { cn } from "@/lib/utils";

interface PricingCardsProps {
  currentPlan: PlanType;
  onSelectPlan: (plan: "pro" | "ultra") => void;
  loadingPlan?: "pro" | "ultra" | null;
}

const tierDetails: Record<PlanType, {
  icon: React.ElementType;
  description: string;
  highlight?: string;
  features: string[];
}> = {
  free: {
    icon: Sparkles,
    description: "Perfect for getting started",
    features: [
      "1 workspace",
      "3 boards per workspace",
      "Owner-only access",
    ],
  },
  pro: {
    icon: Crown,
    description: "For growing teams",
    highlight: "Most Popular",
    features: [
      "Up to 3 workspaces",
      "10 boards per workspace",
      "Up to 10 team members",
      "Role-based access control",
      "Priority support",
    ],
  },
  ultra: {
    icon: Infinity,
    description: "For power users & large teams",
    features: [
      "Unlimited workspaces",
      "Unlimited boards",
      "Unlimited team members",
      "All Pro features",
      "Dedicated support",
    ],
  },
};

export function PricingCards({ currentPlan, onSelectPlan, loadingPlan }: PricingCardsProps) {
  const plans: PlanType[] = ["free", "pro", "ultra"];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {plans.map((plan) => {
        const details = tierDetails[plan];
        const Icon = details.icon;
        const isCurrentPlan = currentPlan === plan;
        const isProOrUltra = plan === "pro" || plan === "ultra";
        const price = isProOrUltra ? PLAN_PRICES_INR[plan] : null;

        return (
          <div
            key={plan}
            className={cn(
              "relative flex flex-col rounded-lg border bg-card p-5 transition-colors",
              plan === "pro" ? "border-foreground/20 ring-1 ring-foreground/10 shadow-sm" : "border-border"
            )}
          >
            {details.highlight && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-foreground text-background px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full whitespace-nowrap inline-flex">
                  {details.highlight}
                </span>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="h-4 w-4 text-foreground/70" />
                <h2 className="text-base font-semibold capitalize tracking-tight">{plan}</h2>
              </div>
              <p className="text-xs text-muted-foreground h-8">
                {details.description}
              </p>
            </div>

            <div className="mb-6">
              {price ? (
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold tracking-tight">₹{price}</span>
                  <span className="text-xs font-medium text-muted-foreground mb-1">/mo</span>
                </div>
              ) : (
                <span className="text-2xl font-bold tracking-tight">Free</span>
              )}
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {details.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-foreground/60" />
                  <span className="text-foreground/80 text-xs font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {isCurrentPlan ? (
                <Button
                  disabled
                  variant="outline"
                  className="w-full h-8 text-xs font-medium"
                >
                  Current Plan
                </Button>
              ) : plan !== "free" ? (
                <Button
                  onClick={() => onSelectPlan(plan as "pro" | "ultra")}
                  disabled={loadingPlan !== null}
                  variant={plan === "pro" ? "default" : "secondary"}
                  className="w-full h-8 text-xs font-medium"
                >
                  {loadingPlan === plan ? "Processing..." : `Upgrade to ${plan === "pro" ? "Pro" : "Ultra"}`}
                </Button>
              ) : (
                <Button
                  disabled
                  variant="secondary"
                  className="w-full h-8 text-xs font-medium"
                >
                  Downgrade not available
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
