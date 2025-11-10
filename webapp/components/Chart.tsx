'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { PoolData, MIGRATION_DATES, POOLS, Timeframe } from '@/lib/types';
import { drawVerticalLines } from '@/lib/verticalLine';

interface ChartProps {
  poolsData: PoolData[];
  timeframe: Timeframe;
  displayMode: 'price' | 'marketCap';
  showVolume: boolean;
  showMigrationLines: boolean;
}

export default function Chart({ poolsData, timeframe, displayMode, showVolume, showMigrationLines }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [isAboutClosing, setIsAboutClosing] = useState(false);

  const closeAboutModal = () => {
    setIsAboutClosing(true);
    setTimeout(() => {
      setShowAbout(false);
      setIsAboutClosing(false);
    }, 300); // Match animation duration
  };

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
      height: chartContainerRef.current.clientHeight, // Use container height instead of window height
      timeScale: {
        borderColor: '#1F6338',  // Deep green border
        timeVisible: true,
        secondsVisible: false,
        rightOffset: isMobile ? 10 : 50,  // More space on right side by default
        barSpacing: isMobile ? 3 : 12,  // Slightly thicker candlesticks on mobile for better zoom
        minBarSpacing: isMobile ? 0.5 : 0.50,  // Improved minimum spacing for better mobile zoom control
        fixLeftEdge: false,  // Allow scrolling past edges
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: true,
        shiftVisibleRangeOnNewBar: true,  // Auto-scroll for new data
      },
      rightPriceScale: {
        borderColor: '#1F6338',  // Deep green border
        scaleMargins: {
          top: 0.15,    // 15% padding - more breathing room
          bottom: 0.15, // 15% padding - more breathing room
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

    // Store volume series references for toggling
    const volumeSeries: ISeriesApi<'Histogram'>[] = [];

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

      // For market cap mode, we need circulating supply
      // Using approximate circulating supply of 1 billion tokens
      const CIRCULATING_SUPPLY = 1_000_000_000;

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
          precision: displayMode === 'marketCap' ? 0 : 5,
          minMove: displayMode === 'marketCap' ? 1 : 0.00001,
        },
      });

      // Transform and set data
      const chartData: CandlestickData[] = filteredData
        .map(d => {
          if (displayMode === 'marketCap') {
            return {
              time: d.time as Time,
              open: d.open * CIRCULATING_SUPPLY,
              high: d.high * CIRCULATING_SUPPLY,
              low: d.low * CIRCULATING_SUPPLY,
              close: d.close * CIRCULATING_SUPPLY,
            };
          }
          return {
            time: d.time as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          };
        })
        .sort((a, b) => (a.time as number) - (b.time as number)); // Sort by time ascending

      candlestickSeries.setData(chartData);

      // Add volume histogram if enabled
      if (showVolume) {
        const volumeSeriesRef = chart.addHistogramSeries({
          color: '#52C97D40',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: 'volume',
        });

        const volumeData = filteredData
          .map(d => ({
            time: d.time as Time,
            value: d.volume,
            color: d.close >= d.open ? '#52C97D40' : '#ef535040',
          }))
          .sort((a, b) => (a.time as number) - (b.time as number));

        volumeSeriesRef.setData(volumeData);
        volumeSeries.push(volumeSeriesRef);
      }
    });

    // Configure volume price scale
    if (showVolume) {
      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8, // Volume takes bottom 20% of chart
          bottom: 0,
        },
      });
    }

    // Add migration markers as vertical lines using custom plugin (if enabled)
    let cleanupLines: (() => void) | undefined;
    if (showMigrationLines) {
      const migrationLines = Object.values(MIGRATION_DATES).map(migration => ({
        time: migration.timestamp,
        color: '#3FAA66',  // Darker ZERA green for lines
        label: migration.label,
        lineWidth: 2,
        labelBackgroundColor: '#0A1F12',  // Ultra dark green background
        labelTextColor: '#75D29F',  // Lighter green for text pop
      }));

      cleanupLines = drawVerticalLines(chart, chartContainerRef.current, migrationLines);
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
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
        case 'MAX':
          visibilityRatio = 1.0; // Show all data for MAX timeframe
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

      // If migration lines exist, trigger fade out and wait
      if (cleanupLines) {
        cleanupLines(); // This starts the fade out (500ms)
        // Delay chart removal to allow fade animation to complete
        setTimeout(() => {
          chart.remove();
        }, 500);
      } else {
        // No migration lines, remove immediately
        chart.remove();
      }
    };
  }, [poolsData, timeframe, displayMode, showVolume, showMigrationLines]);

  return (
    <div className="w-full h-full p-4 md:p-6 relative">
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-textMuted">Loading chart...</div>
        </div>
      )}

      {/* About Info Button - Top Left */}
      <button
        onClick={() => setShowAbout(!showAbout)}
        className="absolute top-6 left-6 md:top-8 md:left-8 z-10 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-black/90 backdrop-blur-sm border-2 border-[#52C97D]/50 rounded-full hover:bg-[#52C97D]/20 hover:border-[#52C97D] transition-all shadow-[0_0_12px_rgba(82,201,125,0.3)]"
        aria-label="About this chart"
      >
        <svg className="w-5 h-5 md:w-5 md:h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* About Modal */}
      {showAbout && (
        <>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/70 backdrop-blur-md z-20 ${isAboutClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onClick={closeAboutModal}
          />

          {/* Modal Content */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-[95%] max-w-2xl ${isAboutClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="bg-gradient-to-b from-[#0A1F12] to-black border-[3px] border-[#52C97D]/60 shadow-[0_0_50px_rgba(82,201,125,0.5)] overflow-hidden">
              {/* Header */}
              <div
                style={{ padding: '24px 36px' }}
                className="relative bg-gradient-to-r from-[#0A1F12] via-[#1F6338]/20 to-[#0A1F12] border-b-[3px] border-[#52C97D]/50"
              >
                <div className="flex items-center justify-between">
                  <h2 style={{ margin: 0 }} className="text-[#52C97D] text-xl md:text-2xl font-bold tracking-wide">About This Chart</h2>
                  <button
                    onClick={closeAboutModal}
                    className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-[#52C97D] hover:bg-[#52C97D]/10 rounded-full transition-all"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '32px 40px' }} className="max-h-[75vh] overflow-y-auto">
                {/* What You're Viewing */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '12px' }} className="text-[#52C97D] text-base md:text-lg font-bold tracking-wider uppercase">What You're Viewing</h3>
                  <p style={{ paddingLeft: '8px', lineHeight: '1.6', margin: 0 }} className="text-white/90 text-sm md:text-base">
                    The complete price history of the ZERA token from its launch on pump.fun through all pool migrations.
                  </p>
                </div>

                {/* Divider */}
                <div style={{ margin: '28px 0' }} className="border-t-2 border-[#52C97D]/30"></div>

                {/* Token Journey */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '16px' }} className="text-[#52C97D] text-base md:text-lg font-bold tracking-wider uppercase">Token Journey</h3>
                  <div style={{ padding: '20px 32px', marginBottom: '12px' }} className="flex items-center justify-center gap-4 bg-black/50 border-2 border-[#52C97D]/40 rounded-lg">
                    <span className="text-white text-sm md:text-base font-medium">M0N3Y</span>
                    <svg className="w-5 h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-white text-sm md:text-base font-medium">Raydium</span>
                    <svg className="w-5 h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-[#52C97D] text-sm md:text-base font-bold">Meteora</span>
                  </div>
                  <p style={{ paddingLeft: '8px', lineHeight: '1.6', margin: 0 }} className="text-white/70 text-xs md:text-sm">
                    ZERA started as M0N3Y on pump.fun, then migrated to Raydium, and finally to Meteora (current pool).
                  </p>
                </div>

                {/* Divider */}
                <div style={{ margin: '28px 0' }} className="border-t-2 border-[#52C97D]/30"></div>

                {/* How To Use */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '16px' }} className="text-[#52C97D] text-base md:text-lg font-bold tracking-wider uppercase">How To Use</h3>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ padding: '16px 20px' }} className="flex items-start gap-4 bg-black/50 border-2 border-[#52C97D]/30 rounded-lg hover:border-[#52C97D]/50 transition-all">
                      <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[#52C97D] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs md:text-sm">Select timeframes (1H to MAX) from the sidebar</span>
                    </div>
                    <div style={{ padding: '16px 20px' }} className="flex items-start gap-4 bg-black/50 border-2 border-[#52C97D]/30 rounded-lg hover:border-[#52C97D]/50 transition-all">
                      <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[#52C97D] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs md:text-sm">Zoom: Mouse wheel or pinch on mobile</span>
                    </div>
                    <div style={{ padding: '16px 20px' }} className="flex items-start gap-4 bg-black/50 border-2 border-[#52C97D]/30 rounded-lg hover:border-[#52C97D]/50 transition-all">
                      <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[#52C97D] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs md:text-sm">Pan: Click and drag or swipe</span>
                    </div>
                    <div style={{ padding: '16px 20px' }} className="flex items-start gap-4 bg-black/50 border-2 border-[#52C97D]/30 rounded-lg hover:border-[#52C97D]/50 transition-all">
                      <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[#52C97D] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs md:text-sm">Migration events shown as vertical green lines</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ margin: '28px 0' }} className="border-t-2 border-[#52C97D]/30"></div>

                {/* Data Sources */}
                <div style={{ padding: '16px 20px' }} className="text-center bg-black/60 border-2 border-[#52C97D]/40 rounded-lg">
                  <p style={{ margin: 0 }} className="text-white/60 text-xs md:text-sm">
                    <span className="text-[#52C97D] font-bold">Data sources:</span> Jupiter API, DexScreener, GeckoTerminal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div
        ref={chartContainerRef}
        className="w-full h-full"
        style={{ touchAction: 'manipulation' }}
      />
    </div>
  );
}
