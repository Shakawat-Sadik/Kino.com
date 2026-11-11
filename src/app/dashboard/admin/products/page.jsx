import { getAdminProducts } from "@/lib/action/action";
import { AdminProductsClient } from "@/components/All/dashboard/admin/AdminProductsClient";

const PAGE_LIMIT = 10;

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const categoryFilter = params.category ?? "All";
  const statusFilter = params.status ?? "All";

  const query = { page, limit: PAGE_LIMIT };
  if (categoryFilter !== "All") query.category = categoryFilter;
  if (statusFilter !== "All") query.status = statusFilter;

  const res = await getAdminProducts(query);

  return (
    <AdminProductsClient
      initialProducts={res.success ? res.result : []}
      initialTotal={res.total ?? 0}
      initialPage={page}
      initialCategoryFilter={categoryFilter}
      initialStatusFilter={statusFilter}
    />
  );
}
