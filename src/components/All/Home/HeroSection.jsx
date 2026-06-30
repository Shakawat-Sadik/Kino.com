"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  Zap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const CATEGORIES = [
  "Electronics",
  "Mobile Phones",
  "Furniture",
  "Vehicles",
  "Fashion",
  "Books",
  "Sports & Fitness",
  "Gaming",
  "Cameras",
  "Education",
  "Jobs & Services",
  "Music",
  "Others",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_OUT, delay },
  },
});

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function HeroSection({ stats }) {
  const reduce = useReducedMotion();
  const [catIdx, setCatIdx] = useState(0);
  const { data: session } = authClient.useSession();
  const role = session?.user?.role;
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => setCatIdx((i) => (i + 1) % CATEGORIES.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-[90vh] flex items-center"
    >
      {/* Animated gradient mesh background */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-muted/40" />

        {/* Floating gradient orbs */}
        <motion.div
          animate={reduce ? {} : {
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-20 h-125 w-125 rounded-full bg-chart-3/15 blur-[100px]"
        />
        <motion.div
          animate={reduce ? {} : {
            x: [0, -25, 15, 0],
            y: [0, 25, -15, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 -left-32 h-112.5 w-112.5 rounded-full bg-chart-1/15 blur-[100px]"
        />
        <motion.div
          animate={reduce ? {} : {
            x: [0, 15, -30, 0],
            y: [0, -15, 20, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/3 left-1/2 h-75 w-75 rounded-full bg-chart-2/10 blur-[80px]"
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative mx-auto max-w-7xl px-4 w-full py-20 md:py-28 lg:py-0"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            {/* Eyebrow badge */}
            <motion.div
              {...(reduce ? {} : fadeUp(0))}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-5 py-2 text-xs font-medium text-muted-foreground shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-3 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-chart-3" />
              </span>
              Bangladesh&apos;s trusted second-hand marketplace
              <TrendingUp size={12} className="text-chart-3" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...(reduce ? {} : fadeUp(0.1))}
              className="flex flex-col text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-foreground"
            >
              Buy &amp; Sell{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-chart-3">
                  <Link
                    href={`/products?category=${encodeURIComponent(CATEGORIES[catIdx])}`}
                    className="hover:underline decoration-chart-3/30 underline-offset-4 transition-all"
                  >
                    <ActionSwapText value={catIdx} animation="roll">
                      {CATEGORIES[catIdx]}
                    </ActionSwapText>
                  </Link>
                <motion.span
                  className="absolute -bottom-10 left-0 right-0 h-3 bg-chart-3/20 rounded-full z-0"
                  animate={reduce ? {} : { scaleX: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ originX: 0.5 }}
                />
                </span>
              </span>
              <br />
              <span className="text-foreground/50">with Confidence</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              {...(reduce ? {} : fadeUp(0.2))}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Kino.com connects buyers and sellers across Bangladesh for safe,
              affordable, and sustainable commerce.
            </motion.p>

            {/* CTAs — role-aware */}
            <motion.div
              {...(reduce ? {} : fadeUp(0.28))}
              className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-3"
            >
              {role === "seller" ? (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full px-8 gap-2.5 bg-foreground text-background hover:bg-foreground/80 shadow-lg shadow-foreground/20"
                  >
                    <Link href="/dashboard/seller/products/new">
                      <PlusCircle size={16} />
                      Start Selling
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-8">
                    <Link href="/dashboard/seller">
                      <LayoutDashboard size={15} className="mr-1.5" />
                      My Dashboard <ArrowRight size={15} className="ml-1.5" />
                    </Link>
                  </Button>
                </>
              ) : role === "admin" ? (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full px-8 gap-2.5 bg-foreground text-background hover:bg-foreground/80 shadow-lg shadow-foreground/20"
                  >
                    <Link href="/dashboard/admin">
                      <ShieldCheck size={16} />
                      Manage Tasks
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-8">
                    <Link href="/dashboard/admin/users">
                      <Users size={15} className="mr-1.5" />
                      Manage Users <ArrowRight size={15} className="ml-1.5" />
                    </Link>
                  </Button>
                </>
              ) : role === "buyer" ? (
                <>
                  <ScrollTo
                    to="#featured"
                    offset={-80}
                    className="inline-flex h-12 items-center gap-2.5 rounded-full bg-foreground px-8 text-sm font-semibold text-background transition-all hover:bg-foreground/80 shadow-lg shadow-foreground/20"
                  >
                    <ShoppingBag size={16} />
                    Browse Products
                  </ScrollTo>
                  <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-8">
                    <Link href="/dashboard/buyer/orders">
                      <Package size={15} className="mr-1.5" />
                      My Orders <ArrowRight size={15} className="ml-1.5" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <ScrollTo
                    to="#featured"
                    offset={-80}
                    className="inline-flex h-12 items-center gap-2.5 rounded-full bg-foreground px-8 text-sm font-semibold text-background transition-all hover:bg-foreground/80 shadow-lg shadow-foreground/20"
                  >
                    <ShoppingBag size={16} />
                    Browse Products
                  </ScrollTo>
                  <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-8">
                    <Link href="/auth/sign-up">
                      Start Selling <ArrowRight size={15} className="ml-1.5" />
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>

            {/* Stat pills */}
            {stats && (
              <motion.div
                {...(reduce ? {} : { ...fadeUp(0.36), ...staggerContainer.animate })}
                className="mt-12 flex flex-wrap justify-center lg:justify-start gap-3"
              >
                {[
                  { label: "Products", value: stats.totalProducts, icon: Package },
                  { label: "Sellers", value: stats.totalSellers, icon: Users },
                  { label: "Buyers", value: stats.totalBuyers, icon: ShoppingBag },
                  { label: "Orders", value: stats.totalOrders, icon: Zap },
                ].map(({ label, value, icon: Icon }) => (
                  <motion.div
                    key={label}
                    {...(reduce ? {} : fadeUp(0))}
                    className="flex items-center gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-2 text-xs font-medium shadow-sm"
                  >
                    <Icon size={13} className="text-chart-3" />
                    <span className="font-bold text-foreground">
                      {(value ?? 0).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">{label}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right: Visual element */}
          <motion.div
            {...(reduce ? {} : { initial: { opacity: 0, scale: 0.9, x: 40 }, animate: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.8, ease: EASE_OUT, delay: 0.3 } }})}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main visual card */}
              <div className="relative rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 shadow-2xl shadow-chart-3/5">
                <div className="aspect-square rounded-2xl bg-linear-to-br from-chart-3/10 via-chart-2/5 to-chart-1/10 flex items-center justify-center overflow-hidden">
                  {/* Decorative elements inside */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div
                      animate={reduce ? {} : { rotate: [0, 5, -5, 0], scale: [1, 1.02, 0.98, 1] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      className="relative"
                    >
                      <div className="h-48 w-48 rounded-3xl border-2 border-dashed border-chart-3/30 flex items-center justify-center">
                        <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-chart-2/30 flex items-center justify-center">
                          <div className="h-16 w-16 rounded-xl bg-chart-3/20 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-chart-3" />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Floating mini cards */}
                    <motion.div
                      animate={reduce ? {} : { y: [0, -10, 0], x: [0, 5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute top-6 right-8 rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm px-3 py-2 shadow-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-chart-1/20 flex items-center justify-center">
                          <Package size={14} className="text-chart-1" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">New Listing</p>
                          <p className="text-xs font-bold text-foreground">৳35,000</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      animate={reduce ? {} : { y: [0, 8, 0], x: [0, -5, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                      className="absolute bottom-8 left-4 rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm px-3 py-2 shadow-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-chart-3/20 flex items-center justify-center">
                          <ShoppingBag size={14} className="text-chart-3" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Just Sold</p>
                          <p className="text-xs font-bold text-foreground">Dell Laptop</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      animate={reduce ? {} : { y: [0, -6, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute top-1/2 -right-2 rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm px-3 py-2 shadow-lg"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                          <div className="h-5 w-5 rounded-full bg-chart-1/40 border-2 border-card" />
                          <div className="h-5 w-5 rounded-full bg-chart-3/40 border-2 border-card" />
                          <div className="h-5 w-5 rounded-full bg-chart-2/40 border-2 border-card" />
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground">+2.4k active</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Background glow */}
              <div className="absolute -inset-4 rounded-[2rem] bg-linear-to-r from-chart-3/10 via-chart-2/5 to-chart-1/10 blur-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}