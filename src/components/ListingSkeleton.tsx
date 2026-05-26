type ListingSkeletonProps = {
  count?: number
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-sm">
      <div className="h-64 w-full animate-pulse bg-surface-container-high" />
      <div className="space-y-sm p-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <div className="h-8 w-8 animate-pulse rounded-full bg-surface-container-high" />
            <div className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-surface-container-high" />
              <div className="h-3 w-16 animate-pulse rounded bg-surface-container-high" />
            </div>
          </div>
          <div className="h-3 w-14 animate-pulse rounded bg-surface-container-high" />
        </div>

        <div className="h-5 w-40 animate-pulse rounded bg-surface-container-high" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-surface-container-high" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-surface-container-high" />
        </div>

        <div className="flex items-center justify-between pt-sm">
          <div className="h-5 w-20 animate-pulse rounded bg-surface-container-high" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-surface-container-high" />
        </div>
      </div>
    </div>
  )
}

export function ListingSkeleton({ count = 6 }: ListingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-xl md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  )
}

