import { Skeleton } from '@/components/ui/skeleton';

export function FeesChartSkeleton() {
  return (
    <div className="p-4 lg:p-6 max-w-[100vw]">
      {/* Timeframe buttons skeleton */}
      <div className="flex justify-end gap-2 mb-6">
        <Skeleton className="h-10 w-16 bg-neutral-800" />
        <Skeleton className="h-10 w-16 bg-neutral-800" />
        <Skeleton className="h-10 w-16 bg-neutral-800" />
        <Skeleton className="h-10 w-16 bg-neutral-800" />
      </div>

      {/* Stats Grid - Top Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24 bg-neutral-700" />
              <Skeleton className="h-4 w-4 rounded bg-neutral-700" />
            </div>
            <Skeleton className="h-8 w-20 bg-neutral-700 mb-2" />
            <Skeleton className="h-3 w-16 bg-neutral-700" />
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Bar Chart Skeleton */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="mb-4">
            <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
            <Skeleton className="h-4 w-64 bg-neutral-700" />
          </div>
          <div className="h-[350px] flex items-end gap-2 px-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 bg-neutral-700"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                  minWidth: '8px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Area Chart Skeleton */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="mb-4">
            <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
            <Skeleton className="h-4 w-64 bg-neutral-700" />
          </div>
          <div className="h-[350px] flex flex-col justify-end">
            {/* Simulated area chart with gradient effect */}
            <div className="relative h-full">
              <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="skeletonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(64, 64, 64)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="rgb(64, 64, 64)" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 250 Q 50 200, 100 220 T 200 180 T 300 140 T 400 100 L 400 300 L 0 300 Z"
                  fill="url(#skeletonGradient)"
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Line Chart Skeleton - Full Width */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="mb-4">
            <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
            <Skeleton className="h-4 w-64 bg-neutral-700" />
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <div className="relative w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 800 250" preserveAspectRatio="none">
                <path
                  d="M 0 200 Q 100 150, 200 170 T 400 120 T 600 80 T 800 50"
                  fill="none"
                  stroke="rgb(64, 64, 64)"
                  strokeWidth="3"
                  className="animate-pulse"
                />
                <path
                  d="M 0 220 Q 100 190, 200 200 T 400 180 T 600 150 T 800 120"
                  fill="none"
                  stroke="rgb(64, 64, 64)"
                  strokeWidth="3"
                  className="animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="mt-8 text-center">
        <Skeleton className="h-4 w-96 mx-auto bg-neutral-700" />
      </div>
    </div>
  );
}
