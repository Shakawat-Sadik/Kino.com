"use client";
import Link from "next/link";
import { motion } from "motion/react";
import ImageGallery from "./ImageGallery";
import WishlistButton from "./WishlistButton";
import ReviewSection from "./ReviewSection";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/All/dashboard/shared/StatusBadge";
import { EASE_OUT } from "@/lib/ease";
import {
  ShoppingBag,
  Phone,
  Mail,
  ChevronRight,
  Tag,
  Calendar,
} from "lucide-react";

const CONDITION_COLOR = {
  "Like New": "bg-chart-2/10 text-chart-2",
  Good: "bg-chart-3/10 text-chart-3",
  Used: "bg-chart-4/10 text-chart-4",
  Refurbished: "bg-chart-1/10 text-chart-1",
};

const fadeX = (dir, delay = 0) => ({
  initial: { opacity: 0, x: dir === "left" ? -24 : 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT, delay } },
});

export default function ProductDetail({ product, reviews = [] }) {
  const conditionClass =
    CONDITION_COLOR[product.condition] || "bg-muted text-muted-foreground";

  const uploadedDate = product.dateUploaded
    ? new Date(product.dateUploaded).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <ChevronRight size={12} />
        <span className="truncate text-foreground">{product.title}</span>
      </nav>

      {/* Main layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <motion.div {...fadeX("left")}>
          <ImageGallery images={product.images ?? []} />
        </motion.div>

        {/* Product info */}
        <motion.div {...fadeX("right", 0.08)} className="flex flex-col gap-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {product.category && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <Tag size={10} />
                {product.category}
              </span>
            )}
            {product.condition && (
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${conditionClass}`}
              >
                {product.condition}
              </span>
            )}
            <StatusBadge status={product.status} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black leading-tight text-foreground md:text-3xl">
            {product.title}
          </h1>

          {/* Price */}
          <span className="text-4xl font-black text-chart-3">
            ৳{product.price?.toLocaleString()}
          </span>

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {uploadedDate && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                Listed {uploadedDate}
              </span>
            )}
            {product.stock != null && (
              <span className="flex items-center gap-1">
                <ShoppingBag size={11} />
                {product.stock} in stock
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {product.status === "available" ? (
              <Button asChild className="h-11 rounded-full px-8 font-semibold">
                <Link href={`/checkout/${product._id}`}>
                  <ShoppingBag size={16} className="mr-2" />
                  Buy Now
                </Link>
              </Button>
            ) : (
              <Button
                disabled
                className="h-11 rounded-full px-8 font-semibold opacity-60"
              >
                Not Available
              </Button>
            )}
            <WishlistButton productId={product._id} />
          </div>

          {/* Seller info */}
          {product.sellerInfo && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Seller Information
              </p>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  {product.sellerInfo.name}
                </p>
                {product.sellerInfo.email && (
                  <a
                    href={`mailto:${product.sellerInfo.email}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Mail size={12} />
                    {product.sellerInfo.email}
                  </a>
                )}
                {product.sellerInfo.phone && (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone size={12} />
                    {product.sellerInfo.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Reviews */}
      <ReviewSection productId={product._id} initialReviews={reviews} />
    </div>
  );
}
