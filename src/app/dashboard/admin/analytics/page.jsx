import { getAdminAnalytics } from "@/lib/action/action";
import { AdminCharts, AdminChartsSkeleton } from "@/components/All/dashboard/admin/AdminCharts";
import { BarChart3 } from "lucide-react";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function AnalyticsCharts() {
  const res = await getAdminAnalytics();
  const analytics = res.success ? res.result : null;
  return <AdminCharts analytics={analytics} />;
}

export default async function AdminAnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          "Monthly Orders",
          "User Role Distribution",
          "Category Performance",
          "Revenue by Month",
        ].map((label) => (
          <span
            key={label}
            className="text-xs font-medium px-3 py-1 rounded-full bg-accent text-accent-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Charts */}
      <Suspense fallback={<AdminChartsSkeleton />}>
        <AnalyticsCharts />
      </Suspense>
    </div>
  );
}
