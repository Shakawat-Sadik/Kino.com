"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Download,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/ease";
import { toast } from "sonner";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "N/A";

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied to clipboard");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="w-full max-w-lg"
      >
        <div className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-xl shadow-chart-3/5">
          {/* Success header */}
          <div className="relative bg-gradient-to-br from-chart-3/10 via-chart-2/5 to-chart-1/10 p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-chart-3/20 ring-4 ring-chart-3/10"
            >
              <CheckCircle2 size={36} className="text-chart-3" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-black text-foreground tracking-tight"
            >
              Payment Successful!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-sm text-muted-foreground"
            >
              Your order has been placed and the seller has been notified.
            </motion.p>
          </div>

          {/* Order details */}
          <div className="p-8 space-y-5">
            {/* Order ID */}
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Order ID</p>
                <p className="text-sm font-bold text-foreground font-mono mt-0.5">{orderId}</p>
              </div>
              <button
                onClick={copyOrderId}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                <Copy size={13} />
              </button>
            </div>

            {/* Info rows */}
            <div className="space-y-3">
              {[
                { label: "Payment Status", value: "Paid", color: "text-chart-3" },
                { label: "Order Status", value: "Pending", color: "text-chart-4" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Next steps */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-5">
              <p className="text-xs font-bold text-foreground mb-3">What happens next?</p>
              <div className="space-y-3">
                {[
                  "The seller will review and accept your order",
                  "You'll receive a notification when the order is accepted",
                  "Track your order status from the Buyer Dashboard",
                  "Contact the seller if you have any questions",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-chart-3/20 text-[10px] font-bold text-chart-3">
                      {i + 1}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button asChild className="flex-1 h-11 rounded-full gap-2">
                <Link href="/dashboard/buyer/orders">
                  <Package size={14} />
                  View My Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 h-11 rounded-full gap-2">
                <Link href="/products">
                  Continue Shopping <ArrowRight size={14} className="ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}