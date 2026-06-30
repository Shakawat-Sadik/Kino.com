"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getSellerOrders, updateSellerOrderStatus } from "@/lib/action/action";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, X } from "lucide-react";

// Status flow — what action is available per current status
const NEXT_STATUS = {
  pending:    { label: "Accept",   next: "accepted",   variant: "default" },
  accepted:   { label: "Process",  next: "processing", variant: "default" },
  processing: { label: "Ship",     next: "shipped",    variant: "default" },
  shipped:    { label: "Deliver",  next: "delivered",  variant: "default" },
};

const REJECT_ELIGIBLE = ["pending", "accepted"];
const ORDER_STATUSES = ["All", "pending", "accepted", "processing", "shipped", "delivered", "cancelled"];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const query = {};
    if (statusFilter !== "All") query.status = statusFilter;
    if (search) query.search = search;
    const res = await getSellerOrders(query);
    setOrders(res.success ? res.result : []);
    setLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(`${orderId}-${newStatus}`);
    const res = await updateSellerOrderStatus(orderId, newStatus);
    if (res.success) {
      toast.success(`Order marked as ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );
    } else {
      toast.error(res.message || "Failed to update order");
    }
    setUpdating(null);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by buyer name or email..."
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-card">
            <SelectValue placeholder="Filter by status" />
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

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No orders found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {statusFilter !== "All" || search ? "Try changing your filters" : "You haven't received any orders yet"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground pl-5">Buyer</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Product</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {orders.map((order, i) => {
                  const nextStep = NEXT_STATUS[order.orderStatus];
                  const canReject = REJECT_ELIGIBLE.includes(order.orderStatus);
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className="border-border"
                    >
                      <TableCell className="pl-5 py-4">
                        <p className="text-sm font-medium text-foreground truncate max-w-[130px]">
                          {order.buyerInfo?.name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[130px]">
                          {order.buyerInfo?.email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground truncate max-w-[150px]">
                          {order.productTitle || order.productId}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          ৳{order.totalAmount?.toLocaleString() ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.orderStatus} />
                      </TableCell>
                      <TableCell className="pr-5">
                        <div className="flex items-center gap-2">
                          {nextStep && (
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={() => handleStatusUpdate(order._id, nextStep.next)}
                              disabled={!!updating}
                            >
                              {updating === `${order._id}-${nextStep.next}`
                                ? "Updating..."
                                : nextStep.label}
                            </Button>
                          )}
                          {canReject && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-red-500 border-red-500/30 hover:bg-red-500/10"
                              onClick={() => handleStatusUpdate(order._id, "cancelled")}
                              disabled={!!updating}
                            >
                              Reject
                            </Button>
                          )}
                          {!nextStep && !canReject && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
