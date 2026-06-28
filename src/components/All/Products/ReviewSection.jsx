"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { authClient } from "@/lib/auth-client";
import { addReview } from "@/lib/action/action";
import { EASE_OUT } from "@/lib/ease";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
        >
          <Star
            size={readonly ? 14 : 22}
            className={`transition-colors ${
              star <= (hovered || value)
                ? "fill-chart-3 text-chart-3"
                : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const name = review.reviewerInfo?.name || "Anonymous";
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chart-3/15 text-xs font-bold text-chart-3">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            {date && <p className="text-[11px] text-muted-foreground">{date}</p>}
          </div>
        </div>
        <StarRating value={review.rating} readonly />
      </div>
      {review.comment && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {review.comment}
        </p>
      )}
    </motion.div>
  );
}

function ReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Please select a star rating");
    setLoading(true);
    const res = await addReview({ productId, rating, comment });
    setLoading(false);
    if (res?.success) {
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      onSubmitted?.();
    } else {
      toast.error(res?.message || "Failed to submit review");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">Write a Review</p>
      <div>
        <p className="mb-1.5 text-xs text-muted-foreground">Rating</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <Textarea
        placeholder="Share your experience with this product (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="resize-none text-sm"
      />
      <Button
        type="submit"
        disabled={loading || !rating}
        className="h-8 rounded-full px-4 text-xs"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}

export default function ReviewSection({ productId, initialReviews = [] }) {
  const { data: session } = authClient.useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const isBuyer = session?.user?.role === "buyer";

  const handleNewReview = () => {
    // Optimistic: prompt a refresh by re-fetching. For simplicity, we
    // can't refetch server data from here, so just show a note.
    toast.info("Reload to see your review in the list.");
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-foreground">
            Reviews{" "}
            <span className="text-base font-medium text-muted-foreground">
              ({reviews.length})
            </span>
          </h2>
          {avgRating && (
            <div className="mt-1 flex items-center gap-1.5">
              <StarRating value={Math.round(Number(avgRating))} readonly />
              <span className="text-sm font-semibold text-foreground">
                {avgRating}
              </span>
              <span className="text-xs text-muted-foreground">avg</span>
            </div>
          )}
        </div>
      </div>

      {/* Review form */}
      {isBuyer && (
        <div className="mb-6">
          <ReviewForm productId={productId} onSubmitted={handleNewReview} />
        </div>
      )}
      {!session && (
        <p className="mb-6 text-sm text-muted-foreground">
          <a href="/auth/login" className="underline underline-offset-2 hover:text-foreground">
            Login as a buyer
          </a>{" "}
          to write a review.
        </p>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {reviews.map((r, i) => (
              <ReviewCard key={r._id ?? i} review={r} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
