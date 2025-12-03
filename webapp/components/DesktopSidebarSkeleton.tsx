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
            <Skeleton className="h-4 flex-1 bg-neutral-700" />
            {/* Live Indicator */}
            <div className="flex items-center gap-1">
              <Skeleton className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              <Skeleton className="h-2 w-6 bg-neutral-700" />
            </div>
          </div>
          <Skeleton className="h-3 w-full bg-neutral-700 mb-2" />

          {/* Pool Chain */}
          <div className="flex items-center justify-center gap-1.5 pt-1.5 pb-1.5 mt-1.5 flex-wrap">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-16 bg-neutral-700" />
            ))}
          </div>

          {/* DEX Screener Link */}
          <div className="mt-3 pt-3 border-t border-neutral-700">
            <Skeleton className="h-3 w-32 mx-auto bg-neutral-700" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-700 my-2"></div>

        {/* View Mode Switch */}
        <div className="bg-black/50 border border-neutral-700 rounded-lg p-2 mb-2">
          <Skeleton className="h-3 w-20 mx-auto mb-1 bg-neutral-700" />
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
          <Skeleton className="h-3 w-20 mx-auto mb-1 bg-neutral-700" />
          <div className="grid grid-cols-5 gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 rounded bg-neutral-700" />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-700 my-2"></div>

        {/* Stats Section */}
        <div className="space-y-1.5 mb-2">
          {Array.from({ length: viewMode === 'fees' ? 4 : 3 }).map((_, i) => (
            <div key={i} className="bg-black/50 border border-neutral-700 rounded-lg p-2">
              <Skeleton className="h-3 w-16 mb-1 bg-neutral-700" />
              <Skeleton className="h-6 w-full bg-neutral-700 mb-0.5" />
              <Skeleton className="h-2 w-12 bg-neutral-700" />
            </div>
          ))}
        </div>

        {viewMode === 'chart' && (
          <>
            {/* Divider */}
            <div className="h-px bg-neutral-700 my-2"></div>

            {/* Chart Controls */}
            <div className="bg-black/50 border border-neutral-700 rounded-lg p-2 mb-2">
              <Skeleton className="h-3 w-20 mx-auto mb-2 bg-neutral-700" />

              {/* Display Mode */}
              <div className="mb-3">
                <Skeleton className="h-3 w-16 mb-1 bg-neutral-700" />
                <div className="grid grid-cols-2 gap-1">
                  <Skeleton className="h-7 rounded bg-neutral-700" />
                  <Skeleton className="h-7 rounded bg-neutral-700" />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                {['Volume', 'Migration Lines', 'Log Scale', 'Auto Scale'].map((label, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20 bg-neutral-700" />
                    <Skeleton className="w-10 h-5 rounded-full bg-neutral-700" />
                  </div>
                ))}
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
            <Skeleton className="h-4 w-32 bg-neutral-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
