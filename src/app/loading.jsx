"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const RINGS = [
  {
    rotate: [0, 360],
    duration: 3,
    ease: "linear",
    mask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
    gradient: "conic-gradient(from 0deg, transparent 0deg, currentColor 90deg, transparent 180deg)",
    opacity: 0.8,
  },
  {
    rotate: [0, 360],
    duration: 2.5,
    ease: [0.4, 0, 0.6, 1],
    mask: "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
    gradient: "conic-gradient(from 0deg, transparent 0deg, currentColor 120deg, transparent 360deg)",
    opacity: 0.9,
  },
  {
    rotate: [0, -360],
    duration: 4,
    ease: [0.4, 0, 0.6, 1],
    mask: "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
    gradient: "conic-gradient(from 180deg, transparent 0deg, currentColor 45deg, transparent 90deg)",
    opacity: 0.35,
  },
  {
    rotate: [0, 360],
    duration: 3.5,
    ease: "linear",
    mask: "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
    gradient: "conic-gradient(from 270deg, transparent 0deg, currentColor 20deg, transparent 40deg)",
    opacity: 0.5,
  },
];

export default function Loader({
  title = "Loading Kino.com",
  subtitle = "Fetching the latest listings for you",
  size = "md",
  className,
  ...props
}) {
  const sizeConfig = {
    sm: {
      container: "size-20",
      titleClass: "text-sm/tight font-medium",
      subtitleClass: "text-xs/relaxed",
      spacing: "space-y-2",
      maxWidth: "max-w-48",
    },
    md: {
      container: "size-32",
      titleClass: "text-base/snug font-medium",
      subtitleClass: "text-sm/relaxed",
      spacing: "space-y-3",
      maxWidth: "max-w-56",
    },
    lg: {
      container: "size-40",
      titleClass: "text-lg/tight font-semibold",
      subtitleClass: "text-base/relaxed",
      spacing: "space-y-4",
      maxWidth: "max-w-64",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-8 p-8", className)}
      {...props}
    >
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        className={cn("relative text-foreground", config.container)}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: [0.4, 0, 0.6, 1] }}
      >
        {RINGS.map((ring, i) => (
          <motion.div
            key={i}
            animate={{ rotate: ring.rotate }}
            className="absolute inset-0 rounded-full"
            style={{
              background: ring.gradient,
              mask: ring.mask,
              WebkitMask: ring.mask,
              opacity: ring.opacity,
            }}
            transition={{
              duration: ring.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: ring.ease,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={cn("text-center", config.spacing, config.maxWidth)}
        initial={{ opacity: 0, y: 12 }}
        transition={{ delay: 0.4, duration: 1, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className={cn(config.titleClass, "text-foreground leading-[1.15] tracking-[-0.02em] antialiased")}
          initial={{ opacity: 0, y: 12 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.span
            animate={{ opacity: [0.9, 0.7, 0.9] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: [0.4, 0, 0.6, 1] }}
          >
            {title}
          </motion.span>
        </motion.h1>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className={cn(config.subtitleClass, "text-muted-foreground font-normal leading-[1.45] tracking-[-0.01em] antialiased")}
          initial={{ opacity: 0, y: 8 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.span
            animate={{ opacity: [0.6, 0.4, 0.6] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: [0.4, 0, 0.6, 1] }}
          >
            {subtitle}
          </motion.span>
        </motion.p>
      </motion.div>
    </div>
  );
}
