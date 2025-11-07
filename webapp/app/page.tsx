'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Chart from '@/components/Chart';
import { fetchAllPoolsData } from '@/lib/api';
import { PoolData } from '@/lib/types';

export default function Home() {
  const [timeframe, setTimeframe] = useState<'minute' | 'hour' | 'day'>('day');

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
      {/* Floating Controls - Top Left */}
      <div className="absolute top-10 left-10 z-50 flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-4 bg-gradient-to-br from-black/90 via-black/80 to-black/70 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_0_50px_rgba(82,201,125,0.4)]">
          <img
            src="/circle-logo.avif"
            alt="ZERA"
            className="h-10 w-10 drop-shadow-[0_0_15px_rgba(82,201,125,0.8)]"
          />
          <span className="text-white/80 text-base font-medium">Complete History</span>
        </div>

        {/* Timeframe Toggle */}
        <div className="inline-flex bg-black/90 backdrop-blur-xl rounded-full p-1 shadow-lg">
          {(['minute', 'hour', 'day'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                timeframe === tf
                  ? 'bg-zera text-black shadow-[0_0_20px_rgba(82,201,125,0.8)]'
                  : 'text-zera/40 hover:text-zera/80 hover:bg-zera/5'
              }`}
            >
              {tf === 'minute' ? '1M' : tf === 'hour' ? '1H' : '1D'}
            </button>
          ))}
        </div>
      </div>

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
