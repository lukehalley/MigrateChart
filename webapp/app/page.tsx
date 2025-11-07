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
    <main className="w-screen h-screen overflow-hidden flex flex-col">
      {/* Minimal Header with Timeframe Selector */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">ZERA</h1>
          <div className="flex gap-2">
            {(['minute', 'hour', 'day'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-blue text-white'
                    : 'bg-surface text-textMuted hover:bg-border'
                }`}
              >
                {tf === 'minute' ? '1M' : tf === 'hour' ? '1H' : '1D'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Chart */}
      <div className="flex-1 w-full">
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
