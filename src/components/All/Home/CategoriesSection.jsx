"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { Cpu, Armchair, Car, Shirt, Smartphone, BookOpen } from "lucide-react";
import { EASE_OUT } from "@/lib/ease";

const CATEGORIES = [
  { name: "Electronics", icon: Cpu, color: "text-chart-1 bg-chart-1/10" },
  { name: "Furniture", icon: Armchair, color: "text-chart-2 bg-chart-2/10" },
  { name: "Vehicles", icon: Car, color: "text-chart-3 bg-chart-3/10" },
  { name: "Fashion", icon: Shirt, color: "text-chart-4 bg-chart-4/10" },
  { name: "Mobile Phones", icon: Smartphone, color: "text-chart-5 bg-chart-5/10" },
  { name: "Books", icon: BookOpen, color: "text-chart-1 bg-chart-1/10" },
];

export default function CategoriesSection() {
  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-chart-3">
            Shop by
          </p>
          <h2 className="mt-1 text-3xl font-black text-foreground md:text-4xl">
            Popular Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map(({ name, icon: Icon, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, ease: EASE_OUT, delay: i * 0.07 }}
              whileHover={{ scale: 1.04 }}
            >
              <Link
                href={`/products?category=${encodeURIComponent(name)}`}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center transition-shadow hover:shadow-md"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
                >
                  <Icon size={22} />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
