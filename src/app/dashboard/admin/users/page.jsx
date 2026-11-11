import { getAdminUsers } from "@/lib/action/action";
import { AdminUsersClient } from "@/components/All/dashboard/admin/AdminUsersClient";

const PAGE_LIMIT = 10;

export default async function AdminUsersPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const roleFilter = params.role ?? "All";
  const statusFilter = params.status ?? "All";

  const query = { page, limit: PAGE_LIMIT };
  if (roleFilter !== "All") query.role = roleFilter;
  if (statusFilter !== "All") query.status = statusFilter;

  const res = await getAdminUsers(query);

  return (
    <AdminUsersClient
      initialUsers={res.success ? res.result : []}
      initialTotal={res.total ?? 0}
      initialPage={page}
      initialRoleFilter={roleFilter}
      initialStatusFilter={statusFilter}
    />
  );
}
