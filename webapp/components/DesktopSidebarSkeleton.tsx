import { Skeleton } from '@/components/ui/skeleton';

interface DesktopSidebarSkeletonProps {
  viewMode?: 'chart' | 'fees' | 'holders' | 'burns';
  collapsed?: boolean;
}

export function DesktopSidebarSkeleton({ viewMode = 'chart', collapsed = false }: DesktopSidebarSkeletonProps) {
  if (collapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center gap-3 py-3 w-20 flex-shrink-0 bg-black border-l border-neutral-700/30">
        {/* Logo */}
        <Skeleton className="w-12 h-12 rounded-full bg-neutral-700/50" />

        {/* Live Indicator */}
        <div className="flex flex-col items-center gap-0.5">
          <Skeleton className="w-1.5 h-1.5 rounded-full bg-neutral-700/50" />
          <Skeleton className="h-2 w-6 bg-neutral-700/50 rounded" />
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-neutral-700/50"></div>

        {/* View Mode Icons */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-12 h-12 rounded-lg bg-neutral-700/50" />
          ))}
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-neutral-700/50"></div>

        {/* Timeframe */}
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-2 w-8 bg-neutral-700/50 rounded" />
          <Skeleton className="h-6 w-10 rounded bg-neutral-700/50" />
        </div>

        {viewMode === 'chart' && (
          <>
            {/* Divider */}
            <div className="w-8 h-px bg-neutral-700/50"></div>

            {/* Chart Options */}
            <Skeleton className="w-12 h-12 rounded-lg bg-neutral-700/50" />
            <Skeleton className="w-12 h-12 rounded-lg bg-neutral-700/50" />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="hidden lg:flex flex-col w-[250px] flex-shrink-0 bg-black border-l border-neutral-700/20 overflow-hidden">
      {/* Scrollable Content - EXACT MATCH */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-0 min-h-0">
        {/* Main Info Block - stat-card-highlight equivalent */}
        <div className="stat-card-highlight">
          <div className="flex items-center gap-2.5 mb-2">
            {/* Logo */}
            <Skeleton className="w-8 h-8 rounded-full bg-neutral-700/50" />
            {/* Token Switcher Button */}
            <Skeleton className="h-[26px] flex-1 bg-neutral-700/50 rounded" />
            {/* Live Indicator */}
            <div className="flex items-center gap-1">
              <Skeleton className="w-1.5 h-1.5 rounded-full bg-neutral-700/50" />
              <Skeleton className="h-[10px] w-[20px] bg-neutral-700/50 rounded" />
            </div>
          </div>
          <Skeleton className="h-[11px] w-full bg-neutral-700/50 mb-2 rounded" />

          {/* Pool Chain */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] pt-1.5 pb-1.5 mt-1.5 flex-wrap">
            <Skeleton className="h-[11px] w-[45px] bg-neutral-700/50 rounded" />
            <Skeleton className="h-[11px] w-[10px] bg-neutral-700/50 rounded" />
            <Skeleton className="h-[11px] w-[55px] bg-neutral-700/50 rounded" />
            <Skeleton className="h-[11px] w-[10px] bg-neutral-700/50 rounded" />
            <Skeleton className="h-[11px] w-[50px] bg-neutral-700/50 rounded" />
          </div>

          {/* DEX Screener Link */}
          <div style={{ marginTop: '12px', paddingTop: '12px', paddingBottom: '4px' }} className="border-t border-neutral-700/30">
            <Skeleton className="h-[11px] w-[130px] mx-auto bg-neutral-700/50 rounded" />
          </div>
        </div>

        {/* Dashed Divider - EXACT MATCH */}
        <div className="dashed-divider" style={{ opacity: 0.3 }}></div>

        {/* View Mode Switch - stat-card equivalent */}
        <div className="stat-card">
          <Skeleton className="h-[13px] w-[70px] mx-auto mb-1 bg-neutral-700/50 rounded" />
          <div className="relative bg-black/50 border border-white/20 rounded-lg p-0.5">
            <div className="grid grid-cols-2 gap-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[28px] rounded-md bg-neutral-700/50" />
              ))}
            </div>
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="dashed-divider" style={{ opacity: 0.3 }}></div>

        {/* Timeframe Toggle - stat-card equivalent */}
        <div className="stat-card">
          <Skeleton className="h-[13px] w-[60px] mx-auto mb-1 bg-neutral-700/50 rounded" />
          <div className="relative bg-black/50 border border-white/20 rounded-lg p-0.5">
            <div className="grid grid-cols-4 gap-0.5 mb-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[24px] rounded bg-neutral-700/50" />
              ))}
            </div>
            <Skeleton className="h-[24px] w-full rounded bg-neutral-700/50" />
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="dashed-divider" style={{ opacity: 0.3 }}></div>

        {/* Stats Section - EXACT TokenStats structure */}
        <div className="space-y-0">
          {/* Price Card - stat-card with exact spacing */}
          <div className="stat-card">
            <div className="flex items-start gap-3">
              {/* Current price */}
              <div className="flex-1">
                <Skeleton className="h-[11px] w-[50px] mb-1.5 bg-neutral-700/50 rounded" />
                <Skeleton className="h-[28px] w-[85px] mb-1 bg-neutral-700/50 rounded" />
                <Skeleton className="h-[17px] w-[55px] bg-neutral-700/50 rounded" />
              </div>
              {/* ATH */}
              <div className="flex-1 text-right">
                <Skeleton className="h-[11px] w-[55px] mb-1.5 ml-auto bg-neutral-700/50 rounded" />
                <Skeleton className="h-[20px] w-[65px] ml-auto bg-neutral-700/50 rounded" />
              </div>
            </div>
          </div>

          {/* Dashed Divider */}
          <div className="dashed-divider" style={{ opacity: 0.3 }}></div>

          {/* Liquidity and Market Cap - stat-card */}
          <div className="stat-card">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <Skeleton className="h-[11px] w-[50px] mb-1.5 bg-neutral-700/50 rounded" />
                <Skeleton className="h-[20px] w-[70px] bg-neutral-700/50 rounded" />
              </div>
              <div className="flex-1 text-right">
                <Skeleton className="h-[11px] w-[45px] mb-1.5 ml-auto bg-neutral-700/50 rounded" />
                <Skeleton className="h-[20px] w-[75px] ml-auto bg-neutral-700/50 rounded" />
              </div>
            </div>
          </div>

          {/* Dashed Divider */}
          <div className="dashed-divider" style={{ opacity: 0.3 }}></div>

          {/* Volume - stat-card */}
          <div className="stat-card">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <Skeleton className="h-[11px] w-[42px] mb-1.5 bg-neutral-700/50 rounded" />
                <Skeleton className="h-[20px] w-[65px] bg-neutral-700/50 rounded" />
              </div>
              <div className="flex-1 text-right">
                <Skeleton className="h-[11px] w-[42px] mb-1.5 ml-auto bg-neutral-700/50 rounded" />
                <Skeleton className="h-[20px] w-[75px] ml-auto bg-neutral-700/50 rounded" />
              </div>
            </div>
          </div>

          {/* Fees - Only show if fees view */}
          {viewMode === 'fees' && (
            <>
              <div className="stat-card">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <Skeleton className="h-[11px] w-[30px] mb-1.5 bg-neutral-700/50 rounded" />
                    <Skeleton className="h-[20px] w-[70px] bg-neutral-700/50 rounded" />
                  </div>
                  <div className="flex-1 text-right">
                    <Skeleton className="h-[11px] w-[50px] mb-1.5 ml-auto bg-neutral-700/50 rounded" />
                    <Skeleton className="h-[20px] w-[80px] ml-auto bg-neutral-700/50 rounded" />
                  </div>
                </div>
              </div>

              {/* Avg Daily Fees */}
              <div className="stat-card">
                <Skeleton className="h-[11px] w-[85px] mb-1.5 bg-neutral-700/50 rounded" />
                <Skeleton className="h-[20px] w-[70px] bg-neutral-700/50 rounded" />
              </div>

              {/* Dashed Divider */}
              <div className="dashed-divider" style={{ opacity: 0.3 }}></div>
            </>
          )}

          {/* Holders - stat-card */}
          <div className="stat-card">
            <Skeleton className="h-[11px] w-[45px] mb-1.5 bg-neutral-700/50 rounded" />
            <Skeleton className="h-[20px] w-[50px] bg-neutral-700/50 rounded" />
          </div>

          {/* Dashed Divider */}
          <div className="dashed-divider" style={{ opacity: 0.3 }}></div>

          {/* Transactions 24H - stat-card */}
          <div className="stat-card">
            <Skeleton className="h-[11px] w-[95px] mb-2 mx-auto bg-neutral-700/50 rounded" />
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <Skeleton className="h-[10px] w-[28px] mb-1 mx-auto bg-neutral-700/50 rounded" />
                <Skeleton className="h-[20px] w-[35px] mx-auto bg-neutral-700/50 rounded" />
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <Skeleton className="h-[10px] w-[32px] mb-1 mx-auto bg-neutral-700/50 rounded" />
                <Skeleton className="h-[20px] w-[35px] mx-auto bg-neutral-700/50 rounded" />
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'chart' && (
          <>
            {/* Dashed Divider */}
            <div className="dashed-divider" style={{ opacity: 0.3 }}></div>

            {/* Chart Controls - EXACT MATCH */}
            <div className="stat-card" style={{ padding: '10px 8px' }}>
              <Skeleton className="h-[13px] w-[90px] mx-auto mb-2 bg-neutral-700/50 rounded" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Y-Axis Display */}
                <div>
                  <Skeleton className="h-[11px] w-[75px] mb-[6px] bg-neutral-700/50 rounded" />
                  <div className="grid grid-cols-2 gap-1.5 bg-black/60 p-1 rounded-lg border border-neutral-700/30">
                    <Skeleton className="h-[22px] rounded-md bg-neutral-700/50" />
                    <Skeleton className="h-[22px] rounded-md bg-neutral-700/50" />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-neutral-700/30"></div>

                {/* Volume Bars Toggle */}
                <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3 h-3 flex-shrink-0 bg-neutral-700/50 rounded" />
                      <Skeleton className="h-[13px] w-[70px] bg-neutral-700/50 rounded" />
                    </div>
                    <Skeleton className="w-9 h-[18px] rounded-full bg-neutral-700/50" />
                  </div>
                </div>

                {/* Migration Events Toggle */}
                <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3 h-3 flex-shrink-0 bg-neutral-700/50 rounded" />
                      <Skeleton className="h-[13px] w-[95px] bg-neutral-700/50 rounded" />
                    </div>
                    <Skeleton className="w-9 h-[18px] rounded-full bg-neutral-700/50" />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-neutral-700/30"></div>

                {/* Auto Scale Toggle */}
                <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3 h-3 flex-shrink-0 bg-neutral-700/50 rounded" />
                      <Skeleton className="h-[13px] w-[65px] bg-neutral-700/50 rounded" />
                    </div>
                    <Skeleton className="w-9 h-[18px] rounded-full bg-neutral-700/50" />
                  </div>
                </div>

                {/* Log Scale Toggle */}
                <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3 h-3 flex-shrink-0 bg-neutral-700/50 rounded" />
                      <Skeleton className="h-[13px] w-[60px] bg-neutral-700/50 rounded" />
                    </div>
                    <Skeleton className="w-9 h-[18px] rounded-full bg-neutral-700/50" />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-neutral-700/30"></div>

                {/* Reset Position Button */}
                <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
                  <Skeleton className="h-[26px] w-full rounded-lg bg-neutral-700/50" />
                </div>
              </div>
            </div>

            {/* Extra spacing - matching actual */}
            <div className="h-1"></div>
          </>
        )}
      </div>

      {/* Sticky Bottom Section - EXACT MATCH */}
      <div className="flex-shrink-0 bg-black">
        {/* Dashed Divider */}
        <div className="dashed-divider" style={{ opacity: 0.3 }}></div>

        {/* Follow Section */}
        <a className="flex items-center justify-center gap-2 py-3 bg-black/85 backdrop-blur-xl w-full">
          <Skeleton className="w-5 h-5 rounded bg-neutral-700/50" />
          <Skeleton className="h-[20px] w-[120px] bg-neutral-700/50 rounded" />
        </a>
      </div>
    </div>
  );
}
