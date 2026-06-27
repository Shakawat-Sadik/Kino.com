"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * DashStatCard
 * Reused on both buyer and seller overview pages.
 *
 * Props:
 *   title    string     — label below the number
 *   value    number|string — the stat to display
 *   icon     LucideIcon — icon component
 *   color    { bg, text } — tailwind classes
 *   index    number     — stagger delay index
 *   loading  boolean
 */
export function DashStatCard({
  title,
  value,
  icon,
  color = {},
  index = 0,
  loading = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4"
    >
      {icon && (
        <div className={cn("p-2.5 rounded-xl shrink-0", color.bg || "bg-primary/10")}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{title}</p>
        {loading ? (
          <div className="mt-1.5 h-7 w-20 rounded-lg bg-muted animate-pulse" />
        ) : (
          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-2xl font-black text-foreground mt-0.5"
          >
            {value ?? "—"}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

export function DashStatCardSkeleton({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-7 w-14 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
