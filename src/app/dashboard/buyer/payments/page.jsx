"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { getMyPayments } from "@/lib/action/action";
import { StatusBadge } from "@/components/All/dashboard/shared/StatusBadge";
import { CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, ShoppingBag, ListOrdered, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SpecializedPagination } from "@/components/All/dashboard/shared/SpecializedPagination";

const PAYMENT_STATUSES = ["All", "success", "pending", "failed", "refunded"];
const PAGE_LIMIT = 10;

export default function BuyerPaymentsPage() {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("success") === "true";
  const successOrderId = searchParams.get("orderId");
  const successTransactionId = searchParams.get("transactionId");
  const successAmount = searchParams.get("amount");
  const successProductTitle = searchParams.get("productTitle");
  const successDate = paymentSuccess ? new Date().toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" }) : null;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const query = { page, limit: PAGE_LIMIT };
      if (statusFilter !== "All") query.status = statusFilter;
      const res = await getMyPayments(query);
      setPayments(res.success ? res.result : []);
      setTotal(res.total ?? 0);
      setLoading(false);
    };
    load();
  }, [page, statusFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Payment success card */}
      {paymentSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl border border-green-500/30 bg-green-500/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-green-500/20">
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-700 dark:text-green-400">Payment Successful!</p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                Your order has been placed. The seller will confirm shortly.
              </p>
            </div>
          </div>

          {/* Order summary */}
          <div className="px-5 py-4 space-y-2.5">
            {successProductTitle && (
              <div className="flex justify-between items-start text-xs">
                <span className="text-muted-foreground">Product</span>
                <span className="font-semibold text-foreground text-right max-w-[60%] truncate">
                  {decodeURIComponent(successProductTitle)}
                </span>
              </div>
            )}
            {successAmount && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-foreground text-base">
                  ৳{Number(successAmount).toLocaleString()}
                </span>
              </div>
            )}
            {successTransactionId && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Transaction ID</span>
                <code className="font-mono bg-green-500/10 px-1.5 py-0.5 rounded text-green-700 dark:text-green-400 text-[11px]">
                  {successTransactionId}
                </code>
              </div>
            )}
            {successOrderId && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Order ID</span>
                <code className="font-mono text-muted-foreground text-[11px]">{successOrderId}</code>
              </div>
            )}
            {successDate && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Payment Date</span>
                <span className="text-foreground">{successDate}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 px-5 pb-5">
            <Link
              href="/dashboard/buyer/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <ListOrdered className="h-3.5 w-3.5" />
              View My Orders
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-500/10 transition-colors"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Continue Shopping
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Filter */}
      <div className="flex justify-end">
        <Select value={statusFilter} onValueChange={(val) => { setPage(1); setStatusFilter(val); }}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                <span className="capitalize">{s}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-full rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {statusFilter !== "All" ? "Try clearing the filter" : "You have no payment records yet"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground pl-5">Transaction ID</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Order ID</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment, i) => (
                <motion.tr
                  key={payment._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className="border-border"
                >
                  <TableCell className="pl-5 py-4">
                    <code className="text-xs font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                      {payment.transactionId || "—"}
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono text-muted-foreground">
                      {payment.orderId || "—"}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold">
                      ৳{payment.amount?.toLocaleString() ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(payment.paymentDate || payment.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5">
                    <StatusBadge status={payment.paymentStatus} />
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
        <SpecializedPagination
          page={page}
          total={total}
          limit={PAGE_LIMIT}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
