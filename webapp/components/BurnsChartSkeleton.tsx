import { Skeleton } from '@/components/ui/skeleton';

export function BurnsChartSkeleton() {
  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 flex-shrink-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-2 md:p-6 bg-black/50 border border-neutral-800 rounded-lg flex flex-col items-center text-center">
                <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-700 mb-2" />
                <Skeleton className="h-3 md:h-4 w-18 md:w-24 bg-neutral-700 mb-2" />
                <Skeleton className="h-4 md:h-8 w-12 md:w-20 bg-neutral-700 mb-1" />
                <Skeleton className="h-2 md:h-3 w-10 md:w-12 bg-neutral-700" />
              </div>
            ))}
          </div>

          {/* Chart - Daily Burn History */}
          <div className="bg-black/50 border border-neutral-800 rounded-lg p-6">
            <div className="mb-4">
              <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
              <Skeleton className="h-4 w-72 bg-neutral-700" />
            </div>
            <div className="h-[350px] flex items-end gap-2 px-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 bg-neutral-700"
                  style={{
                    height: `${Math.random() * 80 + 20}%`,
                    minWidth: '8px',
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Table Skeleton - Recent Burns */}
          <div className="bg-black/50 border border-neutral-800 rounded-lg p-6">
            <div className="mb-4">
              <Skeleton className="h-6 w-40 bg-neutral-700" />
            </div>
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-2 pb-2 border-b border-neutral-700">
                <Skeleton className="h-4 w-16 bg-neutral-700" />
                <Skeleton className="h-4 w-16 bg-neutral-700" />
                <Skeleton className="h-4 w-16 bg-neutral-700" />
                <Skeleton className="h-4 w-20 bg-neutral-700 ml-auto" />
              </div>
              {/* Table Rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 py-2" style={{ animationDelay: `${i * 0.1}s` }}>
                  <Skeleton className="h-4 w-20 bg-neutral-700 animate-pulse" />
                  <Skeleton className="h-4 w-16 bg-neutral-700 animate-pulse" />
                  <Skeleton className="h-4 w-24 bg-neutral-700 animate-pulse" />
                  <Skeleton className="h-4 w-16 bg-neutral-700 ml-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
