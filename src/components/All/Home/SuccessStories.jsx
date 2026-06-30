"use client";
import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { EASE_OUT } from "@/lib/ease";

function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function SuccessStories({ reviews = [] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 h-100 w-100 rounded-full bg-chart-3/5 blur-[100px]" />
      <div className="absolute top-1/3 right-0 h-100 w-100 rounded-full bg-chart-1/5 blur-[80px]" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-chart-3 mb-2"
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight"
          >
            Success Stories
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE_OUT }}
            className="mx-auto mt-3 h-1 w-16 rounded-full bg-chart-3 origin-center"
          />
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="mx-auto mt-4 max-w-md text-sm text-muted-foreground leading-relaxed"
          >
            Real buyers sharing their Kino.com experience.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reviews.slice(0, 3).map((r, i) => {
            const name = r.reviewerInfo?.name || "Anonymous";
            const rating = Math.min(5, Math.max(1, r.rating ?? 5));

            return (
              <motion.div
                key={r._id ?? i}
                initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, ease: EASE_OUT, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="group relative flex flex-col rounded-2xl border border-border/50 bg-card p-7 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-chart-3/5 hover:border-chart-3/20"
              >
                {/* Quote icon */}
                <div className="absolute top-6 right-6 text-chart-3/10 group-hover:text-chart-3/20 transition-colors">
                  <Quote size={32} />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className={j < rating ? "fill-chart-3 text-chart-3" : "fill-muted text-muted"}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="flex-1 text-sm leading-[1.75] text-muted-foreground italic">
                  &ldquo;{r.comment || "Great experience on Kino.com! Highly recommended for buying and selling pre-owned items."}&rdquo;
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3.5 pt-5 border-t border-border/50">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-chart-3/20 to-chart-3/5 text-sm font-bold text-chart-3 ring-2 ring-chart-3/10">
                    {initials(name)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{name}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">Verified Buyer</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}