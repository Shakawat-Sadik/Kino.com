import { DashboardSidebar } from "@/components/All/dashboard/admin/DashboardSidebar";
import { DashboardHeader } from "@/components/All/dashboard/admin/DashboardHeader";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile, shown md+ */}
      <DashboardSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header — handles mobile nav */}
        <DashboardHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
