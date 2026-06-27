import { Suspense } from "react";
import { AdminOverview, AdminOverviewSkeleton } from "@/components/All/dashboard/admin/AdminOverview";
import { AdminCharts, AdminChartsSkeleton } from "@/components/All/dashboard/admin/AdminCharts";
import { AdminRecentActivity, AdminRecentActivitySkeleton } from "@/components/All/dashboard/admin/AdminRecentActivity";
import { getAdminAnalytics, getAdminUsers, getAdminOrders } from "@/lib/action/action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
/**
 * Admin Dashboard Page — Server Component
 *
 * Architecture:
 *   - Server-side auth enforces admin-only access
 *   - Each section has its own Suspense boundary so one slow
 *     fetch doesn't block the rest of the page from rendering
 *   - Analytics data is fetched at page level and passed as
 *     props to AdminCharts (client component can't call server actions directly)
 */
export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  // Fetch analytics, users, and orders at page level — passed as props to client components
  const [analyticsRes, usersRes, ordersRes, paymentsRes] = await Promise.all([
    getAdminAnalytics(),
    getAdminUsers({ limit: 5 }),
    getAdminOrders({ limit: 5 }),
    // getAdminPayments({ limit: 5 }),
  ]);
  console.log("AdminDashboardPage analyticsRes:", analyticsRes); // Debugging: Log the analytics response

  const analytics = analyticsRes.success ? analyticsRes.result : null;
  const users = usersRes.success ? usersRes.result : [];
  const orders = ordersRes.success ? ordersRes.result : [];
  // const payments = paymentsRes.success ? paymentsRes.result : [];

  console.log("AdminDashboardPage fetch results:", {
    analyticsRes,
    usersRes,
    ordersRes,
  }); // Debugging: Log the fetch results

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Stat cards ── */}
      <Suspense fallback={<AdminOverviewSkeleton />}>
        <AdminOverview />
      </Suspense>

      {/* ── Charts ── */}
      <Suspense fallback={<AdminChartsSkeleton />}>
        <AdminCharts analytics={analytics} />
      </Suspense>

      {/* ── Recent activity tables ── */}
      <Suspense fallback={<AdminRecentActivitySkeleton />}>
        <AdminRecentActivity users={users} orders={orders} />
        {/* <AdminRecentActivity users={users} orders={orders} payments={payments} /> */}
      </Suspense>

      {/* ── Quick action links ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Manage Users",
            description: "View, block, or delete user accounts",
            href: "/dashboard/admin/users",
            color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          },
          {
            label: "Manage Products",
            description: "Approve, reject, or remove product listings",
            href: "/dashboard/admin/products",
            color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          },
          {
            label: "Manage Orders",
            description: "Monitor all orders and resolve disputes",
            href: "/dashboard/admin/orders",
            color: "bg-primary/10 text-primary border-primary/20",
          },
        ].map((action) => (
          <a
            key={action.href}
            href={action.href}
            className={`block p-4 rounded-2xl border bg-card hover:bg-accent transition-colors group ${action.color.split(" ").slice(-1)[0]}`}
          >
            <p className={`text-sm font-semibold ${action.color.split(" ").slice(0, 2).join(" ")}`}>
              {action.label} →
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {action.description}
            </p>
          </a>
        ))}
      </div>

    </div>
  );
}
