import { cache } from 'react';
import { notFound } from "next/navigation";

export const revalidate = 180;
import { getProductById, getProductReviews } from "@/lib/action/action";
import ProductDetail from "@/components/All/Products/ProductDetail";

const getCachedProduct = cache(getProductById);

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getCachedProduct(id);
  const product = data?.result;
  return {
    title: product ? `${product.title} | Kino.com` : "Product | Kino.com",
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  const [productData, reviewsData] = await Promise.all([
    getCachedProduct(id),
    getProductReviews(id),
  ]);

  const product = productData?.result;
  if (!product) notFound();

  const reviews = reviewsData?.result ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <ProductDetail product={product} reviews={reviews} />
    </div>
  );
}
