"use client";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Package, ShieldCheck } from "lucide-react";
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
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-chart-3">
          Top Rated
        </p>
        <h2 className="mt-1 text-3xl font-black text-foreground md:text-4xl">
          Trusted Sellers
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Our most active sellers delivering quality products across Bangladesh.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sellers.map((seller, i) => (
          <motion.div
            key={seller._id ?? i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-chart-3/15">
                {seller.image ? (
                  <Image
                    src={seller.image}
                    alt={seller.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-bold text-chart-3">
                    {initials(seller.name)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-foreground">
                    {seller.name}
                  </p>
                  <ShieldCheck size={13} className="shrink-0 text-chart-3" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {locationLabel(seller.location)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package size={13} />
              <span>
                <span className="font-semibold text-foreground">
                  {seller.productCount}
                </span>{" "}
                active listings
              </span>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full rounded-full text-xs"
            >
              <Link href="/products">Browse Listings</Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
