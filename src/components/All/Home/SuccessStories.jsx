"use client";
import { motion } from "motion/react";
import { Star } from "lucide-react";
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
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-chart-3">
          Testimonials
        </p>
        <h2 className="mt-1 text-3xl font-black text-foreground md:text-4xl">
          Success Stories
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Real buyers sharing their Kino.com experience.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reviews.slice(0, 3).map((r, i) => {
          const name = r.reviewerInfo?.name || "Anonymous";
          const rating = Math.min(5, Math.max(1, r.rating ?? 5));

          return (
            <motion.div
              key={r._id ?? i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.1 }}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={13}
                    className="fill-chart-3 text-chart-3"
                  />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{r.comment || "Great experience on Kino.com!"}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chart-3/15 text-xs font-bold text-chart-3">
                  {initials(name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Buyer</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
