import { cache } from "react";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/action/action";
import ProductDetail from "@/components/All/Products/ProductDetail";

export const revalidate = 180;

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

  const productData = await getCachedProduct(id);
  const product = productData?.result;
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <ProductDetail product={product} />
    </div>
  );
}
