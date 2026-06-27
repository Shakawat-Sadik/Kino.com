"use client";;
import { useSmoothScroll } from "@/components/motion/smooth-scroll";
import { cn } from "@/lib/utils";

/**
 * Button that smooth-scrolls to a target via the active SmoothScroll provider
 * (or native scroll as a fallback). Respects reduced motion — jumps instantly.
 */
export function ScrollTo({
  to,
  offset,
  duration,
  children,
  className,
  ...rest
}) {
  const { scrollTo } = useSmoothScroll();
  const options = { offset, duration };
  return (
    <button
      type="button"
      onClick={() => scrollTo(to, options)}
      className={cn(className)}
      {...rest}>
      {children}
    </button>
  );
}
