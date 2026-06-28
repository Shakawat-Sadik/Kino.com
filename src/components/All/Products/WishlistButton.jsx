"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { addToWishlist, removeFromWishlist } from "@/lib/action/action";
import { ActionSwapIcon, ActionSwapText } from "@/components/motion/action-swap";
import { SPRING_PRESS } from "@/lib/ease";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export default function WishlistButton({ productId }) {
  const { data: session } = authClient.useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const isBuyer = session?.user?.role === "buyer";

  if (!session) {
    return (
      <p className="text-xs text-muted-foreground">
        <a href="/auth/login" className="underline underline-offset-2 hover:text-foreground">
          Login
        </a>{" "}
        to save to wishlist
      </p>
    );
  }

  if (!isBuyer) return null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (saved) {
        const res = await removeFromWishlist(productId);
        if (res?.success) {
          setSaved(false);
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await addToWishlist(productId);
        if (res?.success) {
          setSaved(true);
          toast.success("Added to wishlist");
        } else if (res?.message?.toLowerCase().includes("already")) {
          setSaved(true);
        } else {
          toast.error(res?.message || "Failed to update wishlist");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const value = saved ? "saved" : "unsaved";

  return (
    <motion.button
      type="button"
      disabled={loading}
      onClick={handleToggle}
      whileTap={{ scale: 0.95 }}
      transition={SPRING_PRESS}
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors disabled:opacity-50 ${
        saved
          ? "border-chart-3/40 bg-chart-3/10 text-chart-3"
          : "border-border bg-card text-foreground hover:border-chart-3/40 hover:bg-chart-3/5 hover:text-chart-3"
      }`}
    >
      <ActionSwapIcon value={value} animation="roll" className="h-4 w-4">
        <Heart
          size={16}
          className={saved ? "fill-chart-3 text-chart-3" : ""}
        />
      </ActionSwapIcon>
      <ActionSwapText value={value} animation="roll">
        {saved ? "In Wishlist" : "Add to Wishlist"}
      </ActionSwapText>
    </motion.button>
  );
}
