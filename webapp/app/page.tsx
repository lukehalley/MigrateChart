'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Chart from '@/components/Chart';
import TimeframeToggle from '@/components/TimeframeToggle';
import { fetchAllPoolsData } from '@/lib/api';
import { PoolData, Timeframe } from '@/lib/types';

export default function Home() {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [showCopied, setShowCopied] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Fetch data with SWR for automatic revalidation
  const { data: poolsData, error, isLoading } = useSWR<PoolData[]>(
    `/api/pools/${timeframe}`,
    () => fetchAllPoolsData(timeframe),
    {
      refreshInterval: timeframe === '1H' ? 300000 : timeframe === '4H' ? 900000 : timeframe === '1D' ? 3600000 : 7200000,
      revalidateOnFocus: false,
    }
  );

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      {/* Mobile Menu Toggle Button - Only visible on mobile */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="md:hidden fixed top-3 left-3 z-50 info-card-small"
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
                  <p className="text-gray-400 text-[10px]">Complete Price History</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] pt-3 pb-1 mt-3 border-t border-gray-700/40">
                <span className="text-gray-400 font-medium">MON3Y</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-400 font-medium">Raydium</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-200 font-semibold">Meteora</span>
              </div>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center py-7">
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#52C97D]/60 to-transparent shadow-[0_0_8px_rgba(82,201,125,0.4)]"></div>
            </div>

            {/* Timeframe Toggle Card */}
            <div className="info-card-small w-[85vw] max-w-[320px]">
              <div className="py-3 px-3">
                <p className="text-gray-500 text-[10px] mb-3 text-center">Timeframe</p>
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
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#52C97D]/60 to-transparent shadow-[0_0_8px_rgba(82,201,125,0.4)]"></div>
            </div>

            {/* Twitter Handle Card */}
            <div className="info-card-small w-[85vw] max-w-[320px]">
              <div className="text-center py-2">
                <p className="text-gray-500 text-[10px] mb-1">Made By</p>
                <a
                  href="https://x.com/Trenchooooor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-[#52C97D] text-xs transition-colors"
                >
                  @Trenchooooor
                </a>
              </div>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center py-7">
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#52C97D]/60 to-transparent shadow-[0_0_8px_rgba(82,201,125,0.4)]"></div>
            </div>

            {/* ZERA Tips Card */}
            <div className="info-card-small w-[85vw] max-w-[320px]">
              <div className="text-center py-2">
                <p className="text-gray-500 text-[10px] mb-1">Buy Me A Coffee</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb');
                    setShowCopied(true);
                    setTimeout(() => setShowCopied(false), 3000);
                    setShowMobileMenu(false);
                  }}
                  className="text-gray-300 hover:text-[#52C97D] text-xs transition-colors cursor-pointer"
                >
                  ☕ Send ZERA on Solana
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Info Cards - Always visible on desktop */}
      <div className="hidden md:flex md:flex-col absolute top-10 left-10 z-50">
        {/* Main Info Card */}
        <div className="info-card-small">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/circle-logo.avif"
              alt="ZERA"
              className="h-8 w-8"
            />
            <div>
              <h1 className="text-lg font-bold text-white mb-0">ZERA</h1>
              <p className="text-gray-400 text-[10px]">Complete Price History</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] pt-3 pb-1 mt-3 border-t border-gray-700/40">
            <span className="text-gray-400 font-medium">MON3Y</span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-400 font-medium">Raydium</span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-200 font-semibold">Meteora</span>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center py-12">
          <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#52C97D]/60 to-transparent shadow-[0_0_8px_rgba(82,201,125,0.4)]"></div>
        </div>

        {/* Timeframe Toggle Card */}
        <div className="info-card-small">
          <div className="py-3 px-3">
            <p className="text-gray-500 text-[10px] mb-3 text-center">Timeframe</p>
            <TimeframeToggle
              currentTimeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center py-12">
          <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#52C97D]/60 to-transparent shadow-[0_0_8px_rgba(82,201,125,0.4)]"></div>
        </div>

        {/* Twitter Handle Card */}
        <div className="info-card-small">
          <div className="text-center py-2">
            <p className="text-gray-500 text-[10px] mb-1">Made By</p>
            <a
              href="https://x.com/Trenchooooor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-[#52C97D] text-xs transition-colors"
            >
              @Trenchooooor
            </a>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center py-12">
          <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#52C97D]/60 to-transparent shadow-[0_0_8px_rgba(82,201,125,0.4)]"></div>
        </div>

        {/* ZERA Tips Card */}
        <div className="info-card-small">
          <div className="text-center py-2">
            <p className="text-gray-500 text-[10px] mb-1">Buy Me A Coffee</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText('G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb');
                setShowCopied(true);
                setTimeout(() => setShowCopied(false), 3000);
              }}
              className="text-gray-300 hover:text-[#52C97D] text-xs transition-colors cursor-pointer"
            >
              ☕ Send ZERA on Solana
            </button>
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
              borderRadius: '12px',
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

      {/* Fullscreen Chart */}
      <div className="w-full h-full relative">
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
    </main>
  );
}
