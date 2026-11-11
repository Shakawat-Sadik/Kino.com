export default function Loading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-7 w-56 bg-muted rounded animate-pulse" />
        <div className="h-4 w-72 bg-muted rounded animate-pulse" />
      </div>
      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-muted animate-pulse shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-10 rounded-lg bg-muted animate-pulse" />
        <div className="w-44 h-10 rounded-lg bg-muted animate-pulse shrink-0" />
      </div>
      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 space-y-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
