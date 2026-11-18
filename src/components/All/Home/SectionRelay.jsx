import { cn } from "@/lib/utils";

// Relay background for home-page sections: each section fades vertically from
// the color the previous section ended on (`from`) to the one the next section
// starts on (`to`), so the page reads as one continuous band with no seams.
// Vertical gradient with % stops → identical at every screen size/height.
// Server component, no blur filters.

const STRENGTH = 10; // % of the accent mixed into the page background

/** Color at a relay edge. `token` is "chart-1".."chart-5" or "background". */
export function relayColor(token) {
  if (token === "background") return "var(--background)";
  return `color-mix(in oklab, var(--${token}) ${STRENGTH}%, var(--background))`;
}

export default function SectionRelay({ from, to, className, children }) {
  return (
    <div className={cn("relative isolate", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundImage: `linear-gradient(to bottom, ${relayColor(from)} 0%, ${relayColor(to)} 100%)` }}
      />
      {children}
    </div>
  );
}
