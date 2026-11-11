export default function Loading() {
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-10 rounded-lg bg-muted animate-pulse" />
        <div className="w-full sm:w-36 h-10 rounded-lg bg-muted animate-pulse" />
        <div className="w-full sm:w-36 h-10 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
