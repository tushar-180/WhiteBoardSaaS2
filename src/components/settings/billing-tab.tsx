"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PricingCards } from "@/components/billing/pricing-cards";
import { getUserSubscriptionAction, cancelSubscriptionAction, getUserPaymentsAction } from "@/actions/settings";
import { useRazorpay } from "@/hooks/use-razorpay";
import { type PlanType, PLAN_LIMITS } from "@/types/billing";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentReceiptModal, type Payment } from "./payment-receipt-modal";


let cachedSubscription: {
  plan_type: PlanType;
  status: string;
  current_period_end: string | null;
} | null = null;
let cachedPayments: Payment[] | null = null;
let hasFetchedSubscription = false;

export function invalidateSubscriptionCache() {
  hasFetchedSubscription = false;
  cachedPayments = null;
}

export function BillingSettings() {
  const router = useRouter();
  const [subscription, setSubscription] = useState(cachedSubscription);
  const [payments, setPayments] = useState<Payment[]>(cachedPayments || []);
  const [isLoading, setIsLoading] = useState(!hasFetchedSubscription);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const fetchedRef = useRef(false);
  const { openRazorpay, isProcessing } = useRazorpay();

  const fetchSubscription = useCallback(async () => {
    if (hasFetchedSubscription) {
      setIsLoading(false);
      return;
    }
    try {
      const [subData, paymentsData] = await Promise.all([
        getUserSubscriptionAction(),
        getUserPaymentsAction()
      ]);
      cachedSubscription = subData as typeof subscription;
      cachedPayments = paymentsData as Payment[];
      hasFetchedSubscription = true;
      setSubscription(cachedSubscription);
      setPayments(cachedPayments);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current && !hasFetchedSubscription) {
      fetchedRef.current = true;
      fetchSubscription();
    }
  }, [fetchSubscription]);

  const handleCancelSubscription = async () => {
    setShowCancelConfirm(false);
    setIsCanceling(true);
    try {
      await cancelSubscriptionAction();
      toast.success("Subscription cancelled. You've been downgraded to Free.");
      hasFetchedSubscription = false; // Force refresh next time
      await fetchSubscription();
      router.refresh();
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to cancel subscription.");
    } finally {
      setIsCanceling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPlan = (subscription?.plan_type as PlanType) || "free";
  const isActive = subscription?.status === "active";
  const planLimits = PLAN_LIMITS[currentPlan];

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col flex-1 space-y-4 md:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Plan & Billing</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your subscription and usage limits.
          </p>
        </div>

        {/* Transaction History Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 shadow-xs shrink-0 whitespace-nowrap">
              <Receipt className="w-4 h-4 hidden sm:inline" />
              History
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col sm:max-w-3xl p-0">
            <DialogHeader className="p-5 pb-4 border-b border-border/50 shrink-0">
              <DialogTitle className="text-lg">Transaction History</DialogTitle>
              <DialogDescription>
                View your past payments and invoices.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-auto min-h-0 min-w-0 bg-muted/10">
              {payments.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No transactions found.
                </div>
              ) : (
                <table className="w-full text-left text-xs sm:text-sm relative">
                  <thead className="bg-muted/90 text-muted-foreground sticky top-0 z-10 backdrop-blur-md shadow-xs">
                    <tr>
                      <th className="px-2 py-3 sm:p-4 font-medium whitespace-normal sm:whitespace-nowrap border-b border-border">Date</th>
                      <th className="px-2 py-3 sm:p-4 font-medium border-b border-border">Plan</th>
                      <th className="px-2 py-3 sm:p-4 font-medium border-b border-border">Amount</th>
                      <th className="px-2 py-3 sm:p-4 font-medium border-b border-border">Status</th>
                      <th className="px-2 py-3 sm:p-4 font-medium border-b border-border text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-2 py-3 sm:p-4 whitespace-normal sm:whitespace-nowrap text-foreground">
                          {formatDateTime(payment.created_at)}
                        </td>
                        <td className="px-2 py-3 sm:p-4 capitalize font-medium">
                          {payment.plan_type}
                        </td>
                        <td className="px-2 py-3 sm:p-4 font-medium">
                          ₹{payment.amount / 100}
                        </td>
                        <td className="px-2 py-3 sm:p-4">
                          <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                            payment.status === 'paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            payment.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                            'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          {payment.status === 'paid' ? (
                            <PaymentReceiptModal payment={payment} />
                          ) : (
                            <div className="h-7 w-7 inline-flex items-center justify-center text-muted-foreground">
                              -
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Plan Overview */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold capitalize">{currentPlan} Plan</span>
              {isActive ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              ) : currentPlan !== "free" ? (
                <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
                  <AlertCircle className="h-3 w-3" /> Expired
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentPlan === "free" ? "Free forever" : currentPlan === "pro" ? "₹499/mo" : "₹1499/mo"}
              {subscription?.current_period_end && ` • Renews ${formatDate(subscription.current_period_end)}`}
            </div>
          </div>

          <div className="flex items-center divide-x divide-border mt-4 sm:mt-0 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <div className="flex flex-col pr-3 sm:pr-5 shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Workspaces</span>
              <span className="text-foreground font-medium text-sm sm:text-base mt-0.5">{planLimits.workspaces === -1 ? "Unlimited" : planLimits.workspaces}</span>
            </div>
            <div className="flex flex-col px-3 sm:px-5 shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Boards / WS</span>
              <span className="text-foreground font-medium text-sm sm:text-base mt-0.5">{planLimits.boards === -1 ? "Unlimited" : planLimits.boards}</span>
            </div>
            <div className="flex flex-col pl-3 sm:pl-5 shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Members</span>
              <span className="text-foreground font-medium text-sm sm:text-base mt-0.5">{planLimits.members === -1 ? "Unlimited" : planLimits.members}</span>
            </div>
          </div>
        </div>

        {/* Cancel subscription button — only for active paid plans */}
        {currentPlan !== "free" && isActive && (
          <div className="border-t border-border/40 mt-4 pt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelConfirm(true)}
              disabled={isCanceling}
              className="text-xs text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950/30"
            >
              {isCanceling ? (
                <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Cancelling...</>
              ) : (
                "Cancel Subscription"
              )}
            </Button>
          </div>
        )}
      </div>

      <PricingCards
        currentPlan={currentPlan}
        onSelectPlan={openRazorpay}
        isLoading={isProcessing}
      />



      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Cancel Subscription"
        description="Are you sure you want to cancel? You'll lose access to Pro/Ultra features and be downgraded to the Free plan immediately. Your workspaces and boards will remain intact but will be subject to Free plan limits."
        confirmText="Cancel Subscription"
        onConfirm={handleCancelSubscription}
        variant="destructive"
        loading={isCanceling}
      />
    </div>
  );
}
