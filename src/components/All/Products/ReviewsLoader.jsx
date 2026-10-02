// Async server component — fetches reviews off the critical path so the
// product shell can paint while this streams in behind a Suspense boundary.
import { getProductReviews } from "@/lib/action/action";
import ReviewSection from "./ReviewSection";

export default async function ReviewsLoader({ productId }) {
  const data = await getProductReviews(productId);
  return (
    <ReviewSection productId={productId} initialReviews={data?.result ?? []} />
  );
}
