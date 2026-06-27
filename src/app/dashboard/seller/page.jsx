// app/dashboard/seller/page.jsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Package, TrendingUp, BanknoteArrowUp, Clock } from "lucide-react";
import { getSellerStats, getSellerOrders } from "@/lib/action/action";
import { DashStatCard, DashStatCardSkeleton } from "@/components/All/dashboard/shared/DashStatCard";
import { StatusBadge } from "@/components/All/dashboard/shared/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// ── Stat cards ────────────────────────────────────────────────
async function SellerStats() {
  const res = await getSellerStats();
  const stats = res.success ? res.result : {};

  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts ?? 0,
      icon: <Package className="h-5 w-5 text-blue-500" />,
      color: { bg: "bg-blue-500/10" },
    },
    {
      title: "Total Sales",
      value: stats.totalSales ?? 0,
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      color: { bg: "bg-green-500/10" },
    },
    {
      title: "Total Revenue",
      value: stats.totalRevenue ? `৳${Number(stats.totalRevenue).toLocaleString()}` : "৳0",
      icon: <BanknoteArrowUp className="h-5 w-5 text-primary" />,
      color: { bg: "bg-primary/10" },
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders ?? 0,
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      color: { bg: "bg-yellow-500/10" },
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <DashStatCard key={card.title} {...card} index={i} />
      ))}
    </div>
  );
}

// ── Pending orders requiring action ──────────────────────────
async function PendingOrdersPreview() {
  const res = await getSellerOrders({ status: "pending", limit: 5 });
  const orders = res.success ? res.result : [];

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Pending Orders</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Orders waiting for your action</p>
        </div>
        <Link
          href="/dashboard/seller/orders"
          className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline"
        >
          Manage all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No pending orders — you're all caught up!
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground pl-0">Buyer</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Product</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Amount</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id} className="border-border">
                <TableCell className="pl-0 py-3">
                  <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                    {order.buyerInfo?.name || "—"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground truncate max-w-[140px]">
                    {order.productTitle || order.productId}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold">
                    ৳{order.amount?.toLocaleString() ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.orderStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function SellerDashboardPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Suspense fallback={<DashStatCardSkeleton count={4} />}>
        <SellerStats />
      </Suspense>

      <Suspense fallback={
        <div className="bg-card border border-border rounded-2xl p-5 h-48 animate-pulse" />
      }>
        <PendingOrdersPreview />
      </Suspense>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: "/dashboard/seller/products/add", label: "Add Product", desc: "List a new item for sale" },
          { href: "/dashboard/seller/products", label: "My Products", desc: "View and manage your listings" },
          { href: "/dashboard/seller/orders", label: "Manage Orders", desc: "Accept, process and ship orders" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-4 bg-card border border-border rounded-2xl hover:bg-accent transition-colors group"
          >
            <p className="text-sm font-semibold text-primary group-hover:underline">
              {item.label} →
            </p>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
