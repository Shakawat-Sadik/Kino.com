"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { updateOrderStatus } from "@/lib/action/action";
import { StatusBadge } from "@/components/All/dashboard/shared/StatusBadge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Search, X } from "lucide-react";
import { SpecializedPagination } from "@/components/All/dashboard/shared/SpecializedPagination";

const ORDER_STATUSES = [
  "All",
  "pending",
  "accepted",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const UPDATABLE_STATUSES = [
  "pending",
  "accepted",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const formatDate = (val) => {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function AdminOrdersClient({ initialOrders, initialTotal, initialPage, initialStatusFilter }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState(initialOrders);
  const [total, setTotal] = useState(initialTotal);
  const [busy, setBusy] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setOrders(initialOrders);
    setTotal(initialTotal);
    setSearch("");
  }, [initialOrders, initialTotal]);

  const pushFilters = (overrides) => {
    const next = { page: String(initialPage), status: initialStatusFilter, ...overrides };
    const sp = new URLSearchParams();
    if (next.page !== "1") sp.set("page", next.page);
    if (next.status !== "All") sp.set("status", next.status);
    router.push(`?${sp.toString()}`);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setBusy(orderId);
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      toast.success(`Order status updated to "${newStatus}"`);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );
    } else {
      toast.error(res.message || "Failed to update order status");
    }
    setBusy(null);
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.buyerInfo?.name?.toLowerCase().includes(q) ||
      o.sellerInfo?.name?.toLowerCase().includes(q) ||
      o.productTitle?.toLowerCase().includes(q) ||
      o._id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto h-full">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by buyer, seller, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select
          value={initialStatusFilter}
          onValueChange={(val) => pushFilters({ status: val, page: "1" })}
        >
          <SelectTrigger className="w-full sm:w-44 bg-card">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                <span className="capitalize">{s}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No orders found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || initialStatusFilter !== "All"
                ? "Try changing your filters"
                : "No orders placed yet"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground pl-5">
                  Buyer
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Seller
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Product ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Payment
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Order Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground pr-5 text-right">
                  Update Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {filtered.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="border-border"
                  >
                    <TableCell className="pl-5 py-4">
                      <p className="text-sm font-medium text-foreground truncate max-w-30">
                        {order.buyerInfo?.name || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-30">
                        {order.buyerInfo?.email || ""}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground truncate max-w-27.5">
                        {order.sellerInfo?.name || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono text-muted-foreground truncate max-w-35 block">
                        {order.productId || "—"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.orderStatus} />
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Select
                        value={order.orderStatus}
                        onValueChange={(val) => handleStatusChange(order._id, val)}
                        disabled={busy === order._id}
                      >
                        <SelectTrigger className="w-36 h-8 text-xs bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UPDATABLE_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              <span className="capitalize">{s}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}

        <SpecializedPagination
          page={initialPage}
          total={total}
          limit={10}
          onPageChange={(n) => pushFilters({ page: String(n) })}
        />
      </div>
    </div>
  );
}
