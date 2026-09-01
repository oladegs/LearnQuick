const Skeleton = ({ className = "" }) => (
  <div className={`skeleton-shimmer animate-pulse rounded-xl ${className}`} aria-hidden="true" />
);

export const CardGridSkeleton = ({ count = 3 }) => (
  <div role="status" aria-label="Loading content" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="surface-card rounded-2xl p-6">
        <Skeleton className="mb-8 h-11 w-11" />
        <Skeleton className="mb-3 h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    ))}
    <span className="sr-only">Loading...</span>
  </div>
);

export default Skeleton;
