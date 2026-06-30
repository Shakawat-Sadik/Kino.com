"use client";
import { motion } from "motion/react";
import { UserPlus, Camera, Search, CreditCard, Truck } from "lucide-react";
import { EASE_OUT } from "@/lib/ease";

const STEPS = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Account",
    desc: "Sign up for free in seconds with email or Google. Set your role as buyer or seller.",
    color: "text-chart-1",
    ring: "ring-chart-1/15 group-hover:ring-chart-1/30",
    bg: "bg-chart-1/8",
  },
  {
    step: "02",
    icon: Camera,
    title: "List or Browse",
    desc: "Sellers upload products with photos. Buyers explore thousands of pre-owned items.",
    color: "text-chart-2",
    ring: "ring-chart-2/15 group-hover:ring-chart-2/30",
    bg: "bg-chart-2/8",
  },
  {
    step: "03",
    icon: Search,
    title: "Find Your Deal",
    desc: "Search, filter, and compare products. Read reviews from real buyers.",
    color: "text-chart-3",
    ring: "ring-chart-3/15 group-hover:ring-chart-3/30",
    bg: "bg-chart-3/8",
  },
  {
    step: "04",
    icon: CreditCard,
    title: "Pay Securely",
    desc: "Complete your purchase with Stripe. Every transaction is protected and encrypted.",
    color: "text-chart-4",
    ring: "ring-chart-4/15 group-hover:ring-chart-4/30",
    bg: "bg-chart-4/8",
  },
  {
    step: "05",
    icon: Truck,
    title: "Get Your Item",
    desc: "Seller ships the product. Track your order status in real-time from your dashboard.",
    color: "text-chart-5",
    ring: "ring-chart-5/15 group-hover:ring-chart-5/30",
    bg: "bg-chart-5/8",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-chart-1 mb-2"
          >
            Simple Process
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight"
          >
            How It Works
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE_OUT }}
            className="mx-auto mt-3 h-1 w-16 rounded-full bg-chart-1 origin-center"
          />
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-border/40 mx-16" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {STEPS.map(({ step, icon: Icon, title, desc, color, ring, bg }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.08 }}
                className="group relative"
              >
                <div className="text-center">
                  {/* Step circle */}
                  <div className="relative mx-auto mb-6">
                    <div className={`relative flex h-24 w-24 items-center justify-center rounded-3xl border border-border/50 bg-card ring-4 ${ring} transition-all duration-300 group-hover:shadow-lg`}>
                      <div className={`absolute inset-0 rounded-3xl ${bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      <Icon size={28} strokeWidth={1.5} className={`relative ${color}`} />
                    </div>
                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-primary-foreground text-[10px] font-black shadow-md">
                      {step}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-50 mx-auto">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}