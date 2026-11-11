import { getAdminOrders } from "@/lib/action/action";
import { AdminOrdersClient } from "@/components/All/dashboard/admin/AdminOrdersClient";

const PAGE_LIMIT = 10;

export default async function AdminOrdersPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const statusFilter = params.status ?? "All";

  const query = { page, limit: PAGE_LIMIT };
  if (statusFilter !== "All") query.status = statusFilter;

  const res = await getAdminOrders(query);

  return (
    <AdminOrdersClient
      initialOrders={res.success ? res.result : []}
      initialTotal={res.total ?? 0}
      initialPage={page}
      initialStatusFilter={statusFilter}
    />
  );
}
