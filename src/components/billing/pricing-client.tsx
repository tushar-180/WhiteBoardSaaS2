"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRazorpay } from "@/hooks/use-razorpay";
import { PricingCards } from "./pricing-cards";
import { getUserSubscriptionAction } from "@/actions/settings";
import { ROUTES } from "@/lib/constants";
import type { PlanType } from "@/types/billing";

interface PricingPageClientProps {
  isLoggedIn: boolean;
}

export function PricingPageClient({ isLoggedIn }: PricingPageClientProps) {
  const router = useRouter();
  const { openRazorpay, processingPlan } = useRazorpay();
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");

  // Fetch current plan if logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    getUserSubscriptionAction()
      .then((sub) => setCurrentPlan((sub.plan_type as PlanType) || "free"))
      .catch(() => setCurrentPlan("free"));
  }, [isLoggedIn]);

  const handleSelectPlan = (plan: "pro" | "ultra") => {
    if (!isLoggedIn) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // If user is already on this plan, do nothing
    if (currentPlan === plan) {
      return;
    }

    openRazorpay(plan);
  };

  return (
    <PricingCards
      currentPlan={currentPlan}
      onSelectPlan={handleSelectPlan}
      loadingPlan={processingPlan}
    />
  );
}
