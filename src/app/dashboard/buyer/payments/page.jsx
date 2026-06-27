"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getMyPayments } from "@/lib/action/action";
import { StatusBadge } from "@/components/All/dashboard/shared/StatusBadge";
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
import { CreditCard } from "lucide-react";
import { SpecializedPagination } from "@/components/All/dashboard/shared/SpecializedPagination";

const PAYMENT_STATUSES = ["All", "success", "pending", "failed", "refunded"];
const PAGE_LIMIT = 10;

export default function BuyerPaymentsPage() {
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
