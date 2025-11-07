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
      {/* Floating Card - Top Left */}
      <div className="absolute top-10 left-10 z-10 bg-black/85 backdrop-blur-xl border-4 border-zera/60 rounded-3xl p-10 shadow-2xl"
           style={{ boxShadow: '0 0 60px rgba(82, 201, 125, 0.5), inset 0 0 40px rgba(82, 201, 125, 0.1)' }}>
        {/* Logo & Title */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src="/img/zeralabs-logotype.webp"
            alt="ZERA"
            className="h-16 w-auto"
            style={{ filter: 'drop-shadow(0 0 20px rgba(82, 201, 125, 0.8))' }}
          />
          <span className="text-text text-lg font-semibold">Complete History</span>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-2 bg-black/80 rounded-full p-2">
          {(['minute', 'hour', 'day'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-8 py-3 rounded-full text-base font-bold transition-all duration-200 ${
                timeframe === tf
                  ? 'bg-zera text-black shadow-2xl shadow-zera/90'
                  : 'text-zera/50 hover:text-zera hover:bg-zera/10'
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
