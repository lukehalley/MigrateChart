import { Skeleton } from '@/components/ui/skeleton';

export function HoldersChartSkeleton() {
  return (
    <div className="w-full h-full relative flex overflow-hidden">
      {/* Mobile/Tablet and Desktop - No sidebar needed, page handles it */}
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 md:min-h-0 md:overflow-hidden">
          <div className="flex flex-col gap-4 h-auto md:h-full">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 flex-shrink-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-2 md:p-6 bg-black/50 border border-neutral-800 rounded-lg flex flex-col items-center text-center">
                  <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-700 mb-2" />
                  <Skeleton className="h-3 md:h-4 w-20 md:w-28 bg-neutral-700 mb-2" />
                  <Skeleton className="h-4 md:h-8 w-14 md:w-24 bg-neutral-700 mb-1" />
                  <Skeleton className="h-2 md:h-3 w-10 md:w-16 bg-neutral-700" />
                </div>
              ))}
            </div>

            {/* Charts Grid - 2 rows, full width */}
            <div className="grid gap-4 grid-cols-1 flex-1 md:min-h-0 md:grid-rows-[1fr_1fr]">
              {/* Chart 1: Area Chart - Holder Count Over Time */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col md:min-h-0">
                <div className="mb-4">
                  <Skeleton className="h-6 w-56 bg-neutral-700 mb-2" />
                  <Skeleton className="h-4 w-72 bg-neutral-700" />
                </div>
                <div className="flex-1 pb-0 md:min-h-0 h-[250px] md:h-full">
                  <div className="relative w-full h-full">
                    <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="skeletonGradientHolders1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgb(64, 64, 64)" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="rgb(64, 64, 64)" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 250 Q 50 240, 100 230 T 200 200 T 300 160 T 400 120 L 400 300 L 0 300 Z"
                        fill="url(#skeletonGradientHolders1)"
                        className="animate-pulse"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Chart 2: Two side-by-side bar and line charts */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Bar Chart Skeleton - Daily Holder Change */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col md:min-h-0">
                  <div className="mb-4">
                    <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
                    <Skeleton className="h-4 w-64 bg-neutral-700" />
                  </div>
                  <div className="flex-1 pb-0 md:min-h-0 h-[250px] md:h-full">
                    <div className="relative w-full h-full flex items-end justify-around gap-1 px-4">
                      {[60, -40, 80, 70, -30, 50, 75, 85, -45, 95].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-neutral-700 rounded-t animate-pulse"
                          style={{
                            height: `${Math.abs(height)}%`,
                            animationDelay: `${i * 0.08}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Line Chart Skeleton - Percentage Change */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col md:min-h-0">
                  <div className="mb-4">
                    <Skeleton className="h-6 w-52 bg-neutral-700 mb-2" />
                    <Skeleton className="h-4 w-64 bg-neutral-700" />
                  </div>
                  <div className="flex-1 pb-0 md:min-h-0 h-[250px] md:h-full">
                    <div className="relative w-full h-full">
                      <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
                        <path
                          d="M 0 150 Q 50 120, 100 140 T 200 100 T 300 80 T 400 60"
                          fill="none"
                          stroke="rgb(64, 64, 64)"
                          strokeWidth="3"
                          className="animate-pulse"
                          style={{ animationDelay: '0.15s' }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
