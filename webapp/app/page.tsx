'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Chart from '@/components/Chart';
import { fetchAllPoolsData } from '@/lib/api';
import { PoolData } from '@/lib/types';

export default function Home() {
  const [timeframe, setTimeframe] = useState<'minute' | 'hour' | 'day'>('day');
  const [showCopied, setShowCopied] = useState(false);

  // Fetch data with SWR for automatic revalidation
  const { data: poolsData, error, isLoading } = useSWR<PoolData[]>(
    `/api/pools/${timeframe}`,
    () => fetchAllPoolsData(timeframe),
    {
      refreshInterval: timeframe === 'minute' ? 60000 : timeframe === 'hour' ? 300000 : 3600000,
      revalidateOnFocus: false,
    }
  );

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      {/* Main Info Card - Top Left with Glowing Border */}
      <div
        className="absolute top-10 left-10 z-50"
        style={{
          background: '#000000',
          border: '3px solid #52C97D',
          borderRadius: '14px',
          padding: '24px 32px',
          boxShadow: '0 0 20px rgba(82, 201, 125, 0.6), 0 0 40px rgba(82, 201, 125, 0.4), 0 0 60px rgba(82, 201, 125, 0.3)',
        }}
      >
        {/* Logo & Title */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src="/circle-logo.avif"
            alt="ZERA"
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-2xl font-bold text-white mb-0.5">ZERA</h1>
            <p className="text-gray-400 text-xs">Complete Price History</p>
          </div>
        </div>

        {/* Migration Path */}
        <div className="flex items-center justify-center gap-2 text-xs pt-4 pb-1 mt-4 border-t border-gray-700/40">
          <span className="text-gray-400 font-medium">MON3Y</span>
          <span className="text-gray-400">→</span>
          <span className="text-gray-400 font-medium">Raydium</span>
          <span className="text-gray-400">→</span>
          <span className="text-gray-200 font-semibold">Meteora</span>
        </div>
      </div>

      {/* Twitter Handle Card */}
      <div
        className="absolute top-[165px] left-10 z-50"
        style={{
          background: '#000000',
          border: '3px solid #52C97D',
          borderRadius: '14px',
          padding: '10px 28px',
          boxShadow: '0 0 20px rgba(82, 201, 125, 0.6), 0 0 40px rgba(82, 201, 125, 0.4), 0 0 60px rgba(82, 201, 125, 0.3)',
        }}
      >
        <div className="text-center">
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

      {/* ZERA Tips Card */}
      <div
        className="absolute top-[235px] left-10 z-50"
        style={{
          background: '#000000',
          border: '3px solid #52C97D',
          borderRadius: '14px',
          padding: '10px 28px',
          boxShadow: '0 0 20px rgba(82, 201, 125, 0.6), 0 0 40px rgba(82, 201, 125, 0.4), 0 0 60px rgba(82, 201, 125, 0.3)',
        }}
      >
        <div className="text-center">
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

      {/* Copy Success Popup */}
      {showCopied && (
        <div
          className="fixed top-8 z-[100] animate-fade-in"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#000000',
            border: '2px solid #52C97D',
            borderRadius: '12px',
            padding: '12px 24px',
            boxShadow: '0 0 20px rgba(82, 201, 125, 0.8), 0 0 40px rgba(82, 201, 125, 0.5)',
          }}
        >
          <p className="text-[#52C97D] text-sm font-semibold">
            ✓ Solana address copied to clipboard!
          </p>
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
