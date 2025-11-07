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

  // Calculate statistics
  const getStats = () => {
    if (!poolsData || poolsData.length === 0) return null;

    let allData = poolsData.flatMap(p => p.data);
    if (allData.length === 0) return null;

    allData = allData.sort((a, b) => a.time - b.time);

    const startPrice = allData[0].close;
    const endPrice = allData[allData.length - 1].close;
    const priceChange = endPrice - startPrice;
    const priceChangePercent = (priceChange / startPrice) * 100;

    const allPrices = allData.flatMap(d => [d.high, d.low]);
    const highest = Math.max(...allPrices);
    const lowest = Math.min(...allPrices);

    const totalVolume = allData.reduce((sum, d) => sum + d.volume, 0);

    const startDate = new Date(allData[0].time * 1000);
    const endDate = new Date(allData[allData.length - 1].time * 1000);

    return {
      startPrice,
      endPrice,
      priceChange,
      priceChangePercent,
      highest,
      lowest,
      totalVolume,
      startDate,
      endDate,
      dataPoints: allData.length,
    };
  };

  const stats = getStats();

  return (
    <main className="min-h-screen p-4">
      <div className="w-full h-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            ZERA Token - Complete Price History
          </h1>
          <p className="text-textMuted">
            Interactive chart tracking M0N3Y → ZERA Raydium → ZERA Meteora migrations
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6 flex gap-2">
          {(['minute', 'hour', 'day'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-blue text-white'
                  : 'bg-surface text-textMuted hover:bg-border'
              }`}
            >
              {tf === 'minute' ? '1M' : tf === 'hour' ? '1H' : '1D'}
            </button>
          ))}
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface p-4 rounded-lg border border-border">
              <div className="text-textMuted text-sm mb-1">Price Change</div>
              <div className={`text-2xl font-bold ${stats.priceChange >= 0 ? 'text-green' : 'text-red'}`}>
                {stats.priceChange >= 0 ? '+' : ''}
                {stats.priceChangePercent.toFixed(2)}%
              </div>
              <div className="text-textMuted text-sm mt-1">
                ${stats.startPrice.toFixed(4)} → ${stats.endPrice.toFixed(4)}
              </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border">
              <div className="text-textMuted text-sm mb-1">ATH</div>
              <div className="text-2xl font-bold text-green">
                ${stats.highest.toFixed(4)}
              </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border">
              <div className="text-textMuted text-sm mb-1">ATL</div>
              <div className="text-2xl font-bold text-red">
                ${stats.lowest.toFixed(4)}
              </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border">
              <div className="text-textMuted text-sm mb-1">Total Volume</div>
              <div className="text-2xl font-bold">
                ${(stats.totalVolume / 1_000_000).toFixed(2)}M
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-surface rounded-lg border border-border p-6">
          {error && (
            <div className="text-red text-center py-8">
              Error loading chart data. Please try again.
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center h-[700px]">
              <div className="text-textMuted">Loading chart data...</div>
            </div>
          )}

          {!isLoading && !error && poolsData && (
            <Chart poolsData={poolsData} timeframe={timeframe} />
          )}
        </div>

        {/* Footer Info */}
        {stats && (
          <div className="mt-6 text-textMuted text-sm text-center">
            Data from {stats.startDate.toLocaleDateString()} to {stats.endDate.toLocaleDateString()} • {stats.dataPoints} data points • Updates automatically
          </div>
        )}
      </div>
    </main>
  );
}
