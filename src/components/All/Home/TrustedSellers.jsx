"use client";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Package, ShieldCheck, ArrowUpRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/ease";

function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function locationLabel(location = {}) {
  if (typeof location === "string") return location;
  const parts = [location.area, location.district, location.division].filter(Boolean);
  return parts[0] || "Bangladesh";
}

export default function TrustedSellers({ sellers = [] }) {
  if (sellers.length === 0) return null;

  return (
    <section className="relative py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-chart-3 mb-2"
          >
            Top Rated
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight"
          >
            Trusted Sellers
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
            Our most active sellers delivering quality products across Bangladesh.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {sellers.map((seller, i) => (
            <motion.div
              key={seller._id ?? i}
              initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: EASE_OUT, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="group relative rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-chart-3/5 hover:border-chart-3/20"
            >
              {/* Top gradient accent bar */}
              <div className="h-1 bg-linear-to-r from-chart-3/60 via-chart-3 to-chart-3/60" />

              <div className="p-7">
                {/* Seller info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-linear-to-br from-chart-3/15 to-chart-3/5 ring-2 ring-chart-3/10">
                    {seller.image ? (
                      <Image
                        src={seller.image}
                        alt={seller.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-base font-bold text-chart-3">
                        {initials(seller.name)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-bold text-foreground">
                        {seller.name}
                      </p>
                      <ShieldCheck size={14} className="shrink-0 text-chart-3" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {locationLabel(seller.location)}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="rounded-xl bg-muted/50 p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Package size={13} className="text-chart-3" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Listings</span>
                    </div>
                    <p className="text-xl font-black text-foreground">{seller.productCount}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Star size={13} className="text-chart-3 fill-chart-3" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rating</span>
                    </div>
                    <p className="text-xl font-black text-foreground">4.8</p>
                  </div>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full border-border/60 hover:bg-chart-3/5 hover:border-chart-3/30 hover:text-chart-3 transition-all group-hover:shadow-sm"
                >
                  <Link href="/products">
                    Browse Listings <ArrowUpRight size={13} className="ml-1.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}