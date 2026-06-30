"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  User,
  UserStar,
  SquaresExclude,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  ShieldUser,
  Package,
  Cpu,
  Armchair,
  Car,
  Shirt,
  Smartphone,
  BookOpen,
  ArrowUpRight,
  Gamepad2,
  Camera,
  Dumbbell,
  GraduationCap,
  Briefcase,
  Music,
  LayoutGrid,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "../motion/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";

// ── Role-aware dashboard link config ─────────────────────────
const DASHBOARD_LINK = {
  buyer: { href: "/dashboard/buyer", label: "My Dashboard", icon: LayoutDashboard },
  seller: { href: "/dashboard/seller", label: "Seller Dashboard", icon: Package },
  admin: { href: "/dashboard/admin", label: "Admin Panel", icon: ShieldCheck },
};

const PROFILE_LINK = {
  buyer: { href: "/dashboard/buyer/profile", label: "My Profile", icon: <User className="h-4 w-4 text-muted-foreground" /> },
  seller: { href: "/dashboard/seller/profile", label: "My Profile", icon: <UserStar className="h-4 w-4 text-muted-foreground" /> },
  admin: { href: "/dashboard/admin/profile", label: "My Profile", icon: <ShieldUser className="h-4 w-4 text-muted-foreground" /> },
};

const CATEGORIES = [
  { name: "Electronics",    icon: Cpu,          color: "text-chart-1", bg: "bg-chart-1/10",  href: "/products?category=Electronics" },
  { name: "Mobile Phones",  icon: Smartphone,   color: "text-chart-5", bg: "bg-chart-5/10",  href: "/products?category=Mobile+Phones" },
  { name: "Furniture",      icon: Armchair,     color: "text-chart-2", bg: "bg-chart-2/10",  href: "/products?category=Furniture" },
  { name: "Vehicles",       icon: Car,          color: "text-chart-3", bg: "bg-chart-3/10",  href: "/products?category=Vehicles" },
  { name: "Fashion",        icon: Shirt,        color: "text-chart-4", bg: "bg-chart-4/10",  href: "/products?category=Fashion" },
  { name: "Books",          icon: BookOpen,     color: "text-chart-1", bg: "bg-chart-1/10",  href: "/products?category=Books" },
  { name: "Sports & Fitness", icon: Dumbbell,   color: "text-chart-3", bg: "bg-chart-3/10",  href: "/products?category=Sports+%26+Fitness" },
  { name: "Gaming",         icon: Gamepad2,     color: "text-chart-5", bg: "bg-chart-5/10",  href: "/products?category=Gaming" },
  { name: "Cameras",        icon: Camera,       color: "text-chart-2", bg: "bg-chart-2/10",  href: "/products?category=Cameras" },
  { name: "Education",      icon: GraduationCap,color: "text-chart-4", bg: "bg-chart-4/10",  href: "/products?category=Education" },
  { name: "Jobs & Services",icon: Briefcase,    color: "text-chart-1", bg: "bg-chart-1/10",  href: "/products?category=Jobs+%26+Services" },
  { name: "Music",          icon: Music,        color: "text-chart-3", bg: "bg-chart-3/10",  href: "/products?category=Music" },
];

