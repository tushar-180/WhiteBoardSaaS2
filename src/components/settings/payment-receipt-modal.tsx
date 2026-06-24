"use client";

import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export type Payment = {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  plan_type: string;
  status: string;
  provider_order_id: string;
  provider_payment_id?: string | null;
};

export function PaymentReceiptModal({ payment }: { payment: Payment }) {
  const handlePrint = () => {
    const printContent = document.getElementById("receipt-content");
    if (!printContent) return;

    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Copy all styles from the current document so Tailwind classes work
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join("");

    iframeDoc.head.innerHTML = `
      <title>Payment Receipt</title>
      ${styles}
      <style>
        @media print {
          @page { margin: 0; }
          body { 
            padding: 40px; 
            background: white !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }
          #receipt-content { 
            margin: 0 auto; 
            border: 1px solid #e2e8f0 !important; 
            border-radius: 12px; 
            background: white !important; 
            color: black !important; 
            box-shadow: none !important;
          }
          .print-hidden { display: none !important; }
          .text-muted-foreground { color: #64748b !important; }
          .text-foreground { color: #0f172a !important; }
          .bg-muted\\/30 { background-color: #f8fafc !important; }
          .bg-muted\\/10 { background-color: #f1f5f9 !important; }
          .bg-muted { background-color: #f1f5f9 !important; }
          .border-border\\/50, .border-border\\/60 { border-color: #e2e8f0 !important; }
        }
      </style>
    `;
    iframeDoc.body.innerHTML = printContent.outerHTML;

    // Wait a brief moment for styles to apply, then print
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Cleanup after print dialog closes
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-muted-foreground hover:text-foreground">
          <Receipt className="h-3.5 w-3.5" />
          <span className="sr-only">View Receipt</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-border/60 shadow-xl">
        <DialogDescription className="sr-only">Detailed view of your payment receipt.</DialogDescription>
        <div id="receipt-content" className="bg-card text-card-foreground">
          {/* Receipt Header */}
          <div className="bg-muted/30 p-8 flex flex-col items-center justify-center border-b border-border/50 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <span className="font-black tracking-tight text-xl text-foreground">
                Zentrox
              </span>
            </div>

            <DialogTitle className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2">Payment Receipt</DialogTitle>
            <div className="text-4xl font-extrabold tracking-tight mb-3">₹{(payment.amount / 100).toFixed(2)}</div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              payment.status === 'paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
              payment.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
              'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
            }`}>
              {payment.status}
            </span>
          </div>

          {/* Receipt Body */}
          <div className="p-6 sm:p-8 space-y-1">
            <div className="flex justify-between items-center py-3 border-b border-dashed border-border/60">
              <span className="text-muted-foreground text-sm font-medium">Date & Time</span>
              <span className="font-semibold text-sm text-right">{formatDateTime(payment.created_at)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-dashed border-border/60">
              <span className="text-muted-foreground text-sm font-medium">Subscription</span>
              <span className="font-semibold text-sm capitalize">{payment.plan_type} Plan</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-dashed border-border/60 gap-1 sm:gap-0">
              <span className="text-muted-foreground text-sm font-medium">Order ID</span>
              <span className="font-mono text-[11px] text-foreground bg-muted px-2 py-1 rounded-md">{payment.provider_order_id}</span>
            </div>

            {payment.provider_payment_id && (
              <div className="flex flex-col sm:flex-row justify-between sm:items-center py-3 border-b border-dashed border-border/60 gap-1 sm:gap-0">
                <span className="text-muted-foreground text-sm font-medium">Transaction ID</span>
                <span className="font-mono text-[11px] text-foreground bg-muted px-2 py-1 rounded-md">{payment.provider_payment_id}</span>
              </div>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="bg-muted/10 px-6 py-6 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground mb-5 max-w-[250px]">
              If you have any questions about this receipt, please contact our support team.
            </p>
            <Button className="w-full print-hidden shadow-xs hover:shadow-sm transition-all" onClick={handlePrint}>
              Print or Save as PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
