"use client";
import { motion, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { Package, Users, ShoppingCart, CheckCircle2 } from "lucide-react";
import { EASE_OUT } from "@/lib/ease";

function CountUp({ to }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || !to) return;
    let frame;
    const start = performance.now();
    const duration = 2200;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setCount(Math.round(eased * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, to]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const STAT_CONFIG = [
  { key: "totalProducts", label: "Products Listed", icon: Package, color: "text-chart-1", bg: "from-chart-1/20 to-chart-1/5" },
  { key: "totalSellers", label: "Active Sellers", icon: Users, color: "text-chart-2", bg: "from-chart-2/20 to-chart-2/5" },
  { key: "totalBuyers", label: "Happy Buyers", icon: ShoppingCart, color: "text-chart-3", bg: "from-chart-3/20 to-chart-3/5" },
  { key: "totalOrders", label: "Orders Completed", icon: CheckCircle2, color: "text-chart-4", bg: "from-chart-4/20 to-chart-4/5" },
];

export default function StatsSection({ stats }) {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-foreground via-foreground/95 to-foreground/90" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-4"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating accent orbs */}
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-chart-3/10 blur-[80px]" />
      <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-chart-1/10 blur-[60px]" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/30 mb-2"
          >
            By the numbers
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-primary-foreground tracking-tight"
          >
            Marketplace at a Glance
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE_OUT }}
            className="mx-auto mt-3 h-1 w-16 rounded-full bg-chart-3 origin-center"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.25 } }}
              className="relative group"
            >
              <div className="relative rounded-2xl bg-primary-foreground/6 backdrop-blur-sm border border-primary-foreground/8 p-8 text-center overflow-hidden transition-all duration-300 hover:bg-primary-foreground/10 hover:border-primary-foreground/15">
                {/* Background glow */}
                <div className={`absolute inset-0 bg-linear-to-br ${bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative">
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/6 ${color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <p className="text-4xl md:text-5xl font-black text-primary-foreground leading-none">
                    <CountUp to={stats?.[key] ?? 0} />
                  </p>
                  <p className="mt-3 text-sm font-medium text-primary-foreground/50">
                    {label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}