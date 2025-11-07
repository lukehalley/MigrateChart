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
      {/* Floating Info Card - Top Left */}
      <div className="absolute top-10 left-10 z-50 bg-black/90 backdrop-blur-2xl rounded-2xl p-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-5 mb-6">
          <img
            src="/circle-logo.avif"
            alt="ZERA"
            className="h-14 w-14"
          />
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">ZERA</h1>
            <p className="text-zera-200 text-sm">Complete Price History</p>
          </div>
        </div>

        {/* Migration Path */}
        <div className="flex items-center justify-center gap-2 text-sm pt-8 mt-8 border-t border-zera-800/30">
          <span className="text-zera-300/60 font-medium">MON3Y</span>
          <span className="text-zera-400">→</span>
          <span className="text-zera-300/60 font-medium">Raydium</span>
          <span className="text-zera-400">→</span>
          <span className="text-zera-300 font-semibold">Meteora</span>
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
