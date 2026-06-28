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
  },
  {
    icon: TrendingDown,
    label: "Waste Reduced",
    stat: "60 tons",
    desc: "Estimated waste diverted through pre-owned commerce.",
  },
  {
    icon: Leaf,
    label: "CO₂ Saved",
    stat: "180 tonnes",
    desc: "Carbon emissions avoided by choosing second-hand.",
  },
  {
    icon: Heart,
    label: "Families Helped",
    stat: "5,000+",
    desc: "Families who saved or earned money through Kino.com.",
  },
];

export default function SustainabilitySection() {
  return (
    <section className="py-16 md:py-20" style={{ background: "hsl(var(--chart-2) / 0.05)" }}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-chart-2">
            Our Impact
          </p>
          <h2 className="mt-1 text-3xl font-black text-foreground md:text-4xl">
            Sustainability Impact
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Every second-hand purchase reduces waste and helps our planet
            breathe easier.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {IMPACTS.map(({ icon: Icon, label, stat, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6 text-center"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-chart-2/10 text-chart-2">
                <Icon size={20} />
              </div>
              <p className="text-2xl font-black text-foreground">{stat}</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
