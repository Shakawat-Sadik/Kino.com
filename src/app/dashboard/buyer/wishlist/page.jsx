"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getWishlist, removeFromWishlist } from "@/lib/action/action";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Heart, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/All/dashboard/shared/StatusBadge";

export default function BuyerWishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await getWishlist();
      setItems(res.success ? res.result : []);
      setLoading(false);
    };
    load();
  }, []);

  const handleRemove = async (productId) => {
    setRemoving(productId);
    const res = await removeFromWishlist(productId);
    if (res.success) {
      toast.success("Removed from wishlist");
      setItems((prev) => prev.filter((p) => p._id !== productId));
    } else {
      toast.error(res.message || "Failed to remove");
    }
    setRemoving(null);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
              <div className="h-44 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl py-16 text-center">
          <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Your wishlist is empty</p>
          <p className="text-xs text-muted-foreground mt-1">
            Browse products and save ones you like
          </p>
          <Link
            href="/products"
            className="inline-block mt-4 text-xs font-semibold text-primary hover:underline"
          >
            Browse Products →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence initial={false}>
            {items.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-44 bg-muted overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                      No image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={product.status} />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                      {product.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {product.category} · {product.condition}
                    </p>
                  </div>
                  <p className="text-lg font-black text-foreground">
                    ৳{product.price?.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product._id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(product._id)}
                      disabled={removing === product._id}
                      className="px-3 text-red-500 border-red-500/30 hover:bg-red-500/10"
                    >
                      {removing === product._id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
