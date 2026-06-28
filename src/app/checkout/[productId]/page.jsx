"use client";
import { use, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { getProductById } from "@/lib/action/action";
import CheckoutForm from "@/components/All/payments/CheckoutForm";
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage({ params }) {
  const { productId } = use(params);
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getProductById(productId).then((res) => {
      if (res.success) setProduct(res.result);
      else setNotFound(true);
    });
  }, [productId]);

  if (notFound) {
    return (
      <div className="text-center py-24">
        <p className="text-lg font-semibold text-foreground">Product not found</p>
        <p className="text-sm text-muted-foreground mt-1">It may have been sold or removed.</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="grid sm:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-4">
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          <div className="h-56 w-full bg-muted rounded-2xl animate-pulse mt-4" />
        </div>
        <div className="h-72 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  const image = Array.isArray(product.images) ? product.images[0] : product.image;

  return (
    <div className="grid sm:grid-cols-[1fr_360px] gap-8 items-start">
      {/* Product summary */}
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Complete your purchase</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review your item and pay securely with Stripe</p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {image && (
            <div className="relative aspect-video w-full bg-muted">
              <Image src={image} alt={product.title} fill unoptimized className="object-cover" />
            </div>
          )}
          <div className="p-5 space-y-3">
            <div>
              <p className="font-semibold text-foreground">{product.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {product.condition} · {product.category}
              </p>
              {product.sellerName && (
                <p className="text-xs text-muted-foreground mt-0.5">Sold by {product.sellerName}</p>
              )}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Total due</span>
              <span className="text-2xl font-black text-foreground">
                ৳ {product.price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment panel */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <p className="text-sm font-semibold text-foreground">Payment details</p>
        <Elements stripe={stripePromise}>
          <CheckoutForm product={product} />
        </Elements>
      </div>
    </div>
  );
}
