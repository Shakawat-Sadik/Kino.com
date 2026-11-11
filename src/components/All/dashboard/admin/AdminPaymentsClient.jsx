"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { StatusBadge } from "@/components/All/dashboard/shared/StatusBadge";
import { SpecializedPagination } from "@/components/All/dashboard/shared/SpecializedPagination";
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
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Search,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  X,
} from "lucide-react";

const STATUSES = ["All", "success", "pending", "failed", "refunded"];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-black text-foreground mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-BD", {
    day: "numeric", month: "short", year: "numeric",
  });
};

export function AdminPaymentsClient({
  initialPayments,
  initialTotal,
  initialPage,
  initialSearch,
  initialStatusFilter,
  initialTotalRevenue,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [payments, setPayments] = useState(initialPayments);
  const [total, setTotal] = useState(initialTotal);
  const [totalRevenue, setTotalRevenue] = useState(initialTotalRevenue);
  const [searchInput, setSearchInput] = useState(initialSearch);

  useEffect(() => {
    setPayments(initialPayments);
    setTotal(initialTotal);
    setTotalRevenue(initialTotalRevenue);
    setSearchInput(initialSearch);
  }, [initialPayments, initialTotal, initialTotalRevenue, initialSearch]);

  const pushFilters = (overrides) => {
    const next = {
      page: String(initialPage),
      status: initialStatusFilter,
      search: searchInput,
      ...overrides,
    };
    const sp = new URLSearchParams();
    if (next.page !== "1") sp.set("page", next.page);
    if (next.status !== "All") sp.set("status", next.status);
    if (next.search) sp.set("search", next.search);
    router.push(`?${sp.toString()}`);
  };

  // Debounce search input → URL update
  useEffect(() => {
    const t = setTimeout(() => {
      pushFilters({ search: searchInput, page: "1" });
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const clearFilters = () => {
    setSearchInput("");
    router.push("?");
  };

  const hasFilters = searchInput || initialStatusFilter !== "All";

  const successCount = payments.filter((p) => p.paymentStatus === "success").length;
  const pendingCount = payments.filter((p) => p.paymentStatus === "pending").length;
  const failedCount  = payments.filter((p) => p.paymentStatus === "failed").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Payment Monitoring</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor all platform transactions and revenue activity.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={totalRevenue !== null ? `৳${Number(totalRevenue).toLocaleString()}` : "—"}
          color="bg-chart-3/15 text-chart-3"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Transactions"
          value={total}
          color="bg-chart-1/15 text-chart-1"
        />
        <StatCard
          icon={CheckCircle2}
          label="Successful (page)"
          value={successCount}
          color="bg-chart-2/15 text-chart-2"
        />
        <StatCard
          icon={Clock}
          label="Pending (page)"
          value={pendingCount}
          color="bg-chart-4/15 text-chart-4"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by transaction ID or order ID…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Select
          value={initialStatusFilter}
          onValueChange={(v) => pushFilters({ status: v, page: "1" })}
        >
          <SelectTrigger className="w-44 bg-card shrink-0">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                <span className="capitalize">{s}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground border border-border hover:bg-accent transition-colors shrink-0"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {payments.length === 0 ? (
          <div className="py-20 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {hasFilters ? "Try adjusting your filters" : "No payment records yet"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground pl-5">Transaction ID</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Order ID</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Buyer</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Method</TableHead>
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
                  transition={{ duration: 0.2, delay: i * 0.03 }}
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
                    <div>
                      <p className="text-xs font-semibold text-foreground truncate max-w-32">
                        {payment.buyerInfo?.name || "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-32">
                        {payment.buyerInfo?.email || ""}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-bold text-foreground">
                      ৳{payment.amount?.toLocaleString() ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground capitalize">
                      {payment.paymentMethod || "card"}
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
          page={initialPage}
          total={total}
          limit={12}
          onPageChange={(n) => pushFilters({ page: String(n) })}
        />
      </div>

      {/* Failed count notice */}
      {failedCount > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <XCircle size={15} className="text-destructive shrink-0" />
          <span className="text-destructive font-medium">
            {failedCount} failed transaction{failedCount > 1 ? "s" : ""} on this page.
          </span>
        </div>
      )}
    </div>
  );
}
