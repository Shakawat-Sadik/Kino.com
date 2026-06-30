import { getTotalUsers, getTotalProducts, getTotalOrders } from "@/lib/action/action";
import { AdminStatCard } from "./AdminStatCard";

/**
 * AdminOverview — Server Component
 *
 * Fires three parallel data fetches and renders the stat cards.
 * Each card gets its own Suspense boundary in the page so one
 * slow fetch doesn't block the others from rendering.
 */
export async function AdminOverview() {
  // Parallel fetch — all three resolve together
  const [usersRes, productsRes, ordersRes] = await Promise.all([
    getTotalUsers(),
    getTotalProducts(),
    getTotalOrders(),
  ]);

  const stats = [
    {
      title: "Total Users",
      value: usersRes.success ? usersRes.result?.total : null,
      icon: "Users",
      color: { bg: "bg-blue-500/10", text: "text-blue-500" },
      error: !usersRes.success,
    },
    {
      title: "Total Products",
      value: productsRes.success ? productsRes.result?.total : null,
      icon: "Package",
      color: { bg: "bg-amber-500/10", text: "text-amber-500" },
      error: !productsRes.success,
    },
    {
      title: "Total Orders",
      value: ordersRes.success ? ordersRes.result?.total : null,
      icon: "ShoppingCart",
      color: { bg: "bg-primary/10", text: "text-primary" },
      error: !ordersRes.success,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <AdminStatCard
          key={stat.title}
          title={stat.title}
          value={stat.error ? 0 : stat.value}
          icon={stat.icon}
          color={stat.color}
          index={index}
        />
      ))}
    </div>
  );
}

/**
 * AdminOverviewSkeleton
 * Shown via Suspense fallback while AdminOverview is fetching
 */
export function AdminOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <AdminStatCard
          key={i}
          title="Loading..."
          value={null}
          icon={null}
          loading={true}
          index={i}
        />
      ))}
    </div>
  );
}
