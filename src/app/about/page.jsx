"use client";
import { motion } from "motion/react";
import Link from "next/link";
import {
  ShieldCheck,
  Leaf,
  Users,
  TrendingUp,
  Target,
  Heart,
  Globe,
  Award,
  ArrowRight,
  SquaresExclude,
} from "lucide-react";
import { EASE_OUT } from "@/lib/ease";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    desc: "Every transaction is secured with Stripe. Our verification system ensures only genuine users participate in the marketplace.",
    color: "text-chart-3",
    bg: "from-chart-3/15 to-chart-3/5",
  },
  {
    icon: Leaf,
    title: "Sustainability First",
    desc: "We believe in reducing waste. Every item sold on Kino.com is one less item in a landfill, contributing to a greener Bangladesh.",
    color: "text-chart-2",
    bg: "from-chart-2/15 to-chart-2/5",
  },
  {
    icon: Users,
    title: "Community Driven",
    desc: "Our marketplace thrives on the trust between buyers and sellers. Reviews, ratings, and verified badges keep the community honest.",
    color: "text-chart-1",
    bg: "from-chart-1/15 to-chart-1/5",
  },
  {
    icon: TrendingUp,
    title: "Affordable Commerce",
    desc: "Pre-owned doesn't mean low quality. Find incredible deals on items that still have plenty of life left, at a fraction of the cost.",
    color: "text-chart-4",
    bg: "from-chart-4/15 to-chart-4/5",
  },
];

const STATS = [
  { value: "10,000+", label: "Products Listed", icon: Target },
  { value: "5,000+", label: "Active Users", icon: Users },
  { value: "1,500+", label: "Successful Transactions", icon: Award },
  { value: "64", label: "Districts Covered", icon: Globe },
];

const TEAM = [
  { name: "Sadik Islam", role: "Founder & Lead Developer", initial: "SI", color: "from-chart-3/20 to-chart-3/5" },
  { name: "Tamim Hasan", role: "UI/UX Designer", initial: "TH", color: "from-chart-1/20 to-chart-1/5" },
  { name: "Nusrat Jahan", role: "Product Manager", initial: "NJ", color: "from-chart-2/20 to-chart-2/5" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-chart-3/10 blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-chart-1/10 blur-[60px]" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <SquaresExclude size={12} className="text-chart-3" />
            About Kino.com
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-tight"
          >
            Reimagining Second-Hand{" "}
            <span className="text-chart-3">Commerce</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Kino.com is Bangladesh&apos;s trusted online marketplace where people buy and sell pre-owned products safely, affordably, and sustainably. We&apos;re on a mission to reduce waste while creating economic opportunity for everyone.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-chart-3 mb-2">Our Mission</p>
              <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                Making Sustainable Commerce Accessible
              </h2>
              <div className="mt-3 h-1 w-16 rounded-full bg-chart-3" />
              <p className="mt-6 text-sm text-muted-foreground leading-[1.8]">
                Many people own products that are still perfectly usable but no longer needed. These items end up in closets, garages, and eventually landfills. Kino.com was built to break this cycle.
              </p>
              <p className="mt-4 text-sm text-muted-foreground leading-[1.8]">
                We provide a safe, trusted platform where buyers can find affordable products and sellers can earn money from items they no longer use. Every transaction on Kino.com is a step towards reducing waste, promoting sustainable consumption, and creating economic opportunity for Bangladeshis across all 64 districts.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-chart-3 hover:text-chart-3/80 transition-colors"
              >
                Explore the marketplace <ArrowRight size={14} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
              className="relative"
            >
              <div className="rounded-3xl bg-gradient-to-br from-chart-3/10 via-chart-2/5 to-chart-1/10 p-10 border border-border/30">
                <div className="space-y-6">
                  {[
                    "Reduce waste by giving products a second life",
                    "Create earning opportunities for sellers",
                    "Provide affordable options for buyers",
                    "Build trust through transparency and reviews",
                    "Support sustainable consumption in Bangladesh",
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-chart-3/20">
                        <Heart size={12} className="text-chart-3" />
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="absolute -inset-4 rounded-[2rem] bg-chart-3/5 blur-xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.2em] text-chart-3 mb-2"
            >
              What We Stand For
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-4xl font-black text-foreground tracking-tight"
            >
              Our Core Values
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6, ease: EASE_OUT }}
              className="mx-auto mt-3 h-1 w-16 rounded-full bg-chart-3 origin-center"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {VALUES.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="group rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${bg} ${color} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-[1.75]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.08 }}
                className="text-center rounded-2xl border border-border/50 bg-card p-6"
              >
                <Icon size={20} className="mx-auto text-chart-3 mb-3" />
                <p className="text-3xl font-black text-foreground">{value}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-20 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.2em] text-chart-3 mb-2"
            >
              The People
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-4xl font-black text-foreground tracking-tight"
            >
              Meet Our Team
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6, ease: EASE_OUT }}
              className="mx-auto mt-3 h-1 w-16 rounded-full bg-chart-3 origin-center"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {TEAM.map(({ name, role, initial, color }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.1 }}
                className="text-center group"
              >
                <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-lg font-bold text-foreground ring-2 ring-border/30 group-hover:ring-chart-3/30 group-hover:scale-105 transition-all duration-300`}>
                  {initial}
                </div>
                <p className="text-sm font-bold text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}