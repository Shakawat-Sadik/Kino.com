"use client";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Cpu,
  Armchair,
  Car,
  Shirt,
  Smartphone,
  BookOpen,
  ArrowUpRight,
  Dumbbell,
  Gamepad2,
  Camera,
  GraduationCap,
  Briefcase,
  Music,
  Package,
} from "lucide-react";
import { EASE_OUT } from "@/lib/ease";

const CATEGORIES = [
  { name: "Electronics",    icon: Cpu,          color: "text-chart-1", bg: "from-chart-1/15 to-chart-1/5",  border: "hover:border-chart-1/30", count: "2.5k+", desc: "Laptops, cameras, gadgets" },
  { name: "Mobile Phones",  icon: Smartphone,   color: "text-chart-5", bg: "from-chart-5/15 to-chart-5/5",  border: "hover:border-chart-5/30", count: "1.8k+", desc: "Phones, tablets, cases" },
  { name: "Furniture",      icon: Armchair,     color: "text-chart-2", bg: "from-chart-2/15 to-chart-2/5",  border: "hover:border-chart-2/30", count: "1.2k+", desc: "Tables, chairs, sofas" },
  { name: "Vehicles",       icon: Car,          color: "text-chart-3", bg: "from-chart-3/15 to-chart-3/5",  border: "hover:border-chart-3/30", count: "890+",  desc: "Cars, bikes, accessories" },
  { name: "Fashion",        icon: Shirt,        color: "text-chart-4", bg: "from-chart-4/15 to-chart-4/5",  border: "hover:border-chart-4/30", count: "3.1k+", desc: "Clothing, shoes, bags" },
  { name: "Books",          icon: BookOpen,     color: "text-chart-1", bg: "from-chart-1/10 to-chart-1/3",  border: "hover:border-chart-1/30", count: "640+",  desc: "Textbooks, novels, guides" },
  { name: "Sports & Fitness", icon: Dumbbell,   color: "text-chart-3", bg: "from-chart-3/10 to-chart-3/3",  border: "hover:border-chart-3/30", count: "720+",  desc: "Gym gear, outdoor & sportswear" },
  { name: "Gaming",         icon: Gamepad2,     color: "text-chart-5", bg: "from-chart-5/10 to-chart-5/3",  border: "hover:border-chart-5/30", count: "950+",  desc: "Consoles, games, controllers" },
  { name: "Cameras",        icon: Camera,       color: "text-chart-2", bg: "from-chart-2/10 to-chart-2/3",  border: "hover:border-chart-2/30", count: "410+",  desc: "Cameras, lenses, accessories" },
  { name: "Education",      icon: GraduationCap,color: "text-chart-4", bg: "from-chart-4/10 to-chart-4/3",  border: "hover:border-chart-4/30", count: "530+",  desc: "Study materials & supplies" },
  { name: "Jobs & Services",icon: Briefcase,    color: "text-chart-1", bg: "from-chart-1/10 to-chart-1/3",  border: "hover:border-chart-1/30", count: "300+",  desc: "Office tools & services" },
  { name: "Music",          icon: Music,        color: "text-chart-3", bg: "from-chart-3/10 to-chart-3/3",  border: "hover:border-chart-3/30", count: "280+",  desc: "Instruments & audio gear" },
  { name: "Others",         icon: Package,      color: "text-chart-2", bg: "from-chart-2/10 to-chart-2/3",  border: "hover:border-chart-2/30", count: "400+",  desc: "Everything else" },
];

export default function CategoriesSection() {
  return (
    <section className="relative py-20 md:py-28">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-muted/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-chart-3 mb-2"
          >
            Shop by
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight"
          >
            Popular Categories
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE_OUT }}
            className="mx-auto mt-3 h-1 w-16 rounded-full bg-chart-3 origin-center"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ name, icon: Icon, color, bg, border, count, desc }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.06 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              <Link
                href={`/products?category=${encodeURIComponent(name)}`}
                className={`group relative flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-linear-to-br ${bg} bg-card p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-black/5 ${border} overflow-hidden`}
              >
                {/* Background glow on hover */}
                <div className={`absolute inset-0 bg-linear-to-br ${bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <span className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border/50 shadow-sm group-hover:shadow-md transition-all duration-300 ${color} group-hover:scale-110`}>
                  <Icon size={24} strokeWidth={1.5} />
                </span>
                <div className="relative">
                  <span className="text-sm font-bold text-foreground block">
                    {name}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">{count} items</span>
                </div>

                {/* Arrow indicator */}
                <span className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 ${color}`}>
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Browse all categories CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-chart-3 hover:text-chart-3/80 transition-colors"
          >
            Browse all categories
            <ArrowUpRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}