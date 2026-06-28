import { notFound } from "next/navigation";
import { getProductById, getProductReviews } from "@/lib/action/action";
import ProductDetail from "@/components/All/Products/ProductDetail";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getProductById(id);
  const product = data?.result;
  return {
    title: product ? `${product.title} | Kino.com` : "Product | Kino.com",
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  const [productData, reviewsData] = await Promise.all([
    getProductById(id),
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
