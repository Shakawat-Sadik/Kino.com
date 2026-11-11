import { getAdminPayments, getTotalRevenue } from "@/lib/action/action";
import { AdminPaymentsClient } from "@/components/All/dashboard/admin/AdminPaymentsClient";

const PAGE_LIMIT = 12;

export default async function AdminPaymentsPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const statusFilter = params.status ?? "All";
  const search = params.search?.trim() ?? "";

  const query = { page, limit: PAGE_LIMIT };
  if (search) query.search = search;
  if (statusFilter !== "All") query.status = statusFilter;

  const [paymentsRes, revenueRes] = await Promise.all([
    getAdminPayments(query),
    getTotalRevenue(),
  ]);

  return (
    <AdminPaymentsClient
      initialPayments={paymentsRes.success ? paymentsRes.result : []}
      initialTotal={paymentsRes.total ?? 0}
      initialPage={page}
      initialSearch={search}
      initialStatusFilter={statusFilter}
      initialTotalRevenue={revenueRes.success ? revenueRes.result : null}
    />
  );
}
