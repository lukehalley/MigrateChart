'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useThemeContext } from '@/lib/ThemeContext';

export function BurnsChartSkeleton() {
  const { theme } = useThemeContext();
  const isLight = theme === 'light';

  // Theme-aware classes
  const cardBg = isLight ? 'bg-gray-100' : 'bg-black/50';
  const cardBorder = isLight ? 'border-gray-200' : 'border-neutral-800';
  const skeletonBg = isLight ? 'bg-gray-300' : 'bg-neutral-700';
  const tableBorder = isLight ? 'border-gray-200' : 'border-neutral-700';

  return (
    <div className="w-full h-full relative flex overflow-hidden">
      {/* Mobile/Tablet and Desktop - No sidebar needed, page handles it */}
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col gap-4">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 flex-shrink-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`p-2 md:p-6 ${cardBg} border ${cardBorder} rounded-lg flex flex-col items-center text-center`}>
                  <Skeleton className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${skeletonBg} mb-2`} />
                  <Skeleton className={`h-3 md:h-4 w-18 md:w-24 ${skeletonBg} mb-2`} />
                  <Skeleton className={`h-4 md:h-8 w-12 md:w-20 ${skeletonBg} mb-1`} />
                  <Skeleton className={`h-2 md:h-3 w-10 md:w-12 ${skeletonBg}`} />
                </div>
              ))}
            </div>

            {/* Chart - Daily Burn History */}
            <div className={`${cardBg} border ${cardBorder} rounded-lg p-6`}>
              <div className="mb-4">
                <Skeleton className={`h-6 w-48 ${skeletonBg} mb-2`} />
                <Skeleton className={`h-4 w-72 ${skeletonBg}`} />
              </div>
              <div className="h-[350px] flex items-end gap-2 px-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={`flex-1 ${skeletonBg}`}
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
            <div className={`${cardBg} border ${cardBorder} rounded-lg p-6`}>
              <div className="mb-4">
                <Skeleton className={`h-6 w-40 ${skeletonBg}`} />
              </div>
              <div className="space-y-2">
                {/* Table Header */}
                <div className={`grid grid-cols-4 gap-2 pb-2 border-b ${tableBorder}`}>
                  <Skeleton className={`h-4 w-16 ${skeletonBg}`} />
                  <Skeleton className={`h-4 w-16 ${skeletonBg}`} />
                  <Skeleton className={`h-4 w-16 ${skeletonBg}`} />
                  <Skeleton className={`h-4 w-20 ${skeletonBg} ml-auto`} />
                </div>
                {/* Table Rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 py-2" style={{ animationDelay: `${i * 0.1}s` }}>
                    <Skeleton className={`h-4 w-20 ${skeletonBg} animate-pulse`} />
                    <Skeleton className={`h-4 w-16 ${skeletonBg} animate-pulse`} />
                    <Skeleton className={`h-4 w-24 ${skeletonBg} animate-pulse`} />
                    <Skeleton className={`h-4 w-16 ${skeletonBg} ml-auto animate-pulse`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
