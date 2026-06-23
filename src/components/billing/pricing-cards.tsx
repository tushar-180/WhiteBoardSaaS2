"use client";

import { Check, Sparkles, Crown, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_PRICES_INR, type PlanType } from "@/types/billing";
import { cn } from "@/lib/utils";

interface PricingCardsProps {
  currentPlan: PlanType;
  onSelectPlan: (plan: "pro" | "ultra") => void;
  isLoading?: boolean;
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
      "Real-time collaboration",
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
    description: "For power users and large teams",
    features: [
      "Unlimited workspaces",
      "Unlimited boards",
      "Unlimited team members",
      "All Pro features",
      "Dedicated support",
    ],
  },
};

export function PricingCards({ currentPlan, onSelectPlan, isLoading }: PricingCardsProps) {
  const plans: PlanType[] = ["free", "pro", "ultra"];

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto">
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
              "relative rounded-2xl border p-5 sm:p-6 flex flex-col transition-all duration-200",
              plan === "pro"
                ? "border-indigo-500/40 bg-card shadow-md ring-1 ring-indigo-500/20 scale-[1.02] sm:scale-105"
                : "border-border/60 bg-card shadow-sm hover:shadow-md",
            )}
          >
            {details.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 text-[10px] font-bold rounded-full whitespace-nowrap">
                {details.highlight}
              </div>
            )}

            <div className="flex items-center gap-2.5 mb-3">
              <div className={cn(
                "p-2 rounded-lg",
                plan === "free" && "bg-muted",
                plan === "pro" && "bg-indigo-500/10 text-indigo-500",
                plan === "ultra" && "bg-amber-500/10 text-amber-500",
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold capitalize">{plan}</h3>
            </div>

            <p className="text-xs text-muted-foreground mb-4">{details.description}</p>

            <div className="mb-5">
              {price ? (
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-extrabold">₹{price}</span>
                  <span className="text-xs text-muted-foreground">/month</span>
                </div>
              ) : (
                <span className="text-2xl font-extrabold">Free</span>
              )}
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {details.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs">
                  <Check className={cn(
                    "h-3.5 w-3.5 mt-0.5 shrink-0",
                    isCurrentPlan ? "text-emerald-500" : "text-muted-foreground/60"
                  )} />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {isCurrentPlan ? (
              <Button
                disabled
                variant={plan === "free" ? "secondary" : "outline"}
                className="w-full rounded-xl text-xs"
              >
                Current Plan
              </Button>
            ) : plan !== "free" ? (
              <Button
                onClick={() => onSelectPlan(plan as "pro" | "ultra")}
                disabled={isLoading}
                className={cn(
                  "w-full rounded-xl text-xs font-semibold",
                  plan === "pro" && "bg-indigo-600 hover:bg-indigo-700 text-white",
                  plan === "ultra" && "bg-amber-600 hover:bg-amber-700 text-white",
                )}
              >
                {isLoading ? "Processing..." : `Upgrade to ${plan === "pro" ? "Pro" : "Ultra"}`}
              </Button>
            ) : (
              <Button
                disabled
                variant="secondary"
                className="w-full rounded-xl text-xs"
              >
                Downgrade not available
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
