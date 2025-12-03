import { Skeleton } from '@/components/ui/skeleton';

interface DesktopSidebarSkeletonProps {
  viewMode?: 'chart' | 'fees' | 'holders' | 'burns';
  collapsed?: boolean;
}

export function DesktopSidebarSkeleton({ viewMode = 'chart', collapsed = false }: DesktopSidebarSkeletonProps) {
  if (collapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center gap-3 py-3 w-20 flex-shrink-0 bg-black border-l border-neutral-800">
        {/* Logo */}
        <Skeleton className="w-12 h-12 rounded-full bg-neutral-700" />

        {/* Live Indicator */}
        <div className="flex flex-col items-center gap-0.5">
          <Skeleton className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
          <Skeleton className="h-2 w-6 bg-neutral-700" />
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-neutral-700"></div>

        {/* View Mode Icons */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-12 h-12 rounded-lg bg-neutral-700" />
          ))}
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-neutral-700"></div>

        {/* Timeframe */}
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-2 w-8 bg-neutral-700" />
          <Skeleton className="h-6 w-10 rounded bg-neutral-700" />
        </div>

        {viewMode === 'chart' && (
          <>
            {/* Divider */}
            <div className="w-8 h-px bg-neutral-700"></div>

            {/* Chart Options */}
            <Skeleton className="w-12 h-12 rounded-lg bg-neutral-700" />
            <Skeleton className="w-12 h-12 rounded-lg bg-neutral-700" />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col w-[250px] flex-shrink-0 bg-black border-l border-neutral-800 overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-0 min-h-0">
        {/* Main Info Block */}
        <div className="bg-black/50 border border-neutral-700 rounded-lg p-3 mb-2">
          <div className="flex items-center gap-2.5 mb-2">
            {/* Logo */}
            <Skeleton className="w-8 h-8 rounded-full bg-neutral-700" />
            {/* Token Name */}
            <Skeleton className="h-4 flex-1 bg-neutral-700 rounded" />
            {/* Live Indicator */}
            <div className="flex items-center gap-1">
              <Skeleton className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              <Skeleton className="h-2 w-6 bg-neutral-700 rounded" />
            </div>
          </div>
          <Skeleton className="h-3 w-full bg-neutral-700 mb-2 rounded" />

          {/* Pool Chain */}
          <div className="flex items-center justify-center gap-1.5 pt-1.5 pb-1.5 mt-1.5 flex-wrap">
            <Skeleton className="h-3 w-14 bg-neutral-700 rounded" />
            <Skeleton className="h-3 w-4 bg-neutral-700 rounded" />
            <Skeleton className="h-3 w-16 bg-neutral-700 rounded" />
            <Skeleton className="h-3 w-4 bg-neutral-700 rounded" />
            <Skeleton className="h-3 w-14 bg-neutral-700 rounded" />
          </div>

          {/* DEX Screener Link */}
          <div className="mt-3 pt-3 border-t border-neutral-700">
            <Skeleton className="h-3 w-32 mx-auto bg-neutral-700 rounded" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-700 my-2"></div>

        {/* View Mode Switch */}
        <div className="bg-black/50 border border-neutral-700 rounded-lg p-2 mb-2">
          <Skeleton className="h-3 w-20 mx-auto mb-1 bg-neutral-700 rounded" />
          <div className="grid grid-cols-2 gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded-md bg-neutral-700" />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-700 my-2"></div>

        {/* Timeframe Toggle */}
        <div className="bg-black/50 border border-neutral-700 rounded-lg p-2 mb-2">
          <Skeleton className="h-3 w-20 mx-auto mb-1 bg-neutral-700 rounded" />
          <div className="grid grid-cols-4 gap-0.5 mb-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7 rounded bg-neutral-700" />
            ))}
          </div>
          <Skeleton className="h-7 w-full rounded bg-neutral-700" />
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-700 my-2"></div>

        {/* Stats Section - Matching actual loaded state */}
        <div className="space-y-1.5 mb-2">
          {/* Price / ATH Price */}
          <div className="bg-black/50 border border-neutral-700 rounded-lg p-2.5">
            <div className="flex items-start justify-between mb-1.5">
              <Skeleton className="h-2.5 w-12 bg-neutral-700 rounded" />
              <Skeleton className="h-2.5 w-16 bg-neutral-700 rounded" />
            </div>
            <div className="flex items-end justify-between mb-0.5">
              <Skeleton className="h-7 w-20 bg-neutral-700 rounded" />
              <Skeleton className="h-5 w-16 bg-neutral-700 rounded" />
            </div>
            <Skeleton className="h-3 w-12 bg-neutral-700 rounded" />
          </div>

          {/* Liquidity / Mkt Cap */}
          <div className="bg-black/50 border border-neutral-700 rounded-lg p-2.5">
            <div className="flex items-start justify-between mb-1.5">
              <Skeleton className="h-2.5 w-14 bg-neutral-700 rounded" />
              <Skeleton className="h-2.5 w-12 bg-neutral-700 rounded" />
            </div>
            <div className="flex items-end justify-between">
              <Skeleton className="h-6 w-20 bg-neutral-700 rounded" />
              <Skeleton className="h-5 w-18 bg-neutral-700 rounded" />
            </div>
          </div>

          {/* Volume / Vol ATH */}
          <div className="bg-black/50 border border-neutral-700 rounded-lg p-2.5">
            <div className="flex items-start justify-between mb-1.5">
              <Skeleton className="h-2.5 w-12 bg-neutral-700 rounded" />
              <Skeleton className="h-2.5 w-12 bg-neutral-700 rounded" />
            </div>
            <div className="flex items-end justify-between">
              <Skeleton className="h-6 w-18 bg-neutral-700 rounded" />
              <Skeleton className="h-5 w-18 bg-neutral-700 rounded" />
            </div>
          </div>

          {/* Fees / Fees ATH - Only show if fees view */}
          {viewMode === 'fees' && (
            <div className="bg-black/50 border border-neutral-700 rounded-lg p-2.5">
              <div className="flex items-start justify-between mb-1.5">
                <Skeleton className="h-2.5 w-10 bg-neutral-700 rounded" />
                <Skeleton className="h-2.5 w-14 bg-neutral-700 rounded" />
              </div>
              <div className="flex items-end justify-between">
                <Skeleton className="h-6 w-16 bg-neutral-700 rounded" />
                <Skeleton className="h-5 w-20 bg-neutral-700 rounded" />
              </div>
            </div>
          )}

          {/* Holders */}
          <div className="bg-black/50 border border-neutral-700 rounded-lg p-2.5">
            <Skeleton className="h-2.5 w-14 mb-1.5 bg-neutral-700 rounded" />
            <Skeleton className="h-6 w-16 bg-neutral-700 rounded" />
          </div>

          {/* Transactions 24H */}
          <div className="bg-black/50 border border-neutral-700 rounded-lg p-2.5">
            <Skeleton className="h-2.5 w-24 mb-2 bg-neutral-700 rounded" />
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <Skeleton className="h-2.5 w-8 mx-auto mb-1 bg-neutral-700 rounded" />
                <Skeleton className="h-6 w-10 mx-auto bg-neutral-700 rounded" />
              </div>
              <div className="w-px h-8 bg-neutral-700 mx-2"></div>
              <div className="text-center flex-1">
                <Skeleton className="h-2.5 w-8 mx-auto mb-1 bg-neutral-700 rounded" />
                <Skeleton className="h-6 w-10 mx-auto bg-neutral-700 rounded" />
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'chart' && (
          <>
            {/* Divider */}
            <div className="h-px bg-neutral-700 my-2"></div>

            {/* Chart Controls */}
            <div className="bg-black/50 border border-neutral-700 rounded-lg p-3 mb-2">
              <Skeleton className="h-3 w-24 mx-auto mb-3 bg-neutral-700 rounded" />

              {/* Y-Axis Display */}
              <div className="mb-3">
                <Skeleton className="h-2.5 w-20 mb-1.5 bg-neutral-700 rounded" />
                <div className="grid grid-cols-2 gap-1">
                  <Skeleton className="h-8 rounded bg-neutral-700" />
                  <Skeleton className="h-8 rounded bg-neutral-700" />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5">
                {['Volume Bars', 'Migration Events', 'Auto Scale', 'Log Scale'].map((label, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="w-3 h-3 bg-neutral-700 rounded" />
                      <Skeleton className="h-2.5 w-20 bg-neutral-700 rounded" />
                    </div>
                    <Skeleton className="w-10 h-5 rounded-full bg-neutral-700" />
                  </div>
                ))}
              </div>

              {/* Reset Button */}
              <div className="mt-3 pt-3 border-t border-neutral-700">
                <Skeleton className="h-8 w-full rounded bg-neutral-700" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Section */}
      <div className="flex-shrink-0 bg-black border-t border-neutral-700">
        {/* Divider */}
        <div className="h-px bg-neutral-700"></div>

        {/* Follow Section */}
        <div className="py-3 px-4">
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="w-5 h-5 rounded bg-neutral-700" />
            <Skeleton className="h-4 w-28 bg-neutral-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
