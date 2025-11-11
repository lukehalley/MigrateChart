'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, MouseEventParams } from 'lightweight-charts';
import { ChartNetwork } from 'lucide-react';
import { PoolData, MIGRATION_DATES, POOLS, Timeframe } from '@/lib/types';
import { drawVerticalLines } from '@/lib/verticalLine';
import { DrawingToolsPrimitive, DrawingStateManager, DrawingType } from '@/lib/drawingTools';
import { motion, AnimatePresence } from 'motion/react';
import { SafeStorage } from '@/lib/localStorage';
import { formatMarketCap } from '@/lib/utils';

interface ChartProps {
  poolsData: PoolData[];
  timeframe: Timeframe;
  displayMode: 'price' | 'marketCap';
  showVolume: boolean;
  showMigrationLines: boolean;
  onResetPosition?: () => void;
}

export default function Chart({ poolsData, timeframe, displayMode, showVolume, showMigrationLines, onResetPosition }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [isAboutClosing, setIsAboutClosing] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Drawing tools state
  const drawingPrimitiveRef = useRef<DrawingToolsPrimitive | null>(null);
  const drawingStateRef = useRef<DrawingStateManager>(new DrawingStateManager());
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingType | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Store migration lines cleanup function
  const migrationLinesCleanupRef = useRef<(() => void) | null>(null);

  // Store mouse event handlers for proper cleanup
  const mouseHandlersRef = useRef<{
    mousedown: ((e: MouseEvent) => void) | null;
    mouseup: ((e: MouseEvent) => void) | null;
    mouseleave: ((e: MouseEvent) => void) | null;
  }>({ mousedown: null, mouseup: null, mouseleave: null });

  const resetChartPosition = () => {
    const positionKey = `chartPosition_${timeframe}`;
    SafeStorage.removeItem(positionKey);
    setResetTrigger(prev => prev + 1);
  };

  // Expose reset function to parent
  useEffect(() => {
    if (onResetPosition) {
      (window as any).__resetChartPosition = resetChartPosition;
    }
    return () => {
      delete (window as any).__resetChartPosition;
    };
  }, [timeframe, onResetPosition]);

  const closeAboutModal = () => {
    setIsAboutClosing(true);
    setTimeout(() => {
      setShowAbout(false);
      setIsAboutClosing(false);
    }, 300); // Match animation duration
  };

  // Reset scroll position when modal opens
  useEffect(() => {
    if (showAbout && modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [showAbout]);

  // Drawing tool handlers
  const toggleDrawingMode = () => {
    const newMode = !isDrawingMode;
    setIsDrawingMode(newMode);
    drawingStateRef.current.setDrawingMode(newMode);

    if (!newMode) {
      setActiveDrawingTool(null);
      drawingStateRef.current.setActiveToolType(null);
    }
  };

  const selectDrawingTool = (tool: DrawingType) => {
    setActiveDrawingTool(tool);
    drawingStateRef.current.setActiveToolType(tool);
    if (!isDrawingMode) {
      setIsDrawingMode(true);
      drawingStateRef.current.setDrawingMode(true);
    }
  };

  const clearAllDrawings = () => {
    drawingPrimitiveRef.current?.clearAllDrawings();
    // Clear from localStorage
    const storageKey = `drawings_${timeframe}`;
    SafeStorage.removeItem(storageKey);
  };

  useEffect(() => {
    if (!chartContainerRef.current || poolsData.length === 0) return;

    setIsLoading(false);

    // Detect mobile device
    const isMobile = window.innerWidth < 768;

    // Note: Price scale persistence disabled - the margin-based approach is unreliable
    // and produces negative price values. Will need a different strategy in the future.

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
        barSpacing: isMobile ? 2 : 12,  // Tighter spacing on mobile
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
          top: isMobile ? 0.25 : 0.15,    // Mobile: smaller top margin for more chart space
          bottom: isMobile ? 0.15 : 0.15, // Mobile: larger bottom margin to reduce price axis
        },
        autoScale: true,  // Always use auto-scale for now (price scale persistence is too complex)
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

    // Track if this is the first series (we'll attach drawing tools to it)
    let isFirstSeries = true;

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
        priceFormat: displayMode === 'marketCap'
          ? {
              type: 'custom',
              formatter: formatMarketCap,
            }
          : {
              type: 'price',
              precision: 5,
              minMove: 0.00001,
            },
      });

      // Attach drawing tools to the first candlestick series
      if (isFirstSeries) {
        candlestickSeriesRef.current = candlestickSeries;
        const drawingPrimitive = new DrawingToolsPrimitive(chart);
        candlestickSeries.attachPrimitive(drawingPrimitive);
        drawingPrimitiveRef.current = drawingPrimitive;

        // Load saved drawings from localStorage
        const storageKey = `drawings_${timeframe}`;
        const drawings = SafeStorage.getJSON<any[]>(storageKey);
        if (drawings && Array.isArray(drawings)) {
          drawingPrimitive.setDrawings(drawings);
        }

        isFirstSeries = false;
      }

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
          lastValueVisible: false,
          priceLineVisible: false,
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
          top: isMobile ? 0.85 : 0.8, // Mobile: 15% for volume, Desktop: 20% for volume
          bottom: 0,
        },
        visible: false, // Hide volume axis labels
      });
    }

    // Add mouse event handlers for drawing tools
    const handleChartClick = (param: MouseEventParams) => {
      if (!drawingStateRef.current.isDrawingMode()) return;
      if (!param.point || !param.time) return; // Must be within data range

      const series = candlestickSeriesRef.current;
      const drawingPrimitive = drawingPrimitiveRef.current;
      if (!series || !drawingPrimitive) return;

      const price = series.coordinateToPrice(param.point.y);
      if (price === null) return;

      const activeToolType = drawingStateRef.current.getActiveToolType();

      if (activeToolType === 'horizontal-line') {
        drawingPrimitive.addHorizontalLine(price);
        SafeStorage.setJSON(`drawings_${timeframe}`, drawingPrimitive.getDrawings());
      } else if (activeToolType === 'trend-line') {
        const tempPoint = drawingStateRef.current.getTempPoint();

        if (!tempPoint) {
          drawingStateRef.current.setTempPoint({ time: param.time, price });
          drawingStateRef.current.setIsDrawing(true);
          drawingPrimitive.addTrendLine({ time: param.time, price }, { time: param.time, price });
        } else {
          drawingPrimitive.updateLastTrendLinePoint2({ time: param.time, price });
          drawingStateRef.current.setTempPoint(null);
          drawingStateRef.current.setIsDrawing(false);
          SafeStorage.setJSON(`drawings_${timeframe}`, drawingPrimitive.getDrawings());
        }
      }
    };

    // Handle mouse down for freehand drawing
    const handleMouseDown = (param: MouseEventParams) => {
      const activeToolType = drawingStateRef.current.getActiveToolType();
      if (!drawingStateRef.current.isDrawingMode() || activeToolType !== 'freehand') return;
      if (!param.point || !param.time) return; // Must be within data range

      const series = candlestickSeriesRef.current;
      const drawingPrimitive = drawingPrimitiveRef.current;
      if (!series || !drawingPrimitive) return;

      const price = series.coordinateToPrice(param.point.y);
      if (price === null) return;

      drawingPrimitive.startFreehand({ time: param.time, price });
      drawingStateRef.current.setIsDrawing(true);
    };

    // Handle mouse up for freehand drawing
    const handleMouseUp = () => {
      if (!drawingStateRef.current.isDrawing()) return;
      const activeToolType = drawingStateRef.current.getActiveToolType();
      if (activeToolType !== 'freehand') return;

      const drawingPrimitive = drawingPrimitiveRef.current;
      if (!drawingPrimitive) return;

      // Finish the freehand drawing
      drawingPrimitive.finishFreehand();
      drawingStateRef.current.setIsDrawing(false);

      // Save to localStorage
      const storageKey = `drawings_${timeframe}`;
      SafeStorage.setJSON(storageKey, drawingPrimitive.getDrawings());
    };

    // Throttle freehand drawing to prevent performance issues
    let lastFreehandPointTime = 0;
    const FREEHAND_THROTTLE_MS = 16; // ~60fps max

    const handleCrosshairMove = (param: MouseEventParams) => {
      const activeToolType = drawingStateRef.current.getActiveToolType();

      // Update preview for trend line while drawing
      if (
        drawingStateRef.current.isDrawingMode() &&
        drawingStateRef.current.isDrawing() &&
        activeToolType === 'trend-line' &&
        param.point &&
        param.time
      ) {
        const series = candlestickSeriesRef.current;
        if (!series) return;

        const price = series.coordinateToPrice(param.point.y);
        if (price === null) return;

        const drawingPrimitive = drawingPrimitiveRef.current;
        const tempPoint = drawingStateRef.current.getTempPoint();

        if (drawingPrimitive && tempPoint) {
          drawingPrimitive.updateLastTrendLinePoint2({ time: param.time, price });
        }
      }

      // Add points to freehand drawing while mouse is down (with throttling)
      if (
        drawingStateRef.current.isDrawingMode() &&
        drawingStateRef.current.isDrawing() &&
        activeToolType === 'freehand' &&
        param.point &&
        param.time
      ) {
        // Throttle to prevent adding too many points
        const now = Date.now();
        if (now - lastFreehandPointTime < FREEHAND_THROTTLE_MS) {
          return;
        }
        lastFreehandPointTime = now;

        const series = candlestickSeriesRef.current;
        if (!series) return;

        const price = series.coordinateToPrice(param.point.y);
        if (price === null) return;

        const drawingPrimitive = drawingPrimitiveRef.current;
        if (drawingPrimitive) {
          drawingPrimitive.addFreehandPoint({ time: param.time, price });
        }
      }
    };

    chart.subscribeClick(handleChartClick);
    chart.subscribeCrosshairMove(handleCrosshairMove);

    // Subscribe to mouse events for freehand drawing
    // We need to use the chart container's native mouse events
    // Define named handler for proper cleanup
    const handleNativeMouseDown = (e: MouseEvent) => {
      const chartContainer = chartContainerRef.current;
      if (!chartContainer) return;

      const rect = chartContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert to chart coordinates
      const series = candlestickSeriesRef.current;
      if (!series) return;

      const price = series.coordinateToPrice(y);
      const time = chart.timeScale().coordinateToTime(x);

      // Only allow drawing within data range
      if (price !== null && time !== null) {
        handleMouseDown({ point: { x, y }, time } as MouseEventParams);
      }
    };

    // Store handlers in ref for proper cleanup
    mouseHandlersRef.current.mousedown = handleNativeMouseDown;
    mouseHandlersRef.current.mouseup = handleMouseUp;
    mouseHandlersRef.current.mouseleave = handleMouseUp;

    const chartContainer = chartContainerRef.current;
    if (chartContainer) {
      chartContainer.addEventListener('mousedown', handleNativeMouseDown);
      chartContainer.addEventListener('mouseup', handleMouseUp);
      chartContainer.addEventListener('mouseleave', handleMouseUp); // Also finish on mouse leave
    }

    // Migration lines will be handled in a separate effect

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

    // Save chart position to localStorage
    const saveAndLogVisibleRange = () => {
      const visibleLogicalRange = chart.timeScale().getVisibleLogicalRange();
      const visibleTimeRange = chart.timeScale().getVisibleRange();

      if (visibleLogicalRange && visibleTimeRange) {
        const storageKey = `chartPosition_${timeframe}`;
        const positionData = {
          from: visibleTimeRange.from,
          to: visibleTimeRange.to,
        };
        SafeStorage.setJSON(storageKey, positionData);
      }
    };

    // Subscribe to time scale changes for position tracking
    chart.timeScale().subscribeVisibleLogicalRangeChange(saveAndLogVisibleRange);

    // Get all data points to calculate visible range
    const allData = poolsData.flatMap(pool => pool.data);
    if (allData.length > 0) {
      // Sort by time to get the range
      const sortedData = [...allData].sort((a, b) => a.time - b.time);
      const totalPoints = sortedData.length;
      const firstTime = sortedData[0].time;
      const lastTime = sortedData[totalPoints - 1].time;

      let fromTime: number;

      // For MAX timeframe, show all data
      // For all other timeframes, default to ~30 days of data
      if (timeframe === 'MAX') {
        fromTime = firstTime;
      } else {
        // Default to 60 days on desktop, 220 days on mobile for better context
        const defaultDays = isMobile ? 220 : 60;
        const DEFAULT_DAYS_SECONDS = defaultDays * 24 * 60 * 60;
        const daysAgo = lastTime - DEFAULT_DAYS_SECONDS;

        // Handle edge case: if token is less than default days old, show all available data
        fromTime = Math.max(daysAgo, firstTime);
      }

      // Check if there's a saved position in localStorage for this timeframe
      const storageKey = `chartPosition_${timeframe}`;
      const savedPosition = SafeStorage.getJSON<{ from: number; to: number }>(storageKey);

      let finalFrom: number;
      let finalTo: number;

      if (savedPosition) {
        // Restore saved position
        finalFrom = savedPosition.from;
        finalTo = savedPosition.to;
      } else {
        // No saved position, use default with mobile shift
        const timeWindow = lastTime - fromTime;
        const mobileShiftRatio = 0.756; // Shift forward to show both migration lines clearly
        const shiftAmount = isMobile ? Math.floor(timeWindow * mobileShiftRatio) : 0;

        finalFrom = fromTime + shiftAmount;
        finalTo = lastTime + shiftAmount;
      }

      // Set the visible range to show the calculated window
      // The rightOffset in timeScale options will add space on the right
      // Note: We DON'T call fitContent() after this because it would override
      // our custom visible range and show all data. The autoScale: true setting
      // on rightPriceScale will automatically adjust the price axis for visible data.
      chart.timeScale().setVisibleRange({
        from: finalFrom as Time,
        to: finalTo as Time,
      });

      // TODO: Implement proper price scale persistence
      // The margin-based approach produces negative prices which is invalid.
      // lightweight-charts doesn't provide a direct API to set price ranges.
      // Possible solutions to explore:
      // 1. Use applyOptions with custom price range calculation
      // 2. Save visible bar indices instead of price values
      // 3. Use timeScale.scrollToPosition + priceScale.applyOptions coordination
    }

    return () => {
      window.removeEventListener('resize', handleResize);

      // Unsubscribe from chart events
      chart.unsubscribeClick(handleChartClick);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(saveAndLogVisibleRange);

      // Remove mouse event listeners from chart container using stored refs
      const chartContainer = chartContainerRef.current;
      if (chartContainer) {
        if (mouseHandlersRef.current.mousedown) {
          chartContainer.removeEventListener('mousedown', mouseHandlersRef.current.mousedown);
        }
        if (mouseHandlersRef.current.mouseup) {
          chartContainer.removeEventListener('mouseup', mouseHandlersRef.current.mouseup);
        }
        if (mouseHandlersRef.current.mouseleave) {
          chartContainer.removeEventListener('mouseleave', mouseHandlersRef.current.mouseleave);
        }
      }

      // Clear handler refs
      mouseHandlersRef.current = { mousedown: null, mouseup: null, mouseleave: null };

      // Cleanup migration lines if they exist
      if (migrationLinesCleanupRef.current) {
        migrationLinesCleanupRef.current();
        migrationLinesCleanupRef.current = null;
      }

      chart.remove();
    };
  }, [poolsData, timeframe, displayMode, showVolume, resetTrigger]);

  // Separate effect to handle migration lines toggle without recreating chart
  useEffect(() => {
    if (!chartRef.current || !chartContainerRef.current) return;

    // Cleanup existing migration lines
    if (migrationLinesCleanupRef.current) {
      migrationLinesCleanupRef.current();
      migrationLinesCleanupRef.current = null;
    }

    // Add new migration lines if enabled
    if (showMigrationLines) {
      const migrationLines = Object.values(MIGRATION_DATES).map(migration => ({
        time: migration.timestamp,
        color: '#3FAA66',  // Darker ZERA green for lines
        label: migration.label,
        lineWidth: 2,
        labelBackgroundColor: '#0A1F12',  // Ultra dark green background
        labelTextColor: '#75D29F',  // Lighter green for text pop
      }));

      const cleanup = drawVerticalLines(
        chartRef.current,
        chartContainerRef.current,
        migrationLines
      );
      migrationLinesCleanupRef.current = cleanup || null;
    }

    return () => {
      // Cleanup on unmount
      if (migrationLinesCleanupRef.current) {
        migrationLinesCleanupRef.current();
        migrationLinesCleanupRef.current = null;
      }
    };
  }, [showMigrationLines, resetTrigger, timeframe, displayMode, showVolume]);

  // Separate effect to handle drawing mode changes without recreating chart
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      handleScroll: {
        mouseWheel: !isDrawingMode,
        pressedMouseMove: !isDrawingMode,
        horzTouchDrag: !isDrawingMode,
        vertTouchDrag: !isDrawingMode,
      },
      handleScale: {
        axisPressedMouseMove: {
          time: !isDrawingMode,
          price: !isDrawingMode,
        },
        mouseWheel: !isDrawingMode,
        pinch: !isDrawingMode,
        axisDoubleClickReset: {
          time: !isDrawingMode,
          price: !isDrawingMode,
        },
      },
      kineticScroll: {
        touch: false,
        mouse: false,
      },
    });
  }, [isDrawingMode]);

  return (
    <div className="w-full h-full p-4 md:p-6 relative">
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-textMuted">Loading chart...</div>
        </div>
      )}

      {/* Desktop: Top Left Buttons - Info and Drawing Tools */}
      <div className="hidden md:flex absolute top-6 left-6 md:top-8 md:left-8 z-10 gap-2">
        {/* About Info Button */}
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-black/90 backdrop-blur-sm border-2 border-[#52C97D]/50 rounded-full hover:bg-[#52C97D]/20 hover:border-[#52C97D] transition-all shadow-[0_0_12px_rgba(82,201,125,0.3)]"
          aria-label="About this chart"
        >
          <svg className="w-5 h-5 md:w-5 md:h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Drawing Tools Container */}
        <div className="relative flex items-center gap-2">
          {/* Toggle Drawing Mode Button */}
          <button
            onClick={toggleDrawingMode}
            className={`relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-all ${
              isDrawingMode
                ? 'bg-[#52C97D]/30 border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.5)]'
                : 'bg-black/90 border-[#52C97D]/50 hover:bg-[#52C97D]/20 hover:border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.3)]'
            }`}
            aria-label="Toggle drawing mode"
            title="Toggle Drawing Mode"
          >
            <ChartNetwork className="w-5 h-5 text-[#52C97D]" strokeWidth={2} />
          </button>

          {/* Drawing Tool Buttons - Slide from right of toggle button */}
          <AnimatePresence>
            {isDrawingMode && (
              <motion.div
                className="flex items-center gap-2 overflow-hidden"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {/* Horizontal Line Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('horizontal-line')}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'horizontal-line'
                      ? 'bg-[#52C97D]/30 border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.5)]'
                      : 'bg-black/90 border-[#52C97D]/50 hover:bg-[#52C97D]/20 hover:border-[#52C97D]'
                  }`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.05, ease: 'easeOut' }}
                  aria-label="Horizontal line tool"
                  title="Horizontal Line"
                >
                  <svg className="w-5 h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" strokeDasharray="4 2" />
                  </svg>
                </motion.button>

                {/* Trend Line Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('trend-line')}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'trend-line'
                      ? 'bg-[#52C97D]/30 border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.5)]'
                      : 'bg-black/90 border-[#52C97D]/50 hover:bg-[#52C97D]/20 hover:border-[#52C97D]'
                  }`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1, ease: 'easeOut' }}
                  aria-label="Trend line tool"
                  title="Trend Line"
                >
                  <svg className="w-5 h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19l14-14" />
                  </svg>
                </motion.button>

                {/* Freehand Pencil Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('freehand')}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'freehand'
                      ? 'bg-[#52C97D]/30 border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.5)]'
                      : 'bg-black/90 border-[#52C97D]/50 hover:bg-[#52C97D]/20 hover:border-[#52C97D]'
                  }`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.15, ease: 'easeOut' }}
                  aria-label="Freehand pencil tool"
                  title="Freehand Draw"
                >
                  <svg className="w-5 h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </motion.button>

                {/* Clear All Drawings Button */}
                <motion.button
                  onClick={clearAllDrawings}
                  className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-black/90 backdrop-blur-sm border-2 border-red-500/50 rounded-full hover:bg-red-500/20 hover:border-red-500 transition-colors"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.2, ease: 'easeOut' }}
                  aria-label="Clear all drawings"
                  title="Clear All Drawings"
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: Drawing Tools Button (below hamburger menu) */}
      <div className="md:hidden absolute top-[60px] left-3 z-30">
        <div className="relative flex flex-col gap-2">
          {/* Toggle Drawing Mode Button */}
          <button
            onClick={toggleDrawingMode}
            className={`w-11 h-11 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-all ${
              isDrawingMode
                ? 'bg-[#52C97D]/30 border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.5)]'
                : 'bg-[#0A1F12]/90 border-[#52C97D] hover:bg-[#0A1F12] shadow-[0_0_12px_rgba(82,201,125,0.3)] hover:shadow-[0_0_16px_rgba(82,201,125,0.5)]'
            }`}
            aria-label="Toggle drawing mode"
            title="Toggle Drawing Mode"
          >
            <ChartNetwork className="w-5 h-5 text-[#52C97D]" strokeWidth={2} />
          </button>

          {/* Drawing Tool Buttons - Slide down from toggle button */}
          <AnimatePresence>
            {isDrawingMode && (
              <motion.div
                className="flex flex-col gap-2 overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {/* Horizontal Line Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('horizontal-line')}
                  className={`w-11 h-11 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'horizontal-line'
                      ? 'bg-[#52C97D]/30 border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.5)]'
                      : 'bg-[#0A1F12]/90 border-[#52C97D] hover:bg-[#0A1F12] shadow-[0_0_12px_rgba(82,201,125,0.3)]'
                  }`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.05, ease: 'easeOut' }}
                  aria-label="Horizontal line tool"
                  title="Horizontal Line"
                >
                  <svg className="w-5 h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" strokeDasharray="4 2" />
                  </svg>
                </motion.button>

                {/* Trend Line Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('trend-line')}
                  className={`w-11 h-11 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'trend-line'
                      ? 'bg-[#52C97D]/30 border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.5)]'
                      : 'bg-[#0A1F12]/90 border-[#52C97D] hover:bg-[#0A1F12] shadow-[0_0_12px_rgba(82,201,125,0.3)]'
                  }`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1, ease: 'easeOut' }}
                  aria-label="Trend line tool"
                  title="Trend Line"
                >
                  <svg className="w-5 h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19l14-14" />
                  </svg>
                </motion.button>

                {/* Freehand Pencil Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('freehand')}
                  className={`w-11 h-11 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'freehand'
                      ? 'bg-[#52C97D]/30 border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.5)]'
                      : 'bg-[#0A1F12]/90 border-[#52C97D] hover:bg-[#0A1F12] shadow-[0_0_12px_rgba(82,201,125,0.3)]'
                  }`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.15, ease: 'easeOut' }}
                  aria-label="Freehand pencil tool"
                  title="Freehand Draw"
                >
                  <svg className="w-5 h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </motion.button>

                {/* Clear All Drawings Button */}
                <motion.button
                  onClick={clearAllDrawings}
                  className="w-11 h-11 flex items-center justify-center bg-[#0A1F12]/90 backdrop-blur-sm border-2 border-red-500 rounded-full hover:bg-red-500/20 hover:border-red-500 transition-colors shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.2, ease: 'easeOut' }}
                  aria-label="Clear all drawings"
                  title="Clear All Drawings"
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
                className="sticky top-0 z-10 bg-gradient-to-r from-[#0A1F12] via-[#1F6338]/20 to-[#0A1F12] border-b-[3px] border-[#52C97D]/50"
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
              <div
                ref={modalContentRef}
                style={{
                  padding: '32px 40px',
                  WebkitOverflowScrolling: 'touch' // Enable smooth scrolling on Safari
                }}
                className="max-h-[75vh] overflow-y-auto"
              >
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
        style={{
          touchAction: 'manipulation',
          cursor: isDrawingMode ? 'crosshair' : 'default'
        }}
      />
    </div>
  );
}
