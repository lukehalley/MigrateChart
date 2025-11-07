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
      <div className="absolute top-8 left-8 z-10 bg-black/80 backdrop-blur-lg border-2 border-zera/50 rounded-2xl p-6 shadow-2xl"
           style={{ boxShadow: '0 0 40px rgba(82, 201, 125, 0.4), inset 0 0 30px rgba(82, 201, 125, 0.08)' }}>
        {/* Logo & Title */}
        <div className="flex items-center gap-4 mb-5">
          <img
            src="/img/zeralabs-logotype.webp"
            alt="ZERA"
            className="h-10 w-auto"
            style={{ filter: 'drop-shadow(0 0 15px rgba(82, 201, 125, 0.7))' }}
          />
          <span className="text-textMuted text-sm font-medium">Complete History</span>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-1.5 bg-black/70 rounded-full p-1.5">
          {(['minute', 'hour', 'day'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                timeframe === tf
                  ? 'bg-zera text-black shadow-xl shadow-zera/80'
                  : 'text-zera/50 hover:text-zera/90'
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
