"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Heart,
  CreditCard,
  User,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  SquaresExclude,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Nav link definitions per role
// ─────────────────────────────────────────────────────────────
const NAV_LINKS = {
  buyer: [
    { href: "/dashboard/buyer", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/buyer/orders", label: "My Orders", icon: ShoppingCart },
    { href: "/dashboard/buyer/wishlist", label: "Wishlist", icon: Heart },
    { href: "/dashboard/buyer/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/buyer/profile", label: "Profile", icon: User },
  ],
  seller: [
    { href: "/dashboard/seller", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/seller/products", label: "My Products", icon: Package },
    { href: "/dashboard/seller/orders", label: "Manage Orders", icon: ShoppingCart },
    { href: "/dashboard/seller/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/seller/profile", label: "Profile", icon: User },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/products", label: "Manage Products", icon: Package },
    { href: "/dashboard/admin/orders", label: "Manage Orders", icon: ShoppingCart },
    { href: "/dashboard/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/admin/profile", label: "Profile", icon: User },
  ],
};

const ROLE_BADGE = {
  buyer: { label: "Buyer", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  seller: { label: "Seller", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  admin: { label: "Admin", color: "bg-primary/15 text-primary" },
};

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────
export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [collapsed, setCollapsed] = useState(false);

  const user = session?.user;
  const role = user?.role || "buyer";
  const links = NAV_LINKS[role] || NAV_LINKS.buyer;
  const badge = ROLE_BADGE[role];

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  const isActive = (href, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="hidden md:flex shrink-0 h-screen sticky top-0 relative z-40">
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-card border-r border-border overflow-hidden"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shrink-0">
          <SquaresExclude className="h-5 w-5" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-base font-bold text-foreground whitespace-nowrap overflow-hidden"
            >
              Kino<span className="text-primary">Market</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── User info ── */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-4 py-3 border-b border-border shrink-0"
          >
            <p className="text-sm font-semibold text-foreground truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user?.email}
            </p>
            <span className={cn("inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full", badge.color)}>
              {badge.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nav links ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 px-2">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors relative group",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.12 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-lg text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Sign out ── */}
      <div className="px-2 py-3 border-t border-border shrink-0">
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 w-full px-2.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors group relative"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.12 }}
                className="whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-lg text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
              Sign Out
            </div>
          )}
        </button>
      </div>

    </motion.aside>

    {/* ── Collapse toggle — outside aside so overflow-hidden doesn't clip it ── */}
    <button
      onClick={() => setCollapsed((c) => !c)}
      className="absolute top-[72px] -right-3 z-50 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-accent transition-colors"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed
        ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
        : <ChevronLeft className="h-3 w-3 text-muted-foreground" />
      }
    </button>
    </div>
  );
}
