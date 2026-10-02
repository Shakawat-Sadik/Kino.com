// Suspense fallback for the streamed reviews section. Mirrors the heading +
// review-card layout in ReviewSection so the swap-in is visually stable.
export default function ReviewsSkeleton() {
  return (
    <section className="mt-12 animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="h-4 w-28 rounded bg-muted" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-24 rounded bg-muted" />
                <div className="h-2.5 w-16 rounded bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