const NAV_LINKS = [
  { href: "/", title: "Home" },
  { href: "/products", title: "Products" },
  { href: "/categories", title: "Categories", hasMega: true },
  { href: "/about", title: "About" },
  { href: "/contact", title: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const user = session?.user;
  const role = user?.role;
  const isAuthenticated = Boolean(user);
  const profileInitial =
    user?.name?.split(" ").length > 1
      ? user.name.split(" ").map((n) => n[0]).join("")
      : user?.name?.slice(0, 2)?.toUpperCase() || "U";

  const dashboard = DASHBOARD_LINK[role] ?? DASHBOARD_LINK.buyer;

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto px-5 sm:px-10 lg:px-15">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl group-hover:scale-105 transition-transform">
              <SquaresExclude className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold hidden sm:block">
              <span className="text-foreground">Kino</span>
              <span className="text-primary">.com</span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {NAV_LINKS.map(({ href, title, hasMega }) =>
                hasMega ? (
                  <NavigationMenuItem key={title}>
                    <NavigationMenuTrigger
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        isActive(href)
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {title}
                    </NavigationMenuTrigger>

                    {/* ── Mega-menu ── */}
                    <NavigationMenuContent>
                      <div className="w-140 p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
                          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Browse Categories
                          </p>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/categories"
                              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              View All <ArrowUpRight size={11} />
                            </Link>
                          </NavigationMenuLink>
                        </div>

                        {/* 3-column grid */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {CATEGORIES.map(({ name, icon: Icon, color, bg, href: catHref }) => (
                            <NavigationMenuLink key={name} asChild>
                              <Link
                                href={catHref}
                                className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-accent transition-colors"
                              >
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg} ${color} group-hover:scale-110 transition-transform`}>
                                  <Icon size={15} strokeWidth={1.75} />
                                </span>
                                <span className="text-xs font-semibold text-foreground leading-tight">
                                  {name}
                                </span>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>

                        {/* Footer CTA */}
                        <div className="mt-3 pt-3 border-t border-border">
                          <NavigationMenuLink asChild>
                            <Link
                              href="/categories"
                              className="flex items-center justify-between w-full rounded-xl px-4 py-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors group"
                            >
                              <div className="flex items-center gap-2">
                                <LayoutGrid size={14} className="text-primary" />
                                <span className="text-sm font-semibold text-primary">
                                  Explore all 12 categories
                                </span>
                              </div>
                              <ArrowUpRight size={14} className="text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={href}
                        className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          isActive(href)
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        {title}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* ── Desktop right ── */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle variant="top-right" />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground pl-3 pr-2 py-1.5 hover:opacity-90 transition-opacity">
                    <span className="text-sm font-semibold hidden sm:block max-w-36 truncate">
                      {user?.name || "Profile"}
                    </span>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", visualDuration: 0.4, bounce: 0.5 }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image} alt={user?.name || "Profile"} />
                        <AvatarFallback className="text-xs font-bold bg-primary-foreground/20 text-primary-foreground">
                          {profileInitial}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-48">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    {role && (
                      <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                        {role}
                      </span>
                    )}
                  </div>

                  <DropdownMenuGroup className="py-1">
                    <DropdownMenuItem asChild>
                      <Link
                        href={PROFILE_LINK[role]?.href}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer"
                      >
                        {PROFILE_LINK[role]?.icon || <User className="h-4 w-4 text-muted-foreground" />}
                        {PROFILE_LINK[role]?.label || "My Profile"}
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href={dashboard.href}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer"
                      >
                        <dashboard.icon className="h-4 w-4 text-muted-foreground" />
                        {dashboard.label}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup className="py-1">
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-primary-foreground bg-primary hover:bg-primary/90 cursor-pointer focus:bg-primary/90 focus:text-primary-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-primary border border-primary hover:bg-primary/5 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile controls ── */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle variant="top-right" />
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map(({ href, title, hasMega }) => (
              <div key={title}>
                {hasMega ? (
                  <details className="group">
                    <summary className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-accent cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      {title}
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180 text-muted-foreground" />
                    </summary>
                    <div className="mt-1.5 pb-2 space-y-0.5">
                      {CATEGORIES.map(({ name, icon: Icon, color, bg, href: catHref }) => (
                        <Link
                          key={catHref}
                          href={catHref}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            isActive(catHref)
                              ? "text-primary bg-primary/5"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                        >
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
                            <Icon size={13} strokeWidth={1.75} />
                          </span>
                          {name}
                        </Link>
                      ))}
                      {/* View all CTA */}
                      <Link
                        href="/categories"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 mt-1 rounded-xl text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <LayoutGrid size={13} />
                          View all categories
                        </span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </details>
                ) : (
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive(href)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    {title}
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile auth section */}
            <div className="pt-3 mt-2 border-t border-border">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-accent">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={user?.image} alt={user?.name || "Profile"} />
                      <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                        {profileInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{role || "Logged in"}</p>
                    </div>
                  </div>

                  <Link
                    href={PROFILE_LINK[role]?.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-accent transition-colors"
                  >
                    {PROFILE_LINK[role]?.icon || <User className="h-4 w-4 text-muted-foreground" />}
                    {PROFILE_LINK[role]?.label || "My Profile"}
                  </Link>

                  <Link
                    href={dashboard.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-accent transition-colors"
                  >
                    <dashboard.icon className="h-4 w-4 text-muted-foreground" />
                    {dashboard.label}
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-primary border border-primary hover:bg-primary/5 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
