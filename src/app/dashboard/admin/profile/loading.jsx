export default function Loading() {
  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted animate-pulse shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-48 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
