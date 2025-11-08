'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Chart from '@/components/Chart';
import TimeframeToggle from '@/components/TimeframeToggle';
import TokenStats from '@/components/TokenStats';
import { fetchAllPoolsData, fetchTokenStats } from '@/lib/api';
import { PoolData, Timeframe, POOLS } from '@/lib/types';

export default function Home() {
  const [timeframe, setTimeframe] = useState<Timeframe>('1H');
  const [showCopied, setShowCopied] = useState(false);
  const [isCopiedFadingOut, setIsCopiedFadingOut] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Fetch data with SWR for automatic revalidation
  // Optimized intervals for live updates while respecting rate limits
  const { data: poolsData, error, isLoading } = useSWR<PoolData[]>(
    `/api/pools/${timeframe}`,
    () => fetchAllPoolsData(timeframe),
    {
      // More frequent updates for shorter timeframes
      refreshInterval: timeframe === '1H' ? 60000   // 1 minute for 1H
                     : timeframe === '4H' ? 180000  // 3 minutes for 4H
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
    <main className="w-screen h-screen overflow-hidden">
      {/* Mobile View */}
      <div className="md:hidden w-full h-full relative">
        {/* Mobile Menu Toggle Button - Floating hamburger menu */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="fixed top-3 left-3 z-50 w-11 h-11 flex items-center justify-center bg-[#0A1F12]/90 hover:bg-[#0A1F12] border-2 border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.3)] hover:shadow-[0_0_16px_rgba(82,201,125,0.5)] transition-all backdrop-blur-sm"
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
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Popup Content */}
          <div className="md:hidden fixed inset-0 z-50 animate-fade-in overflow-y-auto flex items-center justify-center p-4 pointer-events-none">
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
                      setShowMobileMenu(false);
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

              {/* Follow & Support Section */}
              <div className="w-[85vw] max-w-[320px] mt-2">
                {/* Follow */}
                <a
                  href="https://x.com/Trenchooooor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-6 bg-[#52C97D]/5 hover:bg-[#52C97D]/15 transition-all cursor-pointer info-card-small mb-0"
                >
                  <p className="text-[#52C97D] text-sm font-bold tracking-wider">FOLLOW</p>
                </a>

                {/* Divider */}
                <div className="h-px bg-[#52C97D]/30"></div>

                {/* Support */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb');
                    setShowCopied(true);
                    setIsCopiedFadingOut(false);
                    setTimeout(() => setIsCopiedFadingOut(true), 2500);
                    setTimeout(() => setShowCopied(false), 3000);
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-center py-6 bg-[#52C97D]/5 hover:bg-[#52C97D]/15 transition-all cursor-pointer info-card-small mb-0"
                >
                  <p className="text-[#52C97D] text-sm font-bold tracking-wider">SUPPORT</p>
                </button>
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

      {/* Desktop View - Split Layout */}
      <div className="hidden md:flex w-full h-full">
        {/* Left Section - Chart (90%) */}
        <div className="flex-[9] h-full relative">
          {/* Desktop Chart */}
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

        {/* Right Section - Token Stats Sidebar (10%) */}
        <div className="flex-[1] h-full bg-gradient-to-b from-black via-black to-black border-l-2 border-dashed border-[#52C97D]/60 overflow-hidden flex flex-col" style={{ boxShadow: '-8px 0 8px rgba(82, 201, 125, 0.2)' }}>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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

            {/* Follow & Support Section */}
            <div>
              {/* Follow */}
              <a
                href="https://x.com/Trenchooooor"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-8 bg-[#52C97D]/5 hover:bg-[#52C97D]/15 transition-all cursor-pointer"
              >
                <p className="text-[#52C97D] text-base font-bold tracking-wider">FOLLOW</p>
              </a>

              {/* Divider */}
              <div className="h-px bg-[#52C97D]/30"></div>

              {/* Support */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText('G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb');
                  setShowCopied(true);
                  setIsCopiedFadingOut(false);
                  setTimeout(() => setIsCopiedFadingOut(true), 2500);
                  setTimeout(() => setShowCopied(false), 3000);
                }}
                className="w-full text-center py-8 bg-[#52C97D]/5 hover:bg-[#52C97D]/15 transition-all cursor-pointer"
              >
                <p className="text-[#52C97D] text-base font-bold tracking-wider">SUPPORT</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Success Popup */}
      {showCopied && (
        <div className="fixed inset-x-0 top-4 md:top-8 z-[100] flex justify-center px-4 pointer-events-none">
          <div
            className={`transition-opacity duration-500 ${isCopiedFadingOut ? 'opacity-0' : 'opacity-100'}`}
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '2px solid #52C97D',
              borderRadius: '0',
              padding: '12px 20px',
              boxShadow: '0 0 16px rgba(82, 201, 125, 0.4), 0 0 32px rgba(82, 201, 125, 0.2)',
            }}
          >
            <p className="text-[#52C97D] text-xs md:text-sm font-semibold whitespace-nowrap">
              ✓ Solana Address Copied!
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
