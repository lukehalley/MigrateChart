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
      {/* Floating Logo & Controls - Top Left */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
        {/* Logo */}
        <img
          src="/img/zeralabs-logotype.webp"
          alt="ZERA"
          className="h-8 w-auto"
          style={{ filter: 'drop-shadow(0 0 15px rgba(82, 201, 125, 0.4))' }}
        />

        {/* Sleek Timeframe Switch */}
        <div className="flex gap-0.5 bg-black/90 backdrop-blur-sm rounded-lg p-0.5 border border-zera/30">
          {(['minute', 'hour', 'day'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                timeframe === tf
                  ? 'bg-zera text-black shadow-lg shadow-zera/60'
                  : 'text-zera/60 hover:text-zera'
              }`}
            >
              {tf === 'minute' ? '1M' : tf === 'hour' ? '1H' : '1D'}
            </button>
          ))}
        </div>
      </div>

      {/* Title - Top Right */}
      <div className="absolute top-6 right-6 z-10 text-sm text-textMuted font-medium">
        Complete Price History
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
