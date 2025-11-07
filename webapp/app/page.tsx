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
      <div className="absolute top-6 left-6 z-10 bg-black/70 backdrop-blur-md border-2 border-zera/40 rounded-xl p-4 shadow-2xl"
           style={{ boxShadow: '0 0 30px rgba(82, 201, 125, 0.3), inset 0 0 20px rgba(82, 201, 125, 0.05)' }}>
        {/* Logo & Title */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/img/zeralabs-logotype.webp"
            alt="ZERA"
            className="h-7 w-auto"
            style={{ filter: 'drop-shadow(0 0 10px rgba(82, 201, 125, 0.6))' }}
          />
          <span className="text-textMuted text-xs">Complete History</span>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-1 bg-black/60 rounded-full p-1">
          {(['minute', 'hour', 'day'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                timeframe === tf
                  ? 'bg-zera text-black shadow-lg shadow-zera/70'
                  : 'text-zera/40 hover:text-zera/80'
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
