import { RoleGuard } from "@/components/All/auth/RoleGuard";
import { DashboardHeader } from "@/components/All/dashboard/admin/DashboardHeader";
import { DashboardSidebar } from "@/components/All/dashboard/admin/DashboardSidebar";

export default function SellerLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["seller", "admin"]}>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
