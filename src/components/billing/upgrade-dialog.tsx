"use client";

import { useEffect } from "react";
import { useRazorpay } from "@/hooks/use-razorpay";
import { PricingCards } from "./pricing-cards";
import { type PlanType } from "@/types/billing";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: PlanType;
  limitType: "workspace" | "board" | "member";
}

export function UpgradeDialog({ open, onOpenChange, currentPlan, limitType }: UpgradeDialogProps) {
  const { openRazorpay, isProcessing } = useRazorpay();

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const limitLabels: Record<string, string> = {
    workspace: "workspaces",
    board: "boards",
    member: "members",
  };

  const handleUpgrade = async (plan: "pro" | "ultra") => {
    // Close dialog before opening Razorpay to avoid click trap issues
    onOpenChange(false);
    // Wait for React commit phase before opening Razorpay
    await new Promise((resolve) => setTimeout(resolve, 0));
    openRazorpay(plan);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onKeyDown={(e) => e.key === "Escape" && onOpenChange(false)}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />

      {/* Content */}
      <div className="relative bg-background rounded-xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 mx-4">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">
            Upgrade your plan
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;ve reached the {currentPlan === "free" ? "Free" : currentPlan === "pro" ? "Pro" : "Ultra"} plan limit for{" "}
            <span className="font-semibold text-foreground">{limitLabels[limitType]}</span>.
            Upgrade to unlock more.
          </p>
        </div>

        <PricingCards
          currentPlan={currentPlan}
          onSelectPlan={handleUpgrade}
          isLoading={isProcessing}
        />
      </div>
    </div>
  );
}
