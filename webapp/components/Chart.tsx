'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { PoolData, MIGRATION_DATES, POOLS } from '@/lib/types';
import { drawVerticalLines } from '@/lib/verticalLine';

interface ChartProps {
  poolsData: PoolData[];
  timeframe: 'minute' | 'hour' | 'day';
}

export default function Chart({ poolsData, timeframe }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current || poolsData.length === 0) return;

    setIsLoading(false);

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#000000' },
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: '#2b6c4373' },
        horzLines: { visible: false },
      },
      width: chartContainerRef.current.clientWidth,
      height: window.innerHeight, // Fullscreen - no header
      timeScale: {
        borderColor: '#2b6c43ff',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2b6c43ff',
      },
      crosshair: {
        mode: 0, // 0 = Normal (free moving), 1 = Magnet (locks to bars)
        vertLine: {
          color: '#2b6c43ff',
          width: 1,
          style: 2,
          labelBackgroundColor: '#2b6c43ff',
        },
        horzLine: {
          color: '#2b6c43ff',
          width: 1,
          style: 2,
          labelBackgroundColor: '#2b6c43ff',
        },
      },
    });

    chartRef.current = chart;

    // Add candlestick series for each pool
    const migrations = Object.values(MIGRATION_DATES);
    const migration1 = migrations[0].timestamp;
    const migration2 = migrations[1].timestamp;

    poolsData.forEach((poolData) => {
      if (poolData.data.length === 0) return;

      // Filter data based on migrations
      let filteredData = [...poolData.data];
      if (poolData.pool_name === 'mon3y') {
        filteredData = filteredData.filter(d => d.time < migration1);
      } else if (poolData.pool_name === 'zera_Raydium') {
        filteredData = filteredData.filter(d => d.time < migration2);
      }

      if (filteredData.length === 0) return;

      // Get pool color
      const poolInfo = POOLS[poolData.pool_name as keyof typeof POOLS];
      const color = poolInfo?.color || '#4ECDC4';

      // Create candlestick series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        priceLineVisible: false,
        lastValueVisible: false,
      });

      // Transform and set data
      const chartData: CandlestickData[] = filteredData
        .map(d => ({
          time: d.time as Time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
        .sort((a, b) => (a.time as number) - (b.time as number)); // Sort by time ascending

      candlestickSeries.setData(chartData);
    });

    // Add migration markers as vertical lines using custom plugin
    const migrationLines = Object.values(MIGRATION_DATES).map(migration => ({
      time: migration.timestamp,
      color: '#52C97D',
      label: migration.label,
      lineWidth: 2,
      labelBackgroundColor: '#000000',
      labelTextColor: '#52C97D',
    }));

    const cleanupLines = drawVerticalLines(chart, chartContainerRef.current, migrationLines);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: window.innerHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Fit content
    chart.timeScale().fitContent();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (cleanupLines) cleanupLines();
      chart.remove();
    };
  }, [poolsData, timeframe]);

  const chartHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  return (
    <div className="w-full h-full">
      {isLoading && (
        <div className="flex items-center justify-center" style={{ height: `${chartHeight}px` }}>
          <div className="text-textMuted">Loading chart...</div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
