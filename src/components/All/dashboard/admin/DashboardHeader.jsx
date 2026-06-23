"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { authClient } from "@/lib/auth-client";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Heart,
  CreditCard,
  User,
  Users,
  BarChart3,
  LogOut,
  SquaresExclude,
} from "lucide-react";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { cn } from "@/lib/utils";

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
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user;
  const role = user?.role || "buyer";
  const links = NAV_LINKS[role] || NAV_LINKS.buyer;

  const isActive = (href, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  // Derive page title from current path
  const currentLink = links.find((l) =>
    l.exact ? pathname === l.href : pathname.startsWith(l.href)
  );
  const pageTitle = currentLink?.label || "Dashboard";

  return (
    <>
      <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-background/80 backdrop-blur-xl">
        {/* Left — mobile menu trigger + page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
        </div>

        {/* Right — theme toggle + user badge */}
        <div className="flex items-center gap-2">
          <ThemeToggle variant="top-right" />
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.slice(0, 2)?.toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium text-foreground max-w-32 truncate">
              {user?.name}
            </span>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col md:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 h-16 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                    <SquaresExclude className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-foreground">
                    Kino<span className="text-primary">Market</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* User info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                {links.map(({ href, label, icon: Icon, exact }) => {
                  const active = isActive(href, exact);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* Sign out */}
              <div className="px-3 py-3 border-t border-border">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
