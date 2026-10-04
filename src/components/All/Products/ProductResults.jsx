import Link from "next/link";
import { getProducts } from "@/lib/action/action";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "./ProductGrid";
import ProductsPagination from "./ProductsPagination";

const LIMIT = 12;

export default async function ProductResults({ searchParams }) {
  const page = Number(searchParams.page) || 1;
  const sort = searchParams.sort || "newest";

  const query = { limit: LIMIT, page };
  if (searchParams.search) query.search = searchParams.search;
  if (searchParams.category) query.category = searchParams.category;
  if (searchParams.condition) query.condition = searchParams.condition;
  if (sort === "price_asc") { query.sort = "price"; query.order = "asc"; }
  if (sort === "price_desc") { query.sort = "price"; query.order = "desc"; }

  const data = await getProducts(query);
  const products = data?.result ?? [];
  const total = data?.total ?? 0;

  const hasFilters = Boolean(
    searchParams.search || searchParams.category ||
    searchParams.condition || (searchParams.sort && searchParams.sort !== "newest"),
  );

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{total.toLocaleString()}</span>{" "}
        product{total !== 1 ? "s" : ""} found
      </p>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-4 text-lg font-semibold text-foreground">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
          {hasFilters && (
            <Button asChild variant="outline" className="mt-5 rounded-full">
              <Link href="/products">Clear all filters</Link>
            </Button>
          )}
        </div>
      ) : (
        <ProductGrid products={products} />
      )}

      {total > LIMIT && (
        <div className="mt-8">
          <ProductsPagination page={page} total={total} limit={LIMIT} />
        </div>
      )}
    </>
  );
}
