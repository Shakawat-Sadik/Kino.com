"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Sparkles, LayoutDashboard, ShoppingBag, PlusCircle, ShieldCheck, Package } from "lucide-react";
import { EASE_OUT } from "@/lib/ease";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { ActionSwapText, ActionSwapIcon } from "@/components/motion/action-swap";

const DASHBOARD_ITEMS = {
  buyer:  { href: "/dashboard/buyer",   label: "My Dashboard",    Icon: LayoutDashboard },
  seller: { href: "/dashboard/seller",  label: "Seller Dashboard", Icon: Package },
  admin:  { href: "/dashboard/admin",   label: "Admin Panel",      Icon: ShieldCheck },
};

function buildItems(role) {
  const dash = DASHBOARD_ITEMS[role] ?? DASHBOARD_ITEMS.buyer;
  return [
    { id: "dashboard", href: dash.href,                          label: dash.label,        Icon: dash.Icon },
    { id: "products",  href: "/products",                        label: "Browse Products", Icon: ShoppingBag },
    { id: "sell",      href: "/dashboard/seller/products/add",   label: "List an Item",    Icon: PlusCircle },
  ];
}

function LoggedInCTA({ role }) {
  const items = buildItems(role);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 2600);
    return () => clearInterval(id);
  }, [items.length]);

  const active = items[index];

  return (
    <Link
      href={active.href}
      className="inline-flex h-12 items-center gap-2.5 rounded-full bg-primary-foreground px-8 text-sm font-bold text-foreground transition-all hover:bg-primary-foreground/90 shadow-lg shadow-black/20 overflow-hidden"
    >
      <ActionSwapIcon value={active.id} animation="roll" className="h-4 w-4 shrink-0">
        <active.Icon size={15} />
      </ActionSwapIcon>
      <ActionSwapText value={active.id} animation="cascade">
        {active.label}
      </ActionSwapText>
    </Link>
  );
}

export default function CTABanner() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = Boolean(session?.user);
  const role = session?.user?.role;

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-linear-to-r from-foreground via-foreground/95 to-foreground/90" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-chart-3/15 blur-[60px]" />
          <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-chart-1/10 blur-[50px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/10 bg-primary-foreground/5 px-4 py-1.5 text-xs font-medium text-primary-foreground/60 mb-6"
            >
              <Sparkles size={12} />
              Join thousands of happy users
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black text-primary-foreground tracking-tight max-w-2xl mx-auto leading-tight"
            >
              Ready to Start Buying or Selling?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="mt-4 text-primary-foreground/50 max-w-lg mx-auto text-sm md:text-base leading-relaxed"
            >
              Join Bangladesh&apos;s fastest-growing second-hand marketplace. List your first item in under 2 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              {isAuthenticated ? (
                <LoggedInCTA role={role} />
              ) : (
                <Link
                  href="/auth/sign-up"
                  className="inline-flex h-12 items-center gap-2.5 rounded-full bg-primary-foreground px-8 text-sm font-bold text-foreground transition-all hover:bg-primary-foreground/90 shadow-lg shadow-black/20"
                >
                  Get Started Free <ArrowRight size={15} />
                </Link>
              )}
              <Link
                href="/about"
                className="inline-flex h-12 items-center gap-2.5 rounded-full border border-primary-foreground/15 px-8 text-sm font-semibold text-primary-foreground/70 transition-all hover:bg-primary-foreground/5 hover:text-primary-foreground"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
