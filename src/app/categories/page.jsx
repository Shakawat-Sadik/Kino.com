"use client";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Cpu, Armchair, Car, Shirt, Smartphone, BookOpen,
  ArrowUpRight, Gamepad2, Camera, Dumbbell,
  GraduationCap, Briefcase, Music, Utensils, Baby,
} from "lucide-react";
import { EASE_OUT } from "@/lib/ease";
import { Suspense } from "react";
import { getProducts } from "@/lib/action/action";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { name: "Electronics", icon: Cpu, color: "text-chart-1", bg: "from-chart-1/15 to-chart-1/5", border: "hover:border-chart-1/30", desc: "Laptops, cameras, headphones, gadgets & more" },
  { name: "Mobile Phones", icon: Smartphone, color: "text-chart-5", bg: "from-chart-5/15 to-chart-5/5", border: "hover:border-chart-5/30", desc: "Smartphones, tablets, accessories & cases" },
  { name: "Furniture", icon: Armchair, color: "text-chart-2", bg: "from-chart-2/15 to-chart-2/5", border: "hover:border-chart-2/30", desc: "Tables, chairs, sofas, beds & storage" },
  { name: "Vehicles", icon: Car, color: "text-chart-3", bg: "from-chart-3/15 to-chart-3/5", border: "hover:border-chart-3/30", desc: "Cars, bikes, cycles & accessories" },
  { name: "Fashion", icon: Shirt, color: "text-chart-4", bg: "from-chart-4/15 to-chart-4/5", border: "hover:border-chart-4/30", desc: "Clothing, shoes, bags & watches" },
  { name: "Books", icon: BookOpen, color: "text-chart-1", bg: "from-chart-1/10 to-chart-1/3", border: "hover:border-chart-1/30", desc: "Textbooks, novels, guides & magazines" },
  { name: "Sports & Fitness", icon: Dumbbell, color: "text-chart-3", bg: "from-chart-3/10 to-chart-3/3", border: "hover:border-chart-3/30", desc: "Gym equipment, outdoor gear & sportswear" },
  { name: "Gaming", icon: Gamepad2, color: "text-chart-5", bg: "from-chart-5/10 to-chart-5/3", border: "hover:border-chart-5/30", desc: "Consoles, games, controllers & setups" },
  { name: "Cameras", icon: Camera, color: "text-chart-2", bg: "from-chart-2/10 to-chart-2/3", border: "hover:border-chart-2/30", desc: "DSLRs, lenses, tripods & accessories" },
  { name: "Education", icon: GraduationCap, color: "text-chart-4", bg: "from-chart-4/10 to-chart-4/3", border: "hover:border-chart-4/30", desc: "Study materials, instruments & supplies" },
  { name: "Jobs & Services", icon: Briefcase, color: "text-chart-1", bg: "from-chart-1/10 to-chart-1/3", border: "hover:border-chart-1/30", desc: "Office equipment, tools & services" },
  { name: "Music", icon: Music, color: "text-chart-3", bg: "from-chart-3/10 to-chart-3/3", border: "hover:border-chart-3/30", desc: "Instruments, speakers & audio gear" },
];

function CategoryGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {CATEGORIES.map(({ name, icon: Icon, color, bg, border, desc }, i) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: (i % 4) * 0.06 }}
          whileHover={{ y: -6, transition: { duration: 0.25 } }}
        >
          <Link
            href={`/products?category=${encodeURIComponent(name)}`}
            className={`group relative flex items-start gap-5 rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 ${border} overflow-hidden`}
          >
            {/* Background glow on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${bg} border border-border/40 ${color} shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300`}>
              <Icon size={24} strokeWidth={1.5} />
            </span>

            <div className="relative flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground group-hover:text-chart-3 transition-colors">
                  {name}
                </h3>
                <ArrowUpRight size={14} className="text-muted-foreground/40 group-hover:text-chart-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function CategoryGridSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card p-6 flex items-start gap-5">
          <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
        <div className="absolute -top-20 right-1/4 h-80 w-80 rounded-full bg-chart-3/10 blur-[80px]" />
        <div className="absolute -bottom-20 left-1/3 h-60 w-60 rounded-full bg-chart-1/10 blur-[60px]" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground"
          >
            12 Categories
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-tight"
          >
            Browse <span className="text-chart-3">Categories</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Explore thousands of pre-owned items across all categories. From electronics to fashion, find exactly what you need.
          </motion.p>
        </div>
      </section>

      {/* Category Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:pb-28">
        <Suspense fallback={<CategoryGridSkeleton />}>
          <CategoryGrid />
        </Suspense>
      </section>
    </div>
  );
}