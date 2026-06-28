import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductsClient from "@/components/All/Products/ProductsClient";

export const metadata = { title: "All Products | Kino.com" };

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-chart-3">
          Marketplace
        </p>
        <h1 className="mt-1 text-3xl font-black text-foreground md:text-4xl">
          All Products
        </h1>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <ProductsClient />
      </Suspense>
    </div>
  );
}
