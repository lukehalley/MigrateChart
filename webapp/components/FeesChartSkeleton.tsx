import { Skeleton } from '@/components/ui/skeleton';

export function FeesChartSkeleton() {
  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 md:min-h-0 md:overflow-hidden">
        <div className="flex flex-col gap-4 h-auto md:h-full">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 flex-shrink-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-2 md:p-6 bg-black/50 border border-neutral-800 rounded-lg flex flex-col items-center text-center">
                <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-700 mb-2" />
                <Skeleton className="h-3 md:h-4 w-16 md:w-24 bg-neutral-700 mb-2" />
                <Skeleton className="h-4 md:h-8 w-12 md:w-20 bg-neutral-700 mb-1" />
                <Skeleton className="h-2 md:h-3 w-10 md:w-16 bg-neutral-700" />
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 flex-1 md:min-h-0 md:grid-rows-2">
            {/* Chart 1: Bar Chart */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col md:min-h-0">
              <div className="mb-4">
                <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
                <Skeleton className="h-4 w-64 bg-neutral-700" />
              </div>
              <div className="flex-1 flex items-end gap-2 px-4 pb-0 md:min-h-0 h-[250px] md:h-full">
                {Array.from({ length: 15 }).map((_, i) => (
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

            {/* Chart 2: Area Chart */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col md:min-h-0">
              <div className="mb-4">
                <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
                <Skeleton className="h-4 w-64 bg-neutral-700" />
              </div>
              <div className="flex-1 pb-0 md:min-h-0 h-[250px] md:h-full">
                <div className="relative w-full h-full">
                  <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="skeletonGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(64, 64, 64)" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="rgb(64, 64, 64)" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 250 Q 50 200, 100 220 T 200 180 T 300 140 T 400 100 L 400 300 L 0 300 Z"
                      fill="url(#skeletonGradient1)"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Chart 3: Line Chart */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col md:min-h-0">
              <div className="mb-4">
                <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
                <Skeleton className="h-4 w-64 bg-neutral-700" />
              </div>
              <div className="flex-1 pb-0 md:min-h-0 h-[250px] md:h-full">
                <div className="relative w-full h-full">
                  <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
                    <path
                      d="M 0 200 Q 50 150, 100 170 T 200 120 T 300 80 T 400 50"
                      fill="none"
                      stroke="rgb(64, 64, 64)"
                      strokeWidth="3"
                      className="animate-pulse"
                      style={{ animationDelay: '0.1s' }}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Chart 4: Area Chart */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col md:min-h-0">
              <div className="mb-4">
                <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
                <Skeleton className="h-4 w-64 bg-neutral-700" />
              </div>
              <div className="flex-1 pb-0 md:min-h-0 h-[250px] md:h-full">
                <div className="relative w-full h-full">
                  <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="skeletonGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(64, 64, 64)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="rgb(64, 64, 64)" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 220 Q 50 190, 100 200 T 200 180 T 300 150 T 400 120 L 400 250 L 0 250 Z"
                      fill="url(#skeletonGradient2)"
                      className="animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
