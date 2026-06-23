import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminUsers, getAdminOrders } from "@/lib/action/action";
import { eliteDateFormat } from "@/lib/utils";

// ── Status badge colours ──────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:    "bg-green-500/10 text-green-600 dark:text-green-400",
    blocked:   "bg-red-500/10 text-red-500",
    pending:   "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    accepted:  "bg-blue-500/10 text-blue-500",
    delivered: "bg-green-500/10 text-green-600 dark:text-green-400",
    cancelled: "bg-red-500/10 text-red-500",
    paid:      "bg-green-500/10 text-green-600 dark:text-green-400",
    failed:    "bg-red-500/10 text-red-500",
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status?.toLowerCase()] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

// ── Recent Users ──────────────────────────────────────────────
async function RecentUsers() {
  const res = await getAdminUsers({ limit: 5 });
  const users = res.success ? res.result : [];

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Users</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Latest 5 registrations</p>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No users found</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground pl-0">Name</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Role</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} className="border-border">
                <TableCell className="pl-0 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[140px]">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {user.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold capitalize text-muted-foreground">
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status || "active"} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ── Recent Orders ─────────────────────────────────────────────
async function RecentOrders() {
  const res = await getAdminOrders({ limit: 5 });
  const orders = res.success ? res.result : [];

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Latest 5 transactions</p>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No orders yet</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground pl-0">Buyer</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Amount</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id} className="border-border">
                <TableCell className="pl-0 py-3">
                  <p className="text-sm font-medium text-foreground truncate max-w-[140px]">
                    {order.buyerInfo?.name || "Unknown"}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold text-foreground">
                    ৳{order.amount?.toLocaleString() ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.orderStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ── Exported wrapper — both tables side by side ───────────────
export async function AdminRecentActivity() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <RecentUsers />
      <RecentOrders />
    </div>
  );
}

export function AdminRecentActivitySkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5">
          <div className="h-4 w-32 bg-muted rounded-lg animate-pulse mb-1.5" />
          <div className="h-3 w-40 bg-muted rounded-lg animate-pulse mb-5" />
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((j) => (
              <div key={j} className="flex gap-4">
                <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
