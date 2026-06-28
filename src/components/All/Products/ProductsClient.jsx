"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { getProducts } from "@/lib/action/action";
import { ProductCard } from "./ProductCard";
import { SpecializedPagination } from "@/components/All/dashboard/shared/SpecializedPagination";
import { ActionSwapText } from "@/components/motion/action-swap";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = [
  "Electronics",
  "Furniture",
  "Vehicles",
  "Fashion",
  "Mobile Phones",
  "Books",
];
const CONDITIONS = ["Like New", "Good", "Used", "Refurbished"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];
const LIMIT = 12;

function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductsClient() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [condition, setCondition] = useState("all");
  const [sort, setSort] = useState("newest");
  const [hoveredId, setHoveredId] = useState(null);
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(() => {
    const query = { limit: LIMIT, page };
    if (debouncedSearch) query.search = debouncedSearch;
    if (category !== "all") query.category = category;
    if (condition !== "all") query.condition = condition;
    if (sort === "price_asc") { query.sort = "price"; query.order = "asc"; }
    if (sort === "price_desc") { query.sort = "price"; query.order = "desc"; }

    startTransition(async () => {
      const data = await getProducts(query);
      setProducts(data?.result ?? []);
      setTotal(data?.total ?? 0);
    });
  }, [debouncedSearch, category, condition, sort, page]);

  useEffect(() => {
    // Skip on mount only if initial category came from URL (already shown by server)
    // but since this is fully client-driven, always fetch
    fetchProducts();
  }, [fetchProducts]);

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const hasFilters =
    debouncedSearch ||
    category !== "all" ||
    condition !== "all" ||
    sort !== "newest";

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setCondition("all");
    setSort("newest");
    setPage(1);
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className="h-9 rounded-full pl-8"
          />
        </div>

        <Select value={category} onValueChange={resetPage(setCategory)}>
          <SelectTrigger className="h-9 min-w-36 w-auto rounded-full text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={condition} onValueChange={resetPage(setCondition)}>
          <SelectTrigger className="h-9 min-w-32 w-auto rounded-full text-xs">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Condition</SelectItem>
            {CONDITIONS.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={resetPage(setSort)}>
          <SelectTrigger className="h-9 min-w-44 w-auto rounded-full text-xs">
            <SlidersHorizontal size={12} className="mr-1 shrink-0 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 gap-1.5 rounded-full text-xs text-muted-foreground"
          >
            <X size={12} />
            Clear
          </Button>
        )}
      </div>

      {/* Result count */}
      <p className="mb-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          <ActionSwapText value={`${total}-${isPending}`} animation="roll">
            {isPending ? "..." : total.toLocaleString()}
          </ActionSwapText>
        </span>{" "}
        product{total !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center"
        >
          <p className="text-5xl">🔍</p>
          <p className="mt-4 text-lg font-semibold text-foreground">
            No products found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-5 rounded-full"
            >
              Clear all filters
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard
              key={p._id}
              product={p}
              index={i}
              dimmed={hoveredId !== null && hoveredId !== p._id}
              onHoverStart={() => setHoveredId(p._id)}
              onHoverEnd={() => setHoveredId(null)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isPending && total > LIMIT && (
        <div className="mt-8">
          <SpecializedPagination
            page={page}
            total={total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
