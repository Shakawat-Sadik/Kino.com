"use client";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/ease";
import { ArrowRight, Tag, Heart, Eye } from "lucide-react";

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
      initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay: (index % 4) * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-chart-3/5 hover:border-chart-3/20"
    >
      {/* Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/20">
            <Tag size={48} strokeWidth={1} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick actions on hover */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-foreground shadow-md hover:bg-white transition-colors">
            <Heart size={14} />
          </button>
          <Button
            asChild
            size="sm"
            className="h-8 rounded-full px-4 text-xs bg-white/90 backdrop-blur-sm text-foreground hover:bg-white shadow-md"
          >
            <Link href={`/products/${product._id}`}>
              <Eye size={12} className="mr-1" /> View
            </Link>
          </Button>
        </div>

        {product.condition && (
          <span
            className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm ${conditionClass}`}
          >
            {product.condition}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            {product.category}
          </p>
        )}
        <h3 className="line-clamp-2 flex-1 text-sm font-semibold text-foreground leading-snug group-hover:text-chart-3 transition-colors duration-200">
          {product.title}
        </h3>
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] text-muted-foreground">Price</p>
            <span className="text-lg font-black text-chart-3 leading-tight">
              ৳{product.price?.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-chart-2" />
            Available
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function FeaturedProducts({ products = [] }) {
  return (
    <section id="featured" className="mx-auto max-w-7xl px-4 py-20 md:py-28">
      <div className="mb-12 flex items-end justify-between gap-4">
        <div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-chart-3 mb-2"
          >
            Fresh Listings
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight"
          >
            Featured Products
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, ease: EASE_OUT }}
            className="mt-3 h-1 w-16 rounded-full bg-chart-3 origin-left"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Button
            asChild
            variant="outline"
            className="hidden sm:flex rounded-full px-6 hover:bg-chart-3/5 hover:border-chart-3/30 hover:text-chart-3 transition-all"
          >
            <Link href="/products">
              View All <ArrowRight size={14} className="ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>

      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-16 text-center"
        >
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
            <Tag size={28} className="text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium">No products yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Check back soon for fresh listings!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      )}

      <div className="mt-10 text-center sm:hidden">
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/products">
            View All Products <ArrowRight size={14} className="ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}