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
        {/* Mobile Menu Toggle Button - Only visible on mobile */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="fixed top-3 left-3 z-50 info-card-small"
          aria-label="Toggle menu"
        >
          <div className="flex items-center gap-2">
            <img
              src="/circle-logo.avif"
              alt="ZERA"
              className="h-5 w-5"
            />
            <span className="text-white text-sm font-semibold">ZERA</span>
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
          <div className="md:hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-fade-in">
            {/* Main Info Card */}
            <div className="info-card-small w-[85vw] max-w-[320px]">
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
                <span className="text-white font-semibold">Meteora</span>
              </div>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center py-7">
              <div className="dashed-divider w-24"></div>
            </div>

            {/* Timeframe Toggle Card */}
            <div className="info-card-small w-[85vw] max-w-[320px]">
              <div className="py-3 px-3">
                <p className="text-white text-[10px] mb-3 text-center">Timeframe</p>
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
            <div className="flex items-center justify-center py-7">
              <div className="dashed-divider w-24"></div>
            </div>

            {/* Twitter Handle Card */}
            <div className="info-card-small w-[85vw] max-w-[320px]">
              <div className="text-center py-2">
                <p className="text-white text-[10px] mb-1">Made By</p>
                <a
                  href="https://x.com/Trenchooooor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#52C97D] text-xs transition-colors"
                >
                  @Trenchooooor
                </a>
              </div>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center py-7">
              <div className="dashed-divider w-24"></div>
            </div>

            {/* ZERA Tips Card */}
            <div className="info-card-small w-[85vw] max-w-[320px]">
              <div className="text-center py-2">
                <p className="text-white text-[10px] mb-1">Buy Me A Coffee</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb');
                    setShowCopied(true);
                    setTimeout(() => setShowCopied(false), 3000);
                    setShowMobileMenu(false);
                  }}
                  className="text-white hover:text-[#52C97D] text-xs transition-colors cursor-pointer"
                >
                  ☕ Send ZERA on Solana
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
        <div className="flex-[1] h-full bg-gradient-to-b from-black via-black to-black border-l border-dashed border-[#1F6338] opacity-80 overflow-hidden flex flex-col">
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
            <div className="space-y-8">
              {/* Follow */}
              <a
                href="https://x.com/Trenchooooor"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-8 bg-[#52C97D]/10 border border-dashed border-[#1F6338] hover:bg-[#52C97D]/20 hover:border-[#52C97D]/40 transition-all cursor-pointer"
              >
                <p className="text-[#52C97D] text-lg font-bold tracking-wider">FOLLOW</p>
              </a>

              {/* Support */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText('G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb');
                  setShowCopied(true);
                  setTimeout(() => setShowCopied(false), 3000);
                }}
                className="w-full text-center py-8 bg-[#52C97D]/10 border border-dashed border-[#1F6338] hover:bg-[#52C97D]/20 hover:border-[#52C97D]/40 transition-all cursor-pointer"
              >
                <p className="text-[#52C97D] text-lg font-bold tracking-wider">SUPPORT</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Success Popup */}
      {showCopied && (
        <div
          className="fixed top-4 md:top-8 z-[100] animate-fade-in px-4 md:px-0"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'auto',
            maxWidth: 'calc(100vw - 2rem)',
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '2px solid #52C97D',
              borderRadius: '0',
              padding: '10px 16px',
              boxShadow: '0 0 12px rgba(82, 201, 125, 0.3), 0 0 24px rgba(82, 201, 125, 0.15)',
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
