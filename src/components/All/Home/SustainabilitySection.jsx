"use client";
import { motion } from "motion/react";
import { Leaf, Recycle, TrendingDown, Heart } from "lucide-react";
import { EASE_OUT } from "@/lib/ease";

const IMPACTS = [
  {
    icon: Recycle,
    label: "Items Reused",
    stat: "10,000+",
    desc: "Products given a second life instead of going to landfill.",
    color: "text-chart-2",
    progress: 82,
  },
  {
    icon: TrendingDown,
    label: "Waste Reduced",
    stat: "60 tons",
    desc: "Estimated waste diverted through pre-owned commerce.",
    color: "text-chart-3",
    progress: 68,
  },
  {
    icon: Leaf,
    label: "CO\u2082 Saved",
    stat: "180 tonnes",
    desc: "Carbon emissions avoided by choosing second-hand.",
    color: "text-chart-1",
    progress: 74,
  },
  {
    icon: Heart,
    label: "Families Helped",
    stat: "5,000+",
    desc: "Families who saved or earned money through Kino.com.",
    color: "text-chart-4",
    progress: 90,
  },
];

export default function SustainabilitySection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Green tinted background */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-chart-2/4 to-transparent" />
      <div className="absolute top-0 right-0 h-87.5 w-87.5 rounded-full bg-chart-2/8 blur-[100px]" />
      <div className="absolute bottom-0 left-1/4 h-62.5 w-62.5 rounded-full bg-chart-1/8 blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-chart-2 mb-2"
          >
            Our Impact
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight"
          >
            Sustainability Impact
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE_OUT }}
            className="mx-auto mt-3 h-1 w-16 rounded-full bg-chart-2 origin-center"
          />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground leading-relaxed"
          >
            Every second-hand purchase reduces waste and helps our planet breathe easier. Together we&apos;re building a more sustainable future for Bangladesh.
          </motion.p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {IMPACTS.map(({ icon: Icon, label, stat, desc, color, progress }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="group relative rounded-2xl border border-border/50 bg-card p-7 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:border-border"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-current/15 to-current/5 ${color} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} strokeWidth={1.5} className={color} />
              </div>

              <p className="text-3xl font-black text-foreground leading-none">{stat}</p>
              <p className="mt-1.5 text-sm font-bold text-foreground">{label}</p>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{desc}</p>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 1, ease: EASE_OUT }}
                    className={`h-full rounded-full bg-linear-to-r ${color === "text-chart-2" ? "from-chart-2/60 to-chart-2" : color === "text-chart-3" ? "from-chart-3/60 to-chart-3" : color === "text-chart-1" ? "from-chart-1/60 to-chart-1" : "from-chart-4/60 to-chart-4"}`}
                    style={{ color: "transparent" }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}