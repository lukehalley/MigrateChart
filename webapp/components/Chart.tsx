'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { PoolData, MIGRATION_DATES, POOLS, Timeframe } from '@/lib/types';
import { drawVerticalLines } from '@/lib/verticalLine';

interface ChartProps {
  poolsData: PoolData[];
  timeframe: Timeframe;
}

export default function Chart({ poolsData, timeframe }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current || poolsData.length === 0) return;

    setIsLoading(false);

    // Detect mobile device
    const isMobile = window.innerWidth < 768;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#000000' },
        textColor: '#FFFFFF',
      },
      grid: {
        vertLines: { color: '#1F633840' },  // Subtle dark green (25% opacity)
        horzLines: { color: '#1F633840' },  // Subtle dark green (25% opacity)
      },
      width: chartContainerRef.current.clientWidth,
      height: window.innerHeight, // Fullscreen - no header
      timeScale: {
        borderColor: '#1F6338',  // Deep green border
        timeVisible: true,
        secondsVisible: false,
        rightOffset: isMobile ? 10 : 50,  // More space on right side by default
        barSpacing: isMobile ? 2 : 12,  // Thicker candlesticks on desktop
        minBarSpacing: isMobile ? 0.10 : 0.50,  // Allow extreme zoom out on mobile
        fixLeftEdge: false,  // Allow scrolling past edges
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: true,
        shiftVisibleRangeOnNewBar: true,  // Auto-scroll for new data
      },
      rightPriceScale: {
        borderColor: '#1F6338',  // Deep green border
        scaleMargins: {
          top: 0.1,    // 10% padding - allows seeing full price range
          bottom: 0.1, // 10% padding
        },
        autoScale: true,  // Disable auto-scale to allow manual price scaling
        mode: 0,  // Normal price scale
        invertScale: false,
        alignLabels: true,
        minimumWidth: 0,
        entireTextOnly: false,
      },
      crosshair: {
        mode: 0, // Free moving
        vertLine: {
          color: '#52C97D',  // Bright ZERA green - pops!
          width: 1,
          style: 0,  // Solid line
          labelBackgroundColor: '#52C97D',
        },
        horzLine: {
          color: '#52C97D',  // Bright ZERA green - pops!
          width: 1,
          style: 0,  // Solid line
          labelBackgroundColor: '#52C97D',
        },
      },
      kineticScroll: {
        touch: false,  // Disable kinetic scrolling on touch devices
        mouse: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,  // Enable vertical dragging for price axis
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,  // Enable price axis scaling by dragging
        },
        mouseWheel: true,
        pinch: true,  // Enable pinch zoom
        axisDoubleClickReset: {
          time: true,
          price: true,  // Double-click to reset price scale
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
        upColor: '#52C97D',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#52C97D',
        wickDownColor: '#ef5350',
        priceLineVisible: false,
        lastValueVisible: false,
        priceFormat: {
          type: 'price',
          precision: 5,
          minMove: 0.00001,
        },
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
      color: '#3FAA66',  // Darker ZERA green for lines
      label: migration.label,
      lineWidth: 2,
      labelBackgroundColor: '#0A1F12',  // Ultra dark green background
      labelTextColor: '#75D29F',  // Lighter green for text pop
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

    // Log visible range changes in development
    if (process.env.NODE_ENV === 'development') {
      const logVisibleRange = () => {
        const visibleLogicalRange = chart.timeScale().getVisibleLogicalRange();
        if (visibleLogicalRange) {
          const visibleBars = Math.round(visibleLogicalRange.to - visibleLogicalRange.from);
          const totalBars = allData.length;
          const currentVisibilityRatio = visibleBars / totalBars;

          console.log('Chart Movement:', {
            device: isMobile ? 'MOBILE' : 'DESKTOP',
            timeframe,
            visibleBars,
            totalBars,
            currentVisibilityRatio: currentVisibilityRatio.toFixed(4),
            currentPercentage: (currentVisibilityRatio * 100).toFixed(2) + '%',
          });
        }
      };

      chart.timeScale().subscribeVisibleLogicalRangeChange(logVisibleRange);
    }

    // Get all data points to calculate visible range
    const allData = poolsData.flatMap(pool => pool.data);
    if (allData.length > 0) {
      // Sort by time to get the range
      const sortedData = [...allData].sort((a, b) => a.time - b.time);
      const totalPoints = sortedData.length;
      const firstTime = sortedData[0].time;
      const lastTime = sortedData[totalPoints - 1].time;

      // Calculate how much data to show based on device and timeframe
      // Mobile: show ~17-23% of data, Desktop: show ~3-5% of data (4x zoom)
      // Adjust based on timeframe for better initial view - zoomed towards end for migration clarity
      let visibilityRatio = isMobile ? 0.17 : 0.0375;

      // Adjust ratio based on timeframe - shorter timeframes show more of the data
      switch(timeframe) {
        case '1H':
          visibilityRatio = isMobile ? 0.23 : 0.05;
          break;
        case '4H':
          visibilityRatio = isMobile ? 0.20 : 0.045;
          break;
        case '8H':
          visibilityRatio = isMobile ? 0.1878 : 0.04;
          break;
        case '1D':
          visibilityRatio = isMobile ? 0.17 : 0.0375;
          break;
        case '1W':
          visibilityRatio = isMobile ? 0.15 : 0.03;
          break;
      }

      const timeRange = lastTime - firstTime;
      const visibleTimeRange = timeRange * visibilityRatio;
      const fromTime = lastTime - visibleTimeRange;

      // Log parameters for local dev tuning
      if (process.env.NODE_ENV === 'development') {
        console.log('Chart Zoom Parameters:', {
          device: isMobile ? 'MOBILE' : 'DESKTOP',
          timeframe,
          visibilityRatio,
          totalDataPoints: totalPoints,
          visibleDataPoints: Math.round(totalPoints * visibilityRatio),
          barSpacing: isMobile ? 2 : 12,
          rightOffset: isMobile ? 10 : 50,
        });
      }

      // Set the visible range to zoom into the most recent data
      // The rightOffset in timeScale options will add space on the right
      chart.timeScale().setVisibleRange({
        from: fromTime as Time,
        to: lastTime as Time,
      });

      // Fit price range to visible data initially
      chart.timeScale().fitContent();
    }

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
      <div
        ref={chartContainerRef}
        className="w-full h-full"
        style={{ touchAction: 'manipulation' }}
      />
    </div>
  );
}
