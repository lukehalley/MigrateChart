import { Skeleton } from '@/components/ui/skeleton';

export function FeesChartSkeleton() {
  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* Charts Grid - Scrollable on mobile to match actual content */}
      <div className="flex-1 overflow-y-auto md:overflow-hidden p-4 md:p-6 md:min-h-0">
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 pt-16 md:pt-0 h-auto md:h-full md:grid-rows-2">
        {/* Bar Chart Skeleton */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col md:min-h-0">
          <div className="mb-4">
            <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
            <Skeleton className="h-4 w-64 bg-neutral-700" />
          </div>
          <div className="flex-1 flex items-end gap-2 px-4 pb-0 md:min-h-0 h-[250px] md:h-full">
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
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col md:min-h-0">
          <div className="mb-4">
            <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
            <Skeleton className="h-4 w-64 bg-neutral-700" />
          </div>
          <div className="flex-1 pb-0 md:min-h-0 h-[250px] md:h-full">
            <div className="relative w-full h-full">
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

        {/* Line Chart Skeleton 1 */}
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
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Line Chart Skeleton 2 */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col md:min-h-0">
          <div className="mb-4">
            <Skeleton className="h-6 w-48 bg-neutral-700 mb-2" />
            <Skeleton className="h-4 w-64 bg-neutral-700" />
          </div>
          <div className="flex-1 pb-0 md:min-h-0 h-[250px] md:h-full">
            <div className="relative w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
                <path
                  d="M 0 220 Q 50 190, 100 200 T 200 180 T 300 150 T 400 120"
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
      </div>
    </div>
  );
}
