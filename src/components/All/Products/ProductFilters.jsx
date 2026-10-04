"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = [
  "Electronics", "Mobile Phones", "Furniture", "Vehicles", "Fashion",
  "Books", "Sports & Fitness", "Gaming", "Cameras", "Education",
  "Jobs & Services", "Music", "Others",
];
const CONDITIONS = ["Like New", "Good", "Used", "Refurbished"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export default function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") || "all";
  const condition = searchParams.get("condition") || "all";
  const sort = searchParams.get("sort") || "newest";

  // Only the text input needs local state (it is debounced).
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const pushParams = useCallback(
    (updates, { replace = false } = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        const isDefault =
          !v || v === "all" || (k === "sort" && v === "newest");
        if (isDefault) params.delete(k);
        else params.set(k, v);
      }
      params.delete("page"); // any filter change → page 1
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      // scroll:false so changing a filter doesn't jump to top
      replace
        ? router.replace(url, { scroll: false })
        : router.push(url, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Debounce the search box → URL (replace: no history spam per keystroke)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => {
      if ((searchParams.get("search") || "") !== search) {
        pushParams({ search }, { replace: true });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search, pushParams, searchParams]);

  // Reflect external URL changes (navbar category links, Clear) into the box
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const hasFilters =
    search || category !== "all" || condition !== "all" || sort !== "newest";

  const clearFilters = () => {
    setSearch("");
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <div className="relative min-w-48 flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="h-9 rounded-full pl-8"
        />
      </div>

      <Select value={category} onValueChange={(v) => pushParams({ category: v })}>
        <SelectTrigger className="h-9 min-w-36 w-auto rounded-full text-xs">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={condition} onValueChange={(v) => pushParams({ condition: v })}>
        <SelectTrigger className="h-9 min-w-32 w-auto rounded-full text-xs">
          <SelectValue placeholder="Condition" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Condition</SelectItem>
          {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(v) => pushParams({ sort: v })}>
        <SelectTrigger className="h-9 min-w-44 w-auto rounded-full text-xs">
          <SlidersHorizontal size={12} className="mr-1 shrink-0 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost" size="sm" onClick={clearFilters}
          className="h-9 gap-1.5 rounded-full text-xs text-muted-foreground"
        >
          <X size={12} /> Clear
        </Button>
      )}
    </div>
  );
}
