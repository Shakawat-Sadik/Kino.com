"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import  { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User, SquaresExclude, ChevronDown, LayoutDashboard } from "lucide-react";
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

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const user = session?.user;
  const role = session?.role;
  const isAuthenticated = Boolean(user);
  const profileInitial = user?.name?.slice(0, 2)?.toUpperCase() || "U";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Close everything on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (!e.target.closest("#profile-menu")) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLinks = [
    { href: "/", title: "Home" },
    { href: "/products", title: "All Products" },
    {
      href: "/categories",
      title: "Categories",
      submenu: [
        { href: "/electronics", title: "Electronics" },
        { href: "/furniture", title: "Furniture" },
        { href: "/vehicles", title: "Vehicles" },
        { href: "/fashion", title: "Fashion" },
        { href: "/mobile-phones", title: "Mobile Phones" },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto px-5 sm:px-10 lg:px-15">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl group-hover:scale-105 transition-transform">
              <SquaresExclude className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold hidden sm:block">
              <span className="text-foreground">Kino</span>
              <span className="text-primary">.com</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navLinks.map(({ href, title, submenu }) =>
                submenu ? (
                  <NavigationMenuItem key={title} className="relative">
                    <NavigationMenuTrigger
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        isActive(href)
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="flex flex-col min-w-40 p-2 gap-1">
                        {submenu.map(
                          ({ href: subHref, title: subtitle }, index) => (
                            <Link key={subHref + index} href={subHref} passHref>
                              <NavigationMenuLink className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground block">
                                {subtitle}
                              </NavigationMenuLink>
                            </Link>
                          ),
                        )}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={href} className="relative">
                    <Link href={href} passHref>
                      <NavigationMenuLink
                        className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          isActive(href)
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        {title}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle variant="top-right" />

            {isAuthenticated ? (
              <div id="profile-menu" className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground pl-3 pr-1.5 py-1.5 hover:opacity-90 transition-opacity w-full justify-center">
                    <span className="text-sm font-semibold hidden sm:block max-w-40 truncate">
                      {user?.name || "Profile"}
                    </span>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        scale: {
                          type: "spring",
                          visualDuration: 0.4,
                          bounce: 0.5,
                        },
                      }}
                    >
                      <Avatar>
                        <AvatarImage
                          src={user?.image}
                          alt={user?.name || "Profile"}
                        />
                        <AvatarFallback>{profileInitial}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <Link href="/profile">
                        <DropdownMenuItem className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors cursor-pointer">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-accent-foreground">
                            My Profile
                          </span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/dashboard">
                        <DropdownMenuItem className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors cursor-pointer">
                          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-accent-foreground">
                            Dashboard
                          </span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-muted-foreground" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle variant="top-right" />
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {/* MOBILE NAV LINKS WITH SUBMENU SUPPORT */}
            {navLinks.map(({ href, title, submenu }) => (
              <div key={title}>
                {submenu ? (
                  <details className="group">
                    <summary className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-accent cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      {title}
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180 text-muted-foreground" />
                    </summary>
                    <div className="pl-4 pb-2 mt-1 space-y-1 border-l-2 border-border ml-4">
                      {submenu.map(({ href: subHref, title: subtitle }, index) => (
                        <Link
                          key={subHref + index}
                          href={subHref}
                          onClick={() => setMobileOpen(false)}
                          className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            isActive(subHref)
                              ? "text-primary bg-primary/5"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                        >
                          {subtitle}
                        </Link>
                      ))}
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

            <div className="pt-3 mt-2 border-t border-border">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-accent">
                    <div className="relative h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      <Avatar>
                        <AvatarImage
                          src={user?.image}
                          alt={user?.name || "Profile"}
                        />
                        <AvatarFallback>{profileInitial}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {user?.name.split(" ")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Logged in
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/Profile"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-accent transition-colors"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                  >
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