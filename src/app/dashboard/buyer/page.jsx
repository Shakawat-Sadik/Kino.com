// app/dashboard/buyer/page.jsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { ShoppingCart, Heart, Package } from "lucide-react";
import { getBuyerStats, getMyOrders } from "@/lib/action/action";
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
async function BuyerStats() {
  const res = await getBuyerStats();
  const stats = res.success ? res.result : {};

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders ?? 0,
      icon: <ShoppingCart className="h-5 w-5 text-blue-500" />,
      color: { bg: "bg-blue-500/10" },
    },
    {
      title: "Wishlist Items",
      value: stats.wishlistCount ?? 0,
      icon: <Heart className="h-5 w-5 text-rose-500" />,
      color: { bg: "bg-rose-500/10" },
    },
    {
      title: "Recent Purchases",
      value: stats.recentPurchases?.length ?? 0,
      icon: <Package className="h-5 w-5 text-primary" />,
      color: { bg: "bg-primary/10" },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <DashStatCard key={card.title} {...card} index={i} />
      ))}
    </div>
  );
}

// ── Recent orders table ───────────────────────────────────────
async function RecentOrders() {
  const res = await getMyOrders({ limit: 5 });
  const orders = res.success ? res.result : [];

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your latest 5 orders</p>
        </div>
        <Link
          href="/dashboard/buyer/orders"
          className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-10 text-center">
          <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No orders yet</p>
          <Link
            href="/products"
            className="text-xs text-primary font-semibold mt-1 inline-block hover:underline"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground pl-0">Product</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Amount</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id} className="border-border">
                <TableCell className="pl-0 py-3">
                  <p className="text-sm font-medium text-foreground truncate max-w-[160px]">
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
                <TableCell>
                  <StatusBadge status={order.paymentStatus} />
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
export default function BuyerDashboardPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Suspense fallback={<DashStatCardSkeleton count={3} />}>
        <BuyerStats />
      </Suspense>

      <Suspense fallback={
        <div className="bg-card border border-border rounded-2xl p-5 h-48 animate-pulse" />
      }>
        <RecentOrders />
      </Suspense>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: "/dashboard/buyer/orders", label: "My Orders", desc: "Track and manage your orders" },
          { href: "/dashboard/buyer/wishlist", label: "Wishlist", desc: "Products you saved for later" },
          { href: "/dashboard/buyer/payments", label: "Payment History", desc: "View all transactions" },
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
