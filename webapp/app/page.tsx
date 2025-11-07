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
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">ZERA</h1>
            <span className="text-textMuted text-sm">Complete Price History</span>
          </div>
          <div className="flex gap-1 bg-background rounded-lg p-1">
            {(['minute', 'hour', 'day'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-blue text-white shadow-lg'
                    : 'text-textMuted hover:text-text hover:bg-surface'
                }`}
              >
                {tf === 'minute' ? '1M' : tf === 'hour' ? '1H' : '1D'}
              </button>
            ))}
          </div>
        </div>
        <a
          href="https://zeralabs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-textMuted hover:text-text transition-colors"
        >
          zeralabs.org ↗
        </a>
      </div>

      {/* Fullscreen Chart */}
      <div className="flex-1 w-full relative">
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
