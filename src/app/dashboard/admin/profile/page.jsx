import { getMyProfile } from "@/lib/action/action";
import { AdminProfileClient } from "@/components/All/dashboard/admin/AdminProfileClient";

export default async function AdminProfilePage() {
  const res = await getMyProfile();
  return <AdminProfileClient initialProfile={res.success ? res.result : null} />;
}
