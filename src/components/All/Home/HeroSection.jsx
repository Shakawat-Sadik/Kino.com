"use client";
import { motion, useReducedMotion } from "motion/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ActionSwapText } from "@/components/motion/action-swap";
import { ScrollTo } from "@/components/motion/scroll-to";
import { EASE_OUT } from "@/lib/ease";
import {
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Package,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const CATEGORIES = ["Electronics", "Furniture", "Vehicles", "Fashion", "Books"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  },
});

export default function HeroSection({ stats }) {
  const reduce = useReducedMotion();
  const [catIdx, setCatIdx] = useState(0);
  const { data: session } = authClient.useSession();
  const role = session?.user?.role;

  useEffect(() => {
    const t = setInterval(() => setCatIdx((i) => (i + 1) % CATEGORIES.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background py-20 md:py-32">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-chart-3/10 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-chart-1/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 text-center">
        {/* Eyebrow */}
        <motion.div
          {...(reduce ? {} : fadeUp(0))}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
        >
          <TrendingUp size={12} className="text-chart-3" />
          Bangladesh&apos;s trusted second-hand marketplace
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...(reduce ? {} : fadeUp(0.1))}
          className="text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl md:text-6xl lg:text-7xl"
        >
          <span className="whitespace-nowrap">
            Buy &amp; Sell{" "}
            <span className="text-chart-3">
              <Link
                href={`/products?category=${encodeURIComponent(CATEGORIES[catIdx])}`}
                className="hover:underline decoration-chart-3 underline-offset-4"
              >
                <ActionSwapText value={catIdx} animation="roll">
                  {CATEGORIES[catIdx]}
                </ActionSwapText>
              </Link>
            </span>
          </span>
          <br />
          <span className="text-foreground/70">with Confidence</span>
        </motion.h1>

        <motion.p
          {...(reduce ? {} : fadeUp(0.18))}
          className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg"
        >
          Kino.com connects buyers and sellers across Bangladesh for safe,
          affordable, and sustainable commerce.
        </motion.p>

        {/* CTAs — role-aware */}
        <motion.div
          {...(reduce ? {} : fadeUp(0.24))}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {role === "seller" ? (
            <>
              <Button
                asChild
                className="h-11 rounded-full px-6 gap-2 bg-foreground text-background hover:bg-foreground/80"
              >
                <Link href="/dashboard/seller/products/new">
                  <PlusCircle size={15} />
                  Start Selling
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full px-6">
                <Link href="/dashboard/seller">
                  <LayoutDashboard size={14} className="mr-1" />
                  My Dashboard <ArrowRight size={14} className="ml-1" />
                </Link>
              </Button>
            </>
          ) : role === "admin" ? (
            <>
              <Button
                asChild
                className="h-11 rounded-full px-6 gap-2 bg-foreground text-background hover:bg-foreground/80"
              >
                <Link href="/dashboard/admin">
                  <ShieldCheck size={15} />
                  Manage Tasks
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full px-6">
                <Link href="/dashboard/admin/users">
                  <Users size={14} className="mr-1" />
                  Manage Users <ArrowRight size={14} className="ml-1" />
                </Link>
              </Button>
            </>
          ) : role === "buyer" ? (
            <>
              <ScrollTo
                to="#featured"
                offset={-80}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-colors hover:bg-foreground/80"
              >
                <ShoppingBag size={15} />
                Browse Products
              </ScrollTo>
              <Button asChild variant="outline" className="h-11 rounded-full px-6">
                <Link href="/dashboard/buyer/orders">
                  <Package size={14} className="mr-1" />
                  My Orders <ArrowRight size={14} className="ml-1" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <ScrollTo
                to="#featured"
                offset={-80}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-colors hover:bg-foreground/80"
              >
                <ShoppingBag size={15} />
                Browse Products
              </ScrollTo>
              <Button asChild variant="outline" className="h-11 rounded-full px-6">
                <Link href="/auth/sign-up">
                  Start Selling <ArrowRight size={14} className="ml-1" />
                </Link>
              </Button>
            </>
          )}
        </motion.div>

        {/* Stat pills */}
        {stats && (
          <motion.div
            {...(reduce ? {} : fadeUp(0.32))}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            {[
              { label: "Products", value: stats.totalProducts },
              { label: "Sellers", value: stats.totalSellers },
              { label: "Buyers", value: stats.totalBuyers },
              { label: "Orders Completed", value: stats.totalOrders },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium shadow-sm"
              >
                <span className="font-bold text-chart-3">
                  {(value ?? 0).toLocaleString()}
                </span>{" "}
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
