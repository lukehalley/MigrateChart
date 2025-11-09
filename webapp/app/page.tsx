'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Chart from '@/components/Chart';
import TimeframeToggle from '@/components/TimeframeToggle';
import TokenStats from '@/components/TokenStats';
import { fetchAllPoolsData, fetchTokenStats } from '@/lib/api';
import { PoolData, Timeframe, POOLS } from '@/lib/types';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get timeframe from URL or default to '1D'
  const urlTimeframe = searchParams.get('timeframe') as Timeframe | null;
  const validTimeframes: Timeframe[] = ['1H', '4H', '8H', '1D', '1W'];
  const initialTimeframe = urlTimeframe && validTimeframes.includes(urlTimeframe) ? urlTimeframe : '1D';

  const [timeframe, setTimeframeState] = useState<Timeframe>(initialTimeframe);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  // Update URL when timeframe changes
  const setTimeframe = (newTimeframe: Timeframe) => {
    setTimeframeState(newTimeframe);
    const params = new URLSearchParams(searchParams.toString());
    params.set('timeframe', newTimeframe);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle menu close with fade-out animation
  const closeMobileMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setShowMobileMenu(false);
      setIsMenuClosing(false);
    }, 300); // Match animation duration
  };

  // Handle copy address
  const solanaAddress = 'G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb';
  const handleCopy = () => {
    navigator.clipboard.writeText(solanaAddress);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Fetch data with SWR for automatic revalidation
  // Optimized intervals for live updates while respecting rate limits
  const { data: poolsData, error, isLoading } = useSWR<PoolData[]>(
    `/api/pools/${timeframe}`,
    () => fetchAllPoolsData(timeframe),
    {
      // More frequent updates for shorter timeframes
      refreshInterval: timeframe === '1H' ? 60000   // 1 minute for 1H
                     : timeframe === '4H' ? 180000  // 3 minutes for 4H
                     : timeframe === '8H' ? 240000  // 4 minutes for 8H
                     : timeframe === '1D' ? 300000  // 5 minutes for 1D
                     : 600000,                      // 10 minutes for 1W
      revalidateOnFocus: true, // Refresh when user returns to tab
      revalidateOnReconnect: true, // Refresh when internet reconnects
      dedupingInterval: 30000, // Dedupe requests within 30s
      errorRetryInterval: 10000, // Retry failed requests after 10s
      errorRetryCount: 3, // Max 3 retries
      onError: (err) => {
        console.error('Error fetching pool data:', err);
      },
    }
  );

  // Fetch token stats for the current Meteora pool
  // More frequent updates for price/stats which change rapidly
  const { data: tokenStats, isLoading: isStatsLoading } = useSWR(
    'token-stats',
    () => fetchTokenStats(POOLS.zera_Meteora.address),
    {
      refreshInterval: 30000, // Refresh every 30 seconds for live price updates
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 15000, // Dedupe requests within 15s
      errorRetryInterval: 10000,
      errorRetryCount: 3,
      onError: (err) => {
        console.error('Error fetching token stats:', err);
      },
    }
  );

  return (
    <main className="w-screen h-screen overflow-hidden grid grid-rows-[auto_1fr]">
      {/* Donation Banner */}
      <div className="relative bg-gradient-to-r from-[#0A1F12]/95 via-black/95 to-[#0A1F12]/95 border-b border-[#52C97D]/40 backdrop-blur-sm shadow-[0_4px_12px_rgba(82,201,125,0.15)] overflow-hidden">
        {/* Multi-layered animated glow overlay */}
        <div className="absolute inset-0 opacity-60 animate-pulse-glow">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#52C97D]/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#52C97D]/20 via-transparent to-[#52C97D]/20"></div>
        </div>
        <div className="w-full px-6 sm:px-8 flex flex-col items-center justify-center gap-2 text-center relative z-10">
          <p className="text-white/90 text-xs sm:text-sm pt-6 sm:pt-8">
            Buy Me A Coffee (Solana Network)
          </p>
          <div className="flex items-center justify-center gap-2 pb-6 sm:pb-8">
            <code className="text-[#52C97D] text-[10px] sm:text-xs font-mono bg-[#0A1F12]/60 px-3 sm:px-4 py-1.5 rounded border border-[#52C97D]/30 truncate max-w-[180px] sm:max-w-none select-text">
              {solanaAddress}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-1.5 sm:p-2 bg-[#52C97D]/10 hover:bg-[#52C97D]/20 border border-[#52C97D]/50 rounded transition-all group"
              aria-label="Copy address"
            >
              {showCopied ? (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#52C97D] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden w-full h-full relative overflow-hidden">
        {/* Mobile Menu Toggle Button - Floating hamburger menu */}
        <button
          onClick={() => showMobileMenu ? closeMobileMenu() : setShowMobileMenu(true)}
          className="fixed top-3 left-3 z-[60] w-11 h-11 flex items-center justify-center bg-[#0A1F12]/90 hover:bg-[#0A1F12] border-2 border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.3)] hover:shadow-[0_0_16px_rgba(82,201,125,0.5)] transition-all backdrop-blur-sm"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5">
            <div className={`w-6 h-0.5 bg-[#52C97D] transition-all duration-300 ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-[#52C97D] transition-all duration-300 ${showMobileMenu ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-[#52C97D] transition-all duration-300 ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </div>
        </button>

        {/* Mobile Popup Menu */}
        {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 ${isMenuClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onClick={closeMobileMenu}
          />

          {/* Popup Content */}
          <div className={`md:hidden fixed inset-0 z-50 ${isMenuClosing ? 'animate-fade-out' : 'animate-fade-in'} overflow-y-auto flex items-center justify-center p-4 pointer-events-none`}>
            <div className="flex flex-col items-center mt-16 py-8 px-4 pointer-events-auto">
              {/* Main Info Card */}
              <div className="info-card-small w-[85vw] max-w-[320px]">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/circle-logo.avif"
                    alt="ZERA"
                    className="h-8 w-8"
                  />
                  <div>
                    <h1 className="text-lg font-bold text-white mb-0">ZERA</h1>
                    <p className="text-white text-[10px]">Complete Price History</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] pt-4 pb-2 mt-3">
                  <span className="text-white font-medium">MON3Y</span>
                  <span className="text-white">→</span>
                  <span className="text-white font-medium">Raydium</span>
                  <span className="text-white">→</span>
                  <span className="text-[#52C97D] font-bold">Meteora</span>
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-6">
                <div className="dashed-divider w-24"></div>
              </div>

              {/* Timeframe Toggle Card */}
              <div className="info-card-small w-[85vw] max-w-[320px]">
                <div className="py-4 px-3">
                  <p className="text-white text-[10px] mb-4 text-center">Timeframe</p>
                  <TimeframeToggle
                    currentTimeframe={timeframe}
                    onTimeframeChange={(newTimeframe) => {
                      setTimeframe(newTimeframe);
                      closeMobileMenu();
                    }}
                  />
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-6">
                <div className="dashed-divider w-24"></div>
              </div>

              {/* Token Stats */}
              <div className="w-[85vw] max-w-[320px]">
                <TokenStats stats={tokenStats || null} isLoading={isStatsLoading} />
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-6">
                <div className="dashed-divider w-24"></div>
              </div>

              {/* Follow Section */}
              <div className="w-[85vw] max-w-[320px] mt-2">
                <a
                  href="https://x.com/Trenchooooor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-6 bg-[#52C97D]/5 hover:bg-[#52C97D]/15 transition-all cursor-pointer info-card-small"
                >
                  <p className="text-[#52C97D] text-sm font-bold tracking-wider">FOLLOW</p>
                </a>
              </div>
            </div>
          </div>
          </>
        )}

        {/* Mobile Chart */}
        <div className="w-full h-full">
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-red">Error loading chart data</div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-textMuted">Loading...</div>
            </div>
          )}

          {!isLoading && !error && poolsData && (
            <Chart poolsData={poolsData} timeframe={timeframe} />
          )}
        </div>
      </div>

      {/* Desktop View - Grid Layout */}
      <div className="hidden md:grid md:grid-cols-[9fr_1fr] w-full h-full overflow-hidden">
        {/* Left Section - Chart */}
        <div className="h-full relative overflow-hidden">
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-red">Error loading chart data</div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-textMuted">Loading...</div>
            </div>
          )}

          {!isLoading && !error && poolsData && (
            <Chart poolsData={poolsData} timeframe={timeframe} />
          )}
        </div>

        {/* Right Section - Token Stats Sidebar */}
        <div className="h-full bg-gradient-to-b from-black via-black to-black border-l-2 border-dashed border-[#52C97D]/60 grid grid-rows-[1fr_auto]" style={{ boxShadow: '-8px 0 8px rgba(82, 201, 125, 0.2)' }}>
          {/* Scrollable Content */}
          <div className="overflow-y-auto overflow-x-hidden px-6 py-4 space-y-4">
            {/* Main Info Block */}
            <div className="stat-card-highlight">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/circle-logo.avif"
                  alt="ZERA"
                  className="h-8 w-8"
                />
                <div>
                  <h1 className="text-lg font-bold text-white mb-0">ZERA</h1>
                  <p className="text-white text-[10px]">Complete Price History</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] pt-3 pb-1 mt-3">
                <span className="text-white font-medium">MON3Y</span>
                <span className="text-white">→</span>
                <span className="text-white font-medium">Raydium</span>
                <span className="text-white">→</span>
                <span className="text-[#52C97D] font-bold">Meteora</span>
              </div>
            </div>

            {/* Decorative Divider */}
            <div className="py-4">
              <div className="dashed-divider"></div>
            </div>

            {/* Timeframe Toggle */}
            <div className="stat-card">
              <p className="text-white text-[11px] font-medium mb-3 text-center">Timeframe</p>
              <TimeframeToggle
                currentTimeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            </div>

            {/* Decorative Divider */}
            <div className="py-4">
              <div className="dashed-divider"></div>
            </div>

            {/* Token Stats */}
            <TokenStats stats={tokenStats || null} isLoading={isStatsLoading} />
          </div>

          {/* Bottom Fixed Section */}
          <div className="bg-black px-6 pt-4 pb-12">
            {/* Decorative Divider */}
            <div className="pb-6">
              <div className="dashed-divider"></div>
            </div>

            {/* Follow Section */}
            <div>
              <a
                href="https://x.com/Trenchooooor"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-8 bg-[#52C97D]/5 hover:bg-[#52C97D]/15 transition-all cursor-pointer"
              >
                <p className="text-[#52C97D] text-base font-bold tracking-wider">FOLLOW</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-textMuted">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
