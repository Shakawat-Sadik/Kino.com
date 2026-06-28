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
    const duration = 2000;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, to]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const STAT_CONFIG = [
  { key: "totalProducts", label: "Products Listed", icon: Package, color: "text-chart-1" },
  { key: "totalSellers", label: "Active Sellers", icon: Users, color: "text-chart-2" },
  { key: "totalBuyers", label: "Happy Buyers", icon: ShoppingCart, color: "text-chart-3" },
  { key: "totalOrders", label: "Orders Completed", icon: CheckCircle2, color: "text-chart-4" },
];

export default function StatsSection({ stats }) {
  return (
    <section className="bg-foreground py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-background/40">
            By the numbers
          </p>
          <h2 className="mt-1 text-3xl font-black text-background md:text-4xl">
            Marketplace at a Glance
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STAT_CONFIG.map(({ key, label, icon: Icon, color }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 rounded-2xl bg-background/5 p-6 text-center"
            >
              <Icon size={24} className={color} />
              <p className="text-3xl font-black text-background md:text-4xl">
                <CountUp to={stats?.[key] ?? 0} />
              </p>
              <p className="text-sm text-background/60">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
