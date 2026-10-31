export function Skeleton({ className = '', lines = 1 }) {
  if (lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="bg-border/50 rounded-lg animate-pulse"
            style={{ height: 16, width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className={`bg-border/50 rounded-lg animate-pulse ${className}`} />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-paper rounded-2xl border border-border p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton lines={3} />
    </div>
  );
}
