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
      <div className="absolute top-10 left-10 z-50 bg-black/90 backdrop-blur-2xl rounded-3xl p-12">
        {/* Logo & Title */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src="/circle-logo.avif"
            alt="ZERA"
            className="h-16 w-16"
          />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">ZERA</h1>
            <p className="text-zera-200 text-base">Complete Price History</p>
          </div>
        </div>

        {/* Migration Path */}
        <div className="flex items-center justify-center gap-3 text-base pt-6 mt-6 border-t border-zera-800/30">
          <span className="text-zera-300/60 font-medium">MON3Y</span>
          <span className="text-zera-400 text-lg">→</span>
          <span className="text-zera-300/60 font-medium">Raydium</span>
          <span className="text-zera-400 text-lg">→</span>
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
