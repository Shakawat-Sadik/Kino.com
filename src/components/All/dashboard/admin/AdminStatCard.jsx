"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Users, Package, ShoppingCart } from "lucide-react";

/**
 * AdminStatCard
 *
 * Props:
 *   title       string   — card label e.g. "Total Users"
 *   value       number   — the stat number
 *   icon        string   — icon key from iconSet
 *   color       string   — tailwind color classes for icon bg + text
 *   trend       string   — optional e.g. "+12% this month" (purely display)
 *   loading     boolean  — shows skeleton when true
 *   index       number   — stagger delay index for entrance animation
 */

const iconSet = {
  Users,
  Package,
  ShoppingCart,
};

export function AdminStatCard({
  title,
  value,
  icon,
  color,
  trend,
  loading = false,
  index = 0,
}) {

  const Icon = iconSet[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: "easeOut",
      }}
      className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4"
    >
      {/* Icon */}
      <div
        className={cn(
          "p-2.5 rounded-xl shrink-0",
          color?.bg || "bg-primary/10",
        )}
      >
        {Icon && (
          <Icon className={cn("h-5 w-5", color?.text || "text-primary")} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground font-medium truncate">
          {title}
        </p>

        {loading ? (
          <div className="mt-1.5 h-7 w-24 rounded-lg bg-muted animate-pulse" />
        ) : (
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-black text-foreground mt-0.5"
          >
            {value?.toLocaleString() ?? "—"}
          </motion.p>
        )}

        {trend && !loading && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </div>
    </motion.div>
  );
}
