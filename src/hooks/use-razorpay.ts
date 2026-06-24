"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BillingPlan } from "@/types/billing";
import { useSettingsStore } from "@/store/settings-store";
import { invalidateSubscriptionCache } from "@/components/settings/billing-tab";

// Shared Razorpay global type declaration
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function hasRazorpay(): boolean {
  return typeof window !== "undefined" && typeof window.Razorpay !== "undefined";
}

async function loadRazorpayScript(): Promise<boolean> {
  if (hasRazorpay()) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const router = useRouter();
  const setIsOpen = useSettingsStore((state) => state.setIsOpen);
  const isProcessingRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<BillingPlan | null>(null);

  const openRazorpay = useCallback(async (plan: BillingPlan) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);
    setProcessingPlan(plan);

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        isProcessingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // 2. Create order via our API
      const res = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_type: plan }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || "Failed to create order.");
      }

      // 3. Open Razorpay checkout directly - no dialog wrapper to interfere
      const razorpay = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: `Zentrox - ${plan === "pro" ? "Pro" : "Ultra"} Plan`,
        description: `Upgrade to ${plan === "pro" ? "Pro" : "Ultra"}`,
        image: `${window.location.origin}/logo.png`,
        order_id: orderData.order_id,
        prefill: { contact: "" },
        theme: {
          color: "#6366f1", // Matches the primary indigo brand color
          backdrop_color: "#020817" // Adds a sleek dark backdrop behind the popup
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyRes = await fetch("/api/billing/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            toast.success(`Successfully upgraded to ${plan === "pro" ? "Pro" : "Ultra"}!`);
            
            invalidateSubscriptionCache();
            setIsOpen(false);
            router.refresh();
          } catch (err) {
            toast.error((err as Error).message || "Payment verification failed. Contact support.");
          } finally {
            isProcessingRef.current = false;
            setIsProcessing(false);
            setProcessingPlan(null);
          }
        },
        modal: {
          ondismiss: function () {
            isProcessingRef.current = false;
            setIsProcessing(false);
            setProcessingPlan(null);
          },
        },
      });

      razorpay.open();
    } catch (error: unknown) {
      isProcessingRef.current = false;
      toast.error((error as Error).message || "Something went wrong.");
      setIsProcessing(false);
      setProcessingPlan(null);
    }
  }, [router, setIsOpen]);

  return { openRazorpay, isProcessing, processingPlan };
}
