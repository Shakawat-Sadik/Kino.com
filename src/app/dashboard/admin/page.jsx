import { Suspense } from "react";
import { AdminOverview, AdminOverviewSkeleton } from "@/components/All/dashboard/admin/AdminOverview";
import { AdminCharts, AdminChartsSkeleton } from "@/components/All/dashboard/admin/AdminCharts";
import { AdminRecentActivity, AdminRecentActivitySkeleton } from "@/components/All/dashboard/admin/AdminRecentActivity";
import { RoleGuard } from "@/components/All/auth/RoleGuard";
import { ShieldCheck } from "lucide-react";
import { getAdminAnalytics } from "@/lib/action/action";
/**
 * Admin Dashboard Page — Server Component
 *
 * Architecture:
 *   - RoleGuard enforces admin-only access
 *   - Each section has its own Suspense boundary so one slow
 *     fetch doesn't block the rest of the page from rendering
 *   - Analytics data is fetched at page level and passed as
 *     props to AdminCharts (client component can't call server actions directly)
 */
export default async function AdminDashboardPage() {
  // Fetch analytics at page level — passed as prop to client component
  const analyticsRes = await getAdminAnalytics();
  const analytics = analyticsRes.success ? analyticsRes.result : null;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* ── Page heading ── */}
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-xl">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Platform overview and management
            </p>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <Suspense fallback={<AdminOverviewSkeleton />}>
          <AdminOverview />
        </Suspense>

        {/* ── Charts ── */}
        {analytics ? (
          <AdminCharts analytics={analytics} />
        ) : (
          <AdminChartsSkeleton />
        )}

        {/* ── Recent activity tables ── */}
        <Suspense fallback={<AdminRecentActivitySkeleton />}>
          <AdminRecentActivity />
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
    </RoleGuard>
  );
}
