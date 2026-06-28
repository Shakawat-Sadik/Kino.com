"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/ease";
import { Tag } from "lucide-react";

const TILT_MAX = 8;
const TILT_SPRING = { stiffness: 300, damping: 28 };
const GLOW_SPRING = { stiffness: 180, damping: 22 };

const CONDITION_COLOR = {
  "Like New": { classes: "bg-chart-2/10 text-chart-2 border-chart-2/20", glow: "#22c55e" },
  Good:        { classes: "bg-chart-3/10 text-chart-3 border-chart-3/20", glow: "#86efac" },
  Used:        { classes: "bg-chart-4/10 text-chart-4 border-chart-4/20", glow: "#f59e0b" },
  Refurbished: { classes: "bg-chart-1/10 text-chart-1 border-chart-1/20", glow: "#60a5fa" },
};
const DEFAULT_GLOW = "#a78bfa";

function Card({ product, dimmed, onHoverStart, onHoverEnd }) {
  const image = product.images?.[0] || null;
  const condition = CONDITION_COLOR[product.condition];
  const conditionClass = condition?.classes || "bg-muted text-muted-foreground border-border";
  const glowColor = condition?.glow || DEFAULT_GLOW;

  const cardRef = useRef(null);
  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);
  const rawRotateX = useTransform(normY, [0, 1], [TILT_MAX, -TILT_MAX]);
  const rawRotateY = useTransform(normX, [0, 1], [-TILT_MAX, TILT_MAX]);
  const rotateX = useSpring(rawRotateX, TILT_SPRING);
  const rotateY = useSpring(rawRotateY, TILT_SPRING);
  const glowOpacity = useSpring(0, GLOW_SPRING);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    normX.set((e.clientX - rect.left) / rect.width);
    normY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseEnter = () => {
    glowOpacity.set(1);
    onHoverStart?.();
  };

  const handleMouseLeave = () => {
    normX.set(0.5);
    normY.set(0.5);
    glowOpacity.set(0);
    onHoverEnd?.();
  };

  return (
    <motion.article
      ref={cardRef}
      animate={{ scale: dimmed ? 0.97 : 1, opacity: dimmed ? 0.5 : 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* Static tint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl z-0"
        style={{ background: `radial-gradient(ellipse at 20% 20%, ${glowColor}12, transparent 65%)` }}
      />
      {/* Hover glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl z-0"
        style={{
          opacity: glowOpacity,
          background: `radial-gradient(ellipse at 20% 20%, ${glowColor}28, transparent 65%)`,
        }}
      />
      {/* Shimmer sweep */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[55%] -translate-x-full -skew-x-12 bg-linear-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[280%] z-10"
      />

      {/* Image */}
      <div className="relative z-10 aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/30">
            <Tag size={40} strokeWidth={1} />
          </div>
        )}
        {product.condition && (
          <span className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${conditionClass}`}>
            {product.condition}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-4">
        {product.category && (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {product.category}
          </p>
        )}
        <h3 className="line-clamp-2 flex-1 text-sm font-semibold text-foreground">
          {product.title}
        </h3>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-base font-bold text-chart-3">
            ৳{product.price?.toLocaleString()}
          </span>
          <Button asChild size="sm" variant="outline" className="h-7 rounded-full px-3 text-xs">
            <Link href={`/products/${product._id}`}>View</Link>
          </Button>
        </div>
      </div>

      {/* Accent bottom line */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 z-10 h-[2px] w-0 rounded-full transition-all duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(to right, ${glowColor}80, transparent)` }}
      />
    </motion.article>
  );
}

export function ProductCard({ product, index = 0, dimmed, onHoverStart, onHoverEnd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: (index % 8) * 0.05 }}
      className="h-full"
    >
      <Card
        product={product}
        dimmed={dimmed}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
      />
    </motion.div>
  );
}

export function ProductCardStatic({ product }) {
  return <Card product={product} />;
}
