// Route skeleton shown on navigation / ISR miss while the product fetch
// resolves. Mirrors the ProductDetail two-column layout to avoid a jump.
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <div className="animate-pulse">
        {/* Breadcrumb */}
        <div className="mb-6 h-3 w-48 rounded bg-muted" />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="aspect-square rounded-2xl bg-muted" />

          {/* Info */}
          <div className="flex flex-col gap-5">
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
            </div>
            <div className="h-9 w-3/4 rounded bg-muted" />
            <div className="h-10 w-32 rounded bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
            <div className="flex gap-3">
              <div className="h-11 w-36 rounded-full bg-muted" />
              <div className="h-11 w-40 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
