"use client";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/ease";
import { ArrowRight, Tag } from "lucide-react";

const CONDITION_COLOR = {
  "Like New": "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Good: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Used: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Refurbished: "bg-chart-1/10 text-chart-1 border-chart-1/20",
};

function ProductCard({ product, index }) {
  const image = product.images?.[0] || null;
  const conditionClass =
    CONDITION_COLOR[product.condition] ||
    "bg-muted text-muted-foreground border-border";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: (index % 4) * 0.08 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
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
          <span
            className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${conditionClass}`}
          >
            {product.condition}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
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
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-7 rounded-full px-3 text-xs"
          >
            <Link href={`/products/${product._id}`}>View</Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export default function FeaturedProducts({ products = [] }) {
  return (
    <section id="featured" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-chart-3">
            Fresh Listings
          </p>
          <h2 className="mt-1 text-3xl font-black text-foreground md:text-4xl">
            Featured Products
          </h2>
        </div>
        <Button
          asChild
          variant="outline"
          className="hidden rounded-full sm:flex"
        >
          <Link href="/products">
            All Products <ArrowRight size={14} className="ml-1.5" />
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No products yet — check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      )}

      <div className="mt-8 text-center sm:hidden">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/products">
            View All Products <ArrowRight size={14} className="ml-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
