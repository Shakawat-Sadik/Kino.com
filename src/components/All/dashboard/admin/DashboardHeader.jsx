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
import { cn } from "@/lib/utils";


const NAV_LINKS = {
  buyer: [
    { href: "/dashboard/buyer", label: "Overview", title: "My Dashboard", subtitle: "Overview of your buying activity", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/buyer/orders", label: "My Orders", subtitle: "Track and manage all your orders", icon: <ShoppingCart className="h-5 w-5" /> },
    { href: "/dashboard/buyer/wishlist", label: "Wishlist", subtitle: "Products you saved for later", icon: <Heart className="h-5 w-5" /> },
    { href: "/dashboard/buyer/payments", label: "Payments", title: "Payment History", subtitle: "All your transaction records", icon: <CreditCard className="h-5 w-5" /> },
    { href: "/dashboard/buyer/profile", label: "Profile", title: "Profile Settings", subtitle: "Update your personal information", icon: <User className="h-5 w-5" /> },
  ],
  seller: [
    { href: "/dashboard/seller", label: "Overview", title: "Seller Dashboard", subtitle: "Your business at a glance", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/seller/products", label: "My Products", subtitle: "Manage your listings", icon: <Package className="h-5 w-5" /> },
    { href: "/dashboard/seller/orders", label: "Manage Orders", subtitle: "Accept, process and ship incoming orders", icon: <ShoppingCart className="h-5 w-5" /> },
    { href: "/dashboard/seller/analytics", label: "Analytics", title: "Sales Analytics", subtitle: "Visual overview of your selling performance", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/dashboard/seller/profile", label: "Profile", title: "Profile Settings", subtitle: "Update your personal information", icon: <User className="h-5 w-5" /> },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", title: "Admin Dashboard", subtitle: "Platform overview and management", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/admin/users", label: "Manage Users", subtitle: "View, block, and remove user accounts", icon: <Users className="h-5 w-5" /> },
    { href: "/dashboard/admin/products", label: "Manage Products", subtitle: "Approve, reject, and remove product listings", icon: <Package className="h-5 w-5" /> },
    { href: "/dashboard/admin/orders", label: "Manage Orders", subtitle: "Monitor all platform orders and resolve disputes", icon: <ShoppingCart className="h-5 w-5" /> },
    { href: "/dashboard/admin/analytics", label: "Analytics", title: "Platform Analytics", subtitle: "Overall business insights — orders, revenue, users, and categories", icon: <BarChart3 className="h-5 w-5" /> },
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

  const currentLink = links.find((l) =>
    l.exact ? pathname === l.href : pathname.startsWith(l.href)
  );
  const pageTitle = currentLink?.title || currentLink?.label || "Dashboard";
  const pageSubtitle = currentLink?.subtitle || null;

  return (
    <>
      <header className="sticky top-0 z-40 min-h-16 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-background/80 backdrop-blur-xl">
        {/* Left — mobile menu trigger + page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-col justify-center">
            <h1 className="text-sm font-semibold text-foreground leading-tight">{pageTitle}</h1>
            {pageSubtitle && (
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">{pageSubtitle}</p>
            )}
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
