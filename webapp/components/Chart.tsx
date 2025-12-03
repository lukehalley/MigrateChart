'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, MouseEventParams, Logical } from 'lightweight-charts';
import { ChartNetwork, Ruler, Eraser } from 'lucide-react';
import { PoolData, Timeframe, MigrationConfig } from '@/lib/types';
import { drawVerticalLines } from '@/lib/verticalLine';
import { DrawingToolsPrimitive, DrawingStateManager, DrawingType } from '@/lib/drawingTools';
import { motion, AnimatePresence } from 'motion/react';
import { SafeStorage } from '@/lib/localStorage';
import { formatMarketCap } from '@/lib/utils';
import { polyfillCanvasRoundRect } from '@/lib/canvasPolyfills';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  IndicatorType,
  INDICATORS,
  OHLCData
} from '@/lib/indicators';
import TextBoxEditor, { TextBoxData } from '@/components/TextBoxEditor';
import TextBoxSizeControl from '@/components/TextBoxSizeControl';

interface ChartProps {
  poolsData: PoolData[];
  timeframe: Timeframe;
  displayMode: 'price' | 'marketCap';
  showVolume: boolean;
  showMigrationLines: boolean;
  migrations: MigrationConfig[];
  primaryColor: string;
  secondaryColor?: string;
  isLogScale: boolean;
  onLogScaleToggle: () => void;
  isAutoScale: boolean;
  onAutoScaleToggle: () => void;
  onResetPosition?: () => void;
  showMobileMenu?: boolean;
  onOpenMobileMenu?: () => void;
}

export default function Chart({ poolsData, timeframe, displayMode, showVolume, showMigrationLines, migrations, primaryColor, secondaryColor = '#000000', isLogScale, onLogScaleToggle, isAutoScale, onAutoScaleToggle, onResetPosition, showMobileMenu, onOpenMobileMenu }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [isAboutClosing, setIsAboutClosing] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [chartVersion, setChartVersion] = useState(0);

  // Helper to get RGB values from hex color
  const getRgbFromHex = (hex: string) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return { r, g, b };
  };

  const rgb = getRgbFromHex(primaryColor);
  const rgbString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  // Button style helpers
  const buttonBaseStyle = {
    borderColor: `rgba(${rgbString}, 0.5)`,
    boxShadow: `0 0 12px rgba(${rgbString}, 0.3)`,
  };

  const buttonActiveStyle = {
    backgroundColor: `rgba(${rgbString}, 0.3)`,
    borderColor: primaryColor,
    boxShadow: `0 0 12px rgba(${rgbString}, 0.5)`,
  };

  const buttonHoverClass = `hover:bg-[${primaryColor}]/20 hover:border-[${primaryColor}]`;

  // Drawing tools state
  const drawingPrimitiveRef = useRef<DrawingToolsPrimitive | null>(null);
  const drawingStateRef = useRef<DrawingStateManager>(new DrawingStateManager());
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingType | null>(null);
  const [drawingCount, setDrawingCount] = useState(0);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Indicators state
  const [enabledIndicators, setEnabledIndicators] = useState<Set<IndicatorType>>(() => {
    // Load from localStorage on mount
    const saved = SafeStorage.getJSON<IndicatorType[]>('enabledIndicators');
    return new Set(saved || []);
  });
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);

  // Text box editor state
  const [selectedTextBoxId, setSelectedTextBoxId] = useState<string | null>(null);
  const [editingTextBoxId, setEditingTextBoxId] = useState<string | null>(null);
  const [textBoxes, setTextBoxes] = useState<Map<string, any>>(new Map());
  const [isDraggingTextBox, setIsDraggingTextBox] = useState(false);
  const [isResizingTextBox, setIsResizingTextBox] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; startX?: number; startY?: number; startWidth?: number; startHeight?: number; startRotation?: number } | null>(null);
  const isClosingEditorRef = useRef(false);

  // New text box UI state
  const [isHoveringTextBox, setIsHoveringTextBox] = useState(false);
  const [textBoxUpdateCounter, setTextBoxUpdateCounter] = useState(0);
  const [showSizeControl, setShowSizeControl] = useState(false);
  const justStartedTextBoxDragRef = useRef(false);
  const justDeselectedTextBoxRef = useRef(false);

  // Store migration lines cleanup function
  const migrationLinesCleanupRef = useRef<(() => void) | null>(null);

  // Store mouse and touch event handlers for proper cleanup
  const mouseHandlersRef = useRef<{
    mousedown: ((e: MouseEvent) => void) | null;
    mouseup: ((e: MouseEvent) => void) | null;
    mouseleave: ((e: MouseEvent) => void) | null;
    touchstart: ((e: TouchEvent) => void) | null;
    touchmove: ((e: TouchEvent) => void) | null;
    touchend: ((e: TouchEvent) => void) | null;
  }>({ mousedown: null, mouseup: null, mouseleave: null, touchstart: null, touchmove: null, touchend: null });

  const resetChartPosition = () => {
    // Trigger chart recreation to reset zoom/pan to initial state
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

    // Close indicator menu when opening drawing mode
    if (newMode) {
      setShowIndicatorMenu(false);
      setIsHoveringTextBox(false); // Clear hover state
    } else {
      // Clean up when closing drawing mode
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

    // Deselect text box when switching to eraser
    if (tool === 'eraser' && selectedTextBoxId) {
      setSelectedTextBoxId(null);
    }
  };

  const clearAllDrawings = () => {
    drawingPrimitiveRef.current?.clearAllDrawings();
    // Clear from localStorage
    const storageKey = `drawings_${timeframe}`;
    SafeStorage.removeItem(storageKey);
    // Update drawing count
    setDrawingCount(0);
  };

  const undoLastDrawing = () => {
    const drawingPrimitive = drawingPrimitiveRef.current;
    if (!drawingPrimitive) return;

    // Remove the last drawing
    drawingPrimitive.removeLastDrawing();

    // Update localStorage with remaining drawings
    const storageKey = `drawings_${timeframe}`;
    const remainingDrawings = drawingPrimitive.getDrawings();
    if (remainingDrawings.length > 0) {
      SafeStorage.setJSON(storageKey, remainingDrawings);
    } else {
      SafeStorage.removeItem(storageKey);
    }
    // Update drawing count
    setDrawingCount(remainingDrawings.length);
  };

  const toggleIndicator = (indicator: IndicatorType) => {
    setEnabledIndicators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(indicator)) {
        newSet.delete(indicator);
      } else {
        newSet.add(indicator);
      }
      return newSet;
    });
  };

  const clearAllIndicators = () => {
    setEnabledIndicators(new Set());
  };

  // Save enabled indicators to localStorage when they change
  useEffect(() => {
    SafeStorage.setJSON('enabledIndicators', Array.from(enabledIndicators));
  }, [enabledIndicators]);

  // One-time cleanup: Remove old cached chart positions
  useEffect(() => {
    const timeframes: Timeframe[] = ['1H', '4H', '8H', '1D', 'MAX'];
    timeframes.forEach(tf => {
      SafeStorage.removeItem(`chartPosition_${tf}`);
    });
  }, []); // Empty deps - runs once on mount

  useEffect(() => {
    if (!chartContainerRef.current || poolsData.length === 0) return;

    // Apply canvas polyfills for older browsers
    polyfillCanvasRoundRect();

    setIsLoading(false);

    // Detect mobile device (includes tablets and fold phones)
    const isMobile = window.innerWidth < 1024;

    // Note: Price scale persistence disabled - the margin-based approach is unreliable
    // and produces negative price values. Will need a different strategy in the future.

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#000000' },
        textColor: '#FFFFFF',
      },
      grid: {
        vertLines: {
          color: `${primaryColor}40`,  // Primary color with 25% opacity
          visible: true,
        },
        horzLines: {
          color: `${primaryColor}40`,  // Primary color with 25% opacity
          visible: true,
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight, // Use container height instead of window height
      timeScale: {
        borderColor: primaryColor,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: isMobile ? 25 : 10,  // Empty space (in bars) to the right of the latest candle
        barSpacing: isMobile ? 5 : 12,  // Initial bar width - higher = more zoomed in (fewer bars visible)
        minBarSpacing: 0.001,  // Very small minimum to allow zooming out on finer timeframes with many candles
        fixLeftEdge: false,  // Allow scrolling past edges
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: true,
        shiftVisibleRangeOnNewBar: false,  // Don't auto-scroll - preserve user's position
      },
      rightPriceScale: {
        borderColor: primaryColor,
        scaleMargins: {
          top: isMobile ? 0.15 : 0.1,    // Reduced top margin for more price range visibility
          bottom: isMobile ? 0.15 : 0.1, // Reduced bottom margin for more price range visibility
        },
        autoScale: true,  // Always enable autoscale for proper scaling
        mode: isLogScale ? 1 : 0,  // 1 = logarithmic, 0 = normal
        invertScale: false,
        alignLabels: true,
        minimumWidth: 0,
        entireTextOnly: false,
        ticksVisible: true,  // Ensure ticks are visible on price scale
      },
      crosshair: {
        mode: 0, // Free moving
        vertLine: {
          color: `rgba(${rgbString}, 0.8)`,
          width: 1,
          style: 0,  // Solid line
          labelBackgroundColor: primaryColor,
        },
        horzLine: {
          color: `rgba(${rgbString}, 0.8)`,
          width: 1,
          style: 0,  // Solid line
          labelBackgroundColor: primaryColor,
        },
      },
      kineticScroll: {
        touch: false,  // Disable kinetic scrolling on touch devices
        mouse: false,
      },
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
    });

    chartRef.current = chart;

    // Increment chart version to trigger migration lines redraw
    setChartVersion(prev => prev + 1);

    // Store volume series references for toggling
    const volumeSeries: ISeriesApi<'Histogram'>[] = [];

    // Track if this is the first series (we'll attach drawing tools to it)
    let isFirstSeries = true;

    poolsData.forEach((poolData) => {
      if (poolData.data.length === 0) return;

      // No need to filter by migrations - data is already filtered by backend
      const filteredData = [...poolData.data];

      if (filteredData.length === 0) return;

      // Pool color is not needed anymore - we use primaryColor for all candles

      // For market cap mode, we need circulating supply
      // Using approximate circulating supply of 1 billion tokens
      const CIRCULATING_SUPPLY = 1_000_000_000;

      // Custom price formatter that prevents negative values from being displayed
      const priceFormatter = (price: number) => {
        const value = Math.max(0, price); // Clamp to minimum of 0
        return value.toFixed(5);
      };

      // Create candlestick series - always use green for candles
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
              formatter: (price: number) => formatMarketCap(Math.max(0, price)),
            }
          : {
              type: 'custom',
              formatter: priceFormatter,
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
          // Check if drawings use old time-based format
          const hasOldFormat = drawings.some((d: any) => {
            if (d.type === 'trend-line' || d.type === 'freehand') {
              const point = d.type === 'trend-line' ? d.point1 : d.points?.[0];
              return point && 'time' in point && !('logical' in point);
            }
            return false;
          });

          if (hasOldFormat) {
            // Clear old time-based drawings - they won't render correctly
            console.log('Clearing old time-based drawings - please redraw them');
            SafeStorage.setJSON(storageKey, []);
            setDrawingCount(0);
          } else {
            drawingPrimitive.setDrawings(drawings);
            setDrawingCount(drawings.length);
          }
        } else {
          setDrawingCount(0);
        }

        isFirstSeries = false;
      }

      // Transform and set data
      const chartData: CandlestickData[] = filteredData
        .map(d => {
          if (displayMode === 'marketCap') {
            return {
              time: d.time as Time,
              open: Math.max(0, d.open * CIRCULATING_SUPPLY),
              high: Math.max(0, d.high * CIRCULATING_SUPPLY),
              low: Math.max(0, d.low * CIRCULATING_SUPPLY),
              close: Math.max(0, d.close * CIRCULATING_SUPPLY),
            };
          }
          return {
            time: d.time as Time,
            open: Math.max(0, d.open),
            high: Math.max(0, d.high),
            low: Math.max(0, d.low),
            close: Math.max(0, d.close),
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
            color: d.close >= d.open ? `${primaryColor}40` : '#ef535040',
          }))
          .sort((a, b) => (a.time as number) - (b.time as number));

        volumeSeriesRef.setData(volumeData);
        volumeSeries.push(volumeSeriesRef);
      }
    });

    // Add indicators
    if (enabledIndicators.size > 0) {
      // Get all data combined for indicator calculations
      // Use a Map to deduplicate by timestamp (keep the latest value for each timestamp)
      const dataMap = new Map<number, OHLCData>();

      poolsData.forEach(pool => {
        pool.data.forEach(d => {
          const ohlc: OHLCData = {
            time: d.time,
            open: displayMode === 'marketCap' ? d.open * 1_000_000_000 : d.open,
            high: displayMode === 'marketCap' ? d.high * 1_000_000_000 : d.high,
            low: displayMode === 'marketCap' ? d.low * 1_000_000_000 : d.low,
            close: displayMode === 'marketCap' ? d.close * 1_000_000_000 : d.close,
          };
          // Keep the latest value for duplicate timestamps
          dataMap.set(d.time, ohlc);
        });
      });

      // Convert map to sorted array
      const allData: OHLCData[] = Array.from(dataMap.values())
        .sort((a, b) => a.time - b.time);

      enabledIndicators.forEach(indicator => {
        const config = INDICATORS[indicator];

        if (indicator === 'sma20' || indicator === 'sma50' || indicator === 'sma200') {
          const period = config.period!;
          const smaData = calculateSMA(allData, period);
          if (smaData.length > 0) {
            const smaLine = chart.addLineSeries({
              color: config.color,
              lineWidth: 2,
              title: config.label,
              priceLineVisible: false,
              lastValueVisible: true,
            });
            smaLine.setData(smaData);
          }
        } else if (indicator === 'ema20' || indicator === 'ema50' || indicator === 'ema200') {
          const period = config.period!;
          const emaData = calculateEMA(allData, period);
          if (emaData.length > 0) {
            const emaLine = chart.addLineSeries({
              color: config.color,
              lineWidth: 2,
              title: config.label,
              priceLineVisible: false,
              lastValueVisible: true,
            });
            emaLine.setData(emaData);
          }
        } else if (indicator === 'rsi') {
          const rsiData = calculateRSI(allData, 14);
          if (rsiData.length > 0) {
            const rsiLine = chart.addLineSeries({
              color: config.color,
              lineWidth: 2,
              title: config.label,
              priceScaleId: 'rsi',
              priceLineVisible: false,
              lastValueVisible: true,
            });
            rsiLine.setData(rsiData);

            // Configure RSI price scale (0-100)
            chart.priceScale('rsi').applyOptions({
              scaleMargins: {
                top: 0.85,
                bottom: 0,
              },
              borderVisible: false,
            });

            // Add reference lines at 30 and 70
            const rsiSeries30 = chart.addLineSeries({
              color: '#666666',
              lineWidth: 1,
              priceScaleId: 'rsi',
              priceLineVisible: false,
              lastValueVisible: false,
              lineStyle: 1, // Dashed
            });
            rsiSeries30.setData(rsiData.map(d => ({ time: d.time, value: 30 })));

            const rsiSeries70 = chart.addLineSeries({
              color: '#666666',
              lineWidth: 1,
              priceScaleId: 'rsi',
              priceLineVisible: false,
              lastValueVisible: false,
              lineStyle: 1, // Dashed
            });
            rsiSeries70.setData(rsiData.map(d => ({ time: d.time, value: 70 })));
          }
        } else if (indicator === 'bb') {
          const bbData = calculateBollingerBands(allData, 20, 2);
          if (bbData.length > 0) {
            // Upper band
            const upperLine = chart.addLineSeries({
              color: config.color,
              lineWidth: 1,
              title: 'BB Upper',
              priceLineVisible: false,
              lastValueVisible: false,
            });
            upperLine.setData(bbData.map(d => ({ time: d.time, value: d.upper })));

            // Middle band (SMA)
            const middleLine = chart.addLineSeries({
              color: config.color,
              lineWidth: 2,
              title: config.label,
              priceLineVisible: false,
              lastValueVisible: true,
            });
            middleLine.setData(bbData.map(d => ({ time: d.time, value: d.middle })));

            // Lower band
            const lowerLine = chart.addLineSeries({
              color: config.color,
              lineWidth: 1,
              title: 'BB Lower',
              priceLineVisible: false,
              lastValueVisible: false,
            });
            lowerLine.setData(bbData.map(d => ({ time: d.time, value: d.lower })));
          }
        }
      });
    }

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
      if (!param.point) return;

      // Ignore click if we just closed the editor
      if (isClosingEditorRef.current) {
        return;
      }

      const series = candlestickSeriesRef.current;
      const drawingPrimitive = drawingPrimitiveRef.current;
      if (!series || !drawingPrimitive) return;

      // Text box clicks are now handled in handleNativeMouseDown for immediate drag
      // This handler is only for drawing mode operations
      if (!drawingStateRef.current.isDrawingMode()) {
        return;
      }

      const price = series.coordinateToPrice(param.point.y);
      if (price === null) return;

      // Use logical coordinates - works anywhere on the chart including rightOffset area
      const logical = chart.timeScale().coordinateToLogical(param.point.x);
      if (logical === null) return;

      const activeToolType = drawingStateRef.current.getActiveToolType();

      if (activeToolType === 'horizontal-line') {
        drawingPrimitive.addHorizontalLine(price, primaryColor);
        const updatedDrawings = drawingPrimitive.getDrawings();
        SafeStorage.setJSON(`drawings_${timeframe}`, updatedDrawings);
        setDrawingCount(updatedDrawings.length);
      } else if (activeToolType === 'trend-line') {
        const tempPoint = drawingStateRef.current.getTempPoint();

        if (!tempPoint) {
          drawingStateRef.current.setTempPoint({ logical, price });
          drawingStateRef.current.setIsDrawing(true);
          drawingPrimitive.addTrendLine({ logical, price }, { logical, price }, primaryColor);
        } else {
          drawingPrimitive.updateLastTrendLinePoint2({ logical, price });
          drawingStateRef.current.setTempPoint(null);
          drawingStateRef.current.setIsDrawing(false);
          const updatedDrawings = drawingPrimitive.getDrawings();
          SafeStorage.setJSON(`drawings_${timeframe}`, updatedDrawings);
          setDrawingCount(updatedDrawings.length);
        }
      } else if (activeToolType === 'ruler') {
        const tempPoint = drawingStateRef.current.getTempPoint();

        if (!tempPoint) {
          drawingStateRef.current.setTempPoint({ logical, price });
          drawingStateRef.current.setIsDrawing(true);
          drawingPrimitive.addRuler({ logical, price }, { logical, price }, primaryColor);
        } else {
          drawingPrimitive.updateLastRulerPoint2({ logical, price });
          drawingStateRef.current.setTempPoint(null);
          drawingStateRef.current.setIsDrawing(false);
          const updatedDrawings = drawingPrimitive.getDrawings();
          SafeStorage.setJSON(`drawings_${timeframe}`, updatedDrawings);
          setDrawingCount(updatedDrawings.length);
        }
      } else if (activeToolType === 'eraser') {
        // Eraser mode - delete whatever is clicked
        const clickedDrawing = drawingPrimitive.findDrawingAtCoordinates(param.point.x, param.point.y);
        if (clickedDrawing) {
          drawingPrimitive.removeDrawing(clickedDrawing.id);
          const updatedDrawings = drawingPrimitive.getDrawings();
          SafeStorage.setJSON(`drawings_${timeframe}`, updatedDrawings);
          setDrawingCount(updatedDrawings.length);

          // If it was a selected text box, deselect it
          if (selectedTextBoxId === clickedDrawing.id) {
            setSelectedTextBoxId(null);
          }
        }
      } else if (activeToolType === 'text-box') {
        // Check if we just started dragging an existing text box
        if (justStartedTextBoxDragRef.current) {
          return; // Don't start new text box drawing
        }

        // Check if we just deselected a text box
        if (justDeselectedTextBoxRef.current) {
          return; // Don't start new text box drawing
        }

        // Check if clicking on an existing text box (safety check - should be caught by handleNativeMouseDown)
        const clickedTextBox = drawingPrimitive.findTextBoxAtCoordinates(param.point.x, param.point.y);
        if (clickedTextBox) {
          return; // Don't start new text box drawing, let drag handle it
        }

        const tempPoint = drawingStateRef.current.getTempPoint();

        if (!tempPoint) {
          // First click - create a ruler preview rectangle (like ruler tool)
          drawingStateRef.current.setTempPoint({ logical, price });
          drawingStateRef.current.setIsDrawing(true);
          drawingPrimitive.addRuler({ logical, price }, { logical, price }, primaryColor);
        } else {
          // Second click - convert ruler preview to text box
          // Calculate rectangle bounds (can be drawn in any direction)
          const startX = chart.timeScale().logicalToCoordinate(tempPoint.logical as Logical);
          const startY = series.priceToCoordinate(tempPoint.price);
          const endX = param.point.x;
          const endY = param.point.y;

          if (startX === null || startY === null) return;

          // Calculate top-left corner of rectangle (minimum x, minimum y)
          const rectX = Math.min(startX, endX);
          const rectY = Math.min(startY, endY);
          const rectWidth = Math.abs(endX - startX);
          const rectHeight = Math.abs(endY - startY);

          const finalWidth = Math.max(224, rectWidth); // Min width 224px
          const finalHeight = Math.max(60, rectHeight); // Min height ~60px

          // Convert top-left position back to logical coordinates for storage
          const rectLogical = chart.timeScale().coordinateToLogical(rectX);
          const rectPrice = series.coordinateToPrice(rectY);

          if (rectLogical === null || rectPrice === null) return;

          // Remove the ruler preview
          drawingPrimitive.removeLastDrawing();

          // Create text box at the top-left corner with calculated dimensions
          const id = drawingPrimitive.addTextBox(
            { logical: rectLogical, price: rectPrice },
            'Text',
            primaryColor,
            undefined,
            finalWidth,
            finalHeight
          );

          drawingStateRef.current.setTempPoint(null);
          drawingStateRef.current.setIsDrawing(false);

          const updatedDrawings = drawingPrimitive.getDrawings();
          SafeStorage.setJSON(`drawings_${timeframe}`, updatedDrawings);
          setDrawingCount(updatedDrawings.length);

          // Select the new text box and start editing immediately
          setSelectedTextBoxId(id);
          setEditingTextBoxId(id);
        }
      }
    };

    // Handle mouse down for freehand drawing
    const handleMouseDown = (param: MouseEventParams) => {
      const activeToolType = drawingStateRef.current.getActiveToolType();
      if (!drawingStateRef.current.isDrawingMode() || activeToolType !== 'freehand') return;
      if (!param.point) return;

      const series = candlestickSeriesRef.current;
      const drawingPrimitive = drawingPrimitiveRef.current;
      if (!series || !drawingPrimitive) return;

      const price = series.coordinateToPrice(param.point.y);
      if (price === null) return;

      // Use logical coordinates - works anywhere on the chart including rightOffset area
      const logical = chart.timeScale().coordinateToLogical(param.point.x);
      if (logical === null) return;

      drawingPrimitive.startFreehand({ logical, price }, primaryColor);
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
      const updatedDrawings = drawingPrimitive.getDrawings();
      SafeStorage.setJSON(storageKey, updatedDrawings);
      setDrawingCount(updatedDrawings.length);
    };

    // Throttle freehand drawing to prevent performance issues
    let lastFreehandPointTime = 0;
    const FREEHAND_THROTTLE_MS = 16; // ~60fps max

    const handleCrosshairMove = (param: MouseEventParams) => {
      const activeToolType = drawingStateRef.current.getActiveToolType();

      // Check if hovering over any text box (for cursor and crosshair management)
      // Allow this even in text-box mode so you can see hover state on existing text
      const isTextBoxMode = drawingStateRef.current.isDrawingMode() && activeToolType === 'text-box';
      const allowTextBoxHover = !drawingStateRef.current.isDrawingMode() || isTextBoxMode;

      if (allowTextBoxHover && !editingTextBoxId && param.point) {
        const hoveredTextBox = drawingPrimitiveRef.current?.findTextBoxAtCoordinates(param.point.x, param.point.y);
        setIsHoveringTextBox(!!hoveredTextBox);
      } else {
        setIsHoveringTextBox(false);
      }

      // Update preview for trend line while drawing
      if (
        drawingStateRef.current.isDrawingMode() &&
        drawingStateRef.current.isDrawing() &&
        activeToolType === 'trend-line' &&
        param.point
      ) {
        const series = candlestickSeriesRef.current;
        if (!series) return;

        const price = series.coordinateToPrice(param.point.y);
        if (price === null) return;

        // Use logical coordinates - works anywhere on the chart including rightOffset area
        const logical = chart.timeScale().coordinateToLogical(param.point.x);
        if (logical === null) return;

        const drawingPrimitive = drawingPrimitiveRef.current;
        const tempPoint = drawingStateRef.current.getTempPoint();

        if (drawingPrimitive && tempPoint) {
          drawingPrimitive.updateLastTrendLinePoint2({ logical, price });
        }
      }

      // Update preview for ruler while drawing
      if (
        drawingStateRef.current.isDrawingMode() &&
        drawingStateRef.current.isDrawing() &&
        activeToolType === 'ruler' &&
        param.point
      ) {
        const series = candlestickSeriesRef.current;
        if (!series) return;

        const price = series.coordinateToPrice(param.point.y);
        if (price === null) return;

        // Use logical coordinates - works anywhere on the chart including rightOffset area
        const logical = chart.timeScale().coordinateToLogical(param.point.x);
        if (logical === null) return;

        const drawingPrimitive = drawingPrimitiveRef.current;
        const tempPoint = drawingStateRef.current.getTempPoint();

        if (drawingPrimitive && tempPoint) {
          drawingPrimitive.updateLastRulerPoint2({ logical, price });
        }
      }

      // Update preview rectangle for text box while drawing (using ruler)
      if (
        drawingStateRef.current.isDrawingMode() &&
        drawingStateRef.current.isDrawing() &&
        activeToolType === 'text-box' &&
        param.point
      ) {
        const series = candlestickSeriesRef.current;
        if (!series) return;

        const price = series.coordinateToPrice(param.point.y);
        if (price === null) return;

        const logical = chart.timeScale().coordinateToLogical(param.point.x);
        if (logical === null) return;

        const drawingPrimitive = drawingPrimitiveRef.current;
        const tempPoint = drawingStateRef.current.getTempPoint();

        if (drawingPrimitive && tempPoint) {
          // Update the ruler preview rectangle (same as ruler tool)
          drawingPrimitive.updateLastRulerPoint2({ logical, price });
        }
      }

      // Add points to freehand drawing while mouse is down (with throttling)
      if (
        drawingStateRef.current.isDrawingMode() &&
        drawingStateRef.current.isDrawing() &&
        activeToolType === 'freehand' &&
        param.point
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

        // Use logical coordinates - works anywhere on the chart including rightOffset area
        const logical = chart.timeScale().coordinateToLogical(param.point.x);
        if (logical === null) return;

        const drawingPrimitive = drawingPrimitiveRef.current;
        if (drawingPrimitive) {
          drawingPrimitive.addFreehandPoint({ logical, price });
        }
      }
    };

    chart.subscribeClick(handleChartClick);
    chart.subscribeCrosshairMove(handleCrosshairMove);

    // Subscribe to mouse events for freehand drawing and text box immediate drag
    // We need to use the chart container's native mouse events
    // Define named handler for proper cleanup
    const handleNativeMouseDown = (e: MouseEvent) => {
      const chartContainer = chartContainerRef.current;
      if (!chartContainer) return;

      const rect = chartContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicking on a text box (even if not selected) - immediate drag
      // Allow this even in text-box drawing mode so you can move existing text
      const drawingPrimitive = drawingPrimitiveRef.current;
      const activeToolType = drawingStateRef.current.getActiveToolType();
      const isTextBoxMode = drawingStateRef.current.isDrawingMode() && activeToolType === 'text-box';
      const allowTextBoxInteraction = !drawingStateRef.current.isDrawingMode() || isTextBoxMode;

      if (allowTextBoxInteraction && !editingTextBoxId && drawingPrimitive) {
        const clickedTextBox = drawingPrimitive.findTextBoxAtCoordinates(x, y);
        if (clickedTextBox) {
          // If we're in the middle of drawing a text box (tempPoint exists), cancel it first
          if (drawingStateRef.current.isDrawing() && drawingStateRef.current.getTempPoint()) {
            drawingPrimitive.removeLastDrawing();
            drawingStateRef.current.setTempPoint(null);
            drawingStateRef.current.setIsDrawing(false);
          }

          // Select the text box
          setSelectedTextBoxId(clickedTextBox.id);

          // Immediately start dragging
          const textBoxData = getTextBoxData(clickedTextBox);
          if (textBoxData) {
            setIsDraggingTextBox(true);
            setDragStart({
              x: e.clientX - textBoxData.x,
              y: e.clientY - textBoxData.y,
            });

            // Set flag to prevent handleChartClick from starting new text box
            justStartedTextBoxDragRef.current = true;
            setTimeout(() => {
              justStartedTextBoxDragRef.current = false;
            }, 50);
          }
          return; // Don't process as regular mouse down
        }
      }

      // Convert to chart coordinates
      const series = candlestickSeriesRef.current;
      if (!series) return;

      const price = series.coordinateToPrice(y);
      if (price === null) return;

      const time = chart.timeScale().coordinateToTime(x);

      // Pass to handleMouseDown which will convert to logical coordinates
      handleMouseDown({ point: { x, y }, time } as MouseEventParams);
    };

    // Touch event handlers for mobile/tablet support
    const handleNativeTouchStart = (e: TouchEvent) => {
      const chartContainer = chartContainerRef.current;
      if (!chartContainer) return;

      // Only handle single touch
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      const rect = chartContainer.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Check if touching an existing text box (even if not in drawing mode) - immediate drag
      const drawingPrimitive = drawingPrimitiveRef.current;
      const activeToolType = drawingStateRef.current.getActiveToolType();
      const isTextBoxMode = drawingStateRef.current.isDrawingMode() && activeToolType === 'text-box';
      const allowTextBoxInteraction = !drawingStateRef.current.isDrawingMode() || isTextBoxMode;

      if (allowTextBoxInteraction && !editingTextBoxId && drawingPrimitive) {
        const clickedTextBox = drawingPrimitive.findTextBoxAtCoordinates(x, y);
        if (clickedTextBox) {
          // Prevent scrolling when interacting with text boxes
          e.preventDefault();

          // If we're in the middle of drawing a text box (tempPoint exists), cancel it first
          if (drawingStateRef.current.isDrawing() && drawingStateRef.current.getTempPoint()) {
            drawingPrimitive.removeLastDrawing();
            drawingStateRef.current.setTempPoint(null);
            drawingStateRef.current.setIsDrawing(false);
          }

          // Select the text box
          setSelectedTextBoxId(clickedTextBox.id);

          // Immediately start dragging
          const textBoxData = getTextBoxData(clickedTextBox);
          if (textBoxData) {
            setIsDraggingTextBox(true);
            setDragStart({
              x: touch.clientX - textBoxData.x,
              y: touch.clientY - textBoxData.y,
            });

            // Set flag to prevent handleChartClick from starting new text box
            justStartedTextBoxDragRef.current = true;
            setTimeout(() => {
              justStartedTextBoxDragRef.current = false;
            }, 50);
          }
          return; // Don't process as regular touch
        }
      }

      // Only proceed with drawing mode operations if in drawing mode
      if (!drawingStateRef.current.isDrawingMode()) return;

      // Prevent default to avoid scrolling while drawing
      e.preventDefault();

      const series = candlestickSeriesRef.current;
      if (!series) return;

      const price = series.coordinateToPrice(y);
      if (price === null) return;

      const time = chart.timeScale().coordinateToTime(x);

      // For trend lines, rulers, horizontal lines, and text boxes, use click handler
      if (activeToolType === 'trend-line' || activeToolType === 'horizontal-line' || activeToolType === 'ruler' || activeToolType === 'text-box') {
        handleChartClick({ point: { x, y }, time } as MouseEventParams);
      } else if (activeToolType === 'freehand') {
        // For freehand, start the drawing
        handleMouseDown({ point: { x, y }, time } as MouseEventParams);
      }
    };

    const handleNativeTouchMove = (e: TouchEvent) => {
      if (!drawingStateRef.current.isDrawingMode()) return;
      if (!drawingStateRef.current.isDrawing()) return;

      const chartContainer = chartContainerRef.current;
      if (!chartContainer) return;

      if (e.touches.length !== 1) return;

      // Prevent default to avoid scrolling while drawing
      e.preventDefault();

      const touch = e.touches[0];
      const rect = chartContainer.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const series = candlestickSeriesRef.current;
      if (!series) return;

      const price = series.coordinateToPrice(y);
      if (price === null) return;

      const time = chart.timeScale().coordinateToTime(x);

      // Update the drawing preview/continue freehand
      handleCrosshairMove({ point: { x, y }, time } as MouseEventParams);
    };

    const handleNativeTouchEnd = (e: TouchEvent) => {
      if (!drawingStateRef.current.isDrawingMode()) return;

      // Prevent default behavior
      e.preventDefault();

      const activeToolType = drawingStateRef.current.getActiveToolType();

      // For freehand drawing, finish it
      if (activeToolType === 'freehand' && drawingStateRef.current.isDrawing()) {
        handleMouseUp();
      }
      // For trend lines, the second tap will be handled by touchstart -> handleChartClick
    };

    // Store handlers in ref for proper cleanup
    mouseHandlersRef.current.mousedown = handleNativeMouseDown;
    mouseHandlersRef.current.mouseup = handleMouseUp;
    mouseHandlersRef.current.mouseleave = handleMouseUp;
    mouseHandlersRef.current.touchstart = handleNativeTouchStart;
    mouseHandlersRef.current.touchmove = handleNativeTouchMove;
    mouseHandlersRef.current.touchend = handleNativeTouchEnd;

    const chartContainer = chartContainerRef.current;
    if (chartContainer) {
      // Mouse events
      chartContainer.addEventListener('mousedown', handleNativeMouseDown);
      chartContainer.addEventListener('mouseup', handleMouseUp);
      chartContainer.addEventListener('mouseleave', handleMouseUp);

      // Touch events
      chartContainer.addEventListener('touchstart', handleNativeTouchStart, { passive: false });
      chartContainer.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
      chartContainer.addEventListener('touchend', handleNativeTouchEnd, { passive: false });
      chartContainer.addEventListener('touchcancel', handleNativeTouchEnd, { passive: false });
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

    // Add ResizeObserver to detect container size changes (e.g., sidebar toggle)
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    // Note: Chart position caching disabled to ensure rightOffset space is always visible
    // Users can manually zoom/pan, and the chart will start fresh each time with proper spacing

    // Debug listener: Log position whenever user manually adjusts the chart
    let debugLogHandler: (() => void) | null = null;
    if (isMobile) {
      debugLogHandler = () => {
        const position = chart.timeScale().scrollPosition();
        const visibleRange = chart.timeScale().getVisibleLogicalRange();
        const barsVisible = visibleRange ? (visibleRange.to - visibleRange.from).toFixed(1) : 'N/A';

        console.log('📍 [USER ADJUSTED] Current position:', {
          scrollPosition: position,
          visibleRange,
          barsVisible,
        });
      };

      chart.timeScale().subscribeVisibleLogicalRangeChange(debugLogHandler);
    }

    // Set initial chart position
    // fitContent() respects barSpacing and rightOffset to set initial zoom/position
    chart.timeScale().fitContent();

    // Log initial state for mobile debugging
    if (isMobile) {
      setTimeout(() => {
        const allData = poolsData.flatMap(pool => pool.data);
        const position = chart.timeScale().scrollPosition();
        const visibleRange = chart.timeScale().getVisibleLogicalRange();
        const barsVisible = visibleRange ? (visibleRange.to - visibleRange.from).toFixed(1) : 'N/A';

        console.log('📊 [INITIAL CHART STATE]');
        console.log(`  Total bars: ${allData.length}`);
        console.log(`  Current barSpacing: 5px`);
        console.log(`  rightOffset: 25 bars`);
        console.log(`  Visible bars: ${barsVisible}`);
        console.log(`  scrollPosition: ${position}`);
        console.log('');
        console.log('💡 Scroll your mouse wheel to zoom. Watch the barsVisible value.');
        console.log('   Your preference: ~79 bars. Adjust barSpacing (line 255) to fine-tune.');
        console.log('   Current barSpacing: 8px. Higher = fewer bars (more zoomed in).');
      }, 100);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();

      // Unsubscribe from chart events
      chart.unsubscribeClick(handleChartClick);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);

      // Unsubscribe debug listener if it exists
      if (debugLogHandler) {
        chart.timeScale().unsubscribeVisibleLogicalRangeChange(debugLogHandler);
      }

      // Remove mouse and touch event listeners from chart container using stored refs
      const chartContainer = chartContainerRef.current;
      if (chartContainer) {
        // Remove mouse event listeners
        if (mouseHandlersRef.current.mousedown) {
          chartContainer.removeEventListener('mousedown', mouseHandlersRef.current.mousedown);
        }
        if (mouseHandlersRef.current.mouseup) {
          chartContainer.removeEventListener('mouseup', mouseHandlersRef.current.mouseup);
        }
        if (mouseHandlersRef.current.mouseleave) {
          chartContainer.removeEventListener('mouseleave', mouseHandlersRef.current.mouseleave);
        }

        // Remove touch event listeners
        if (mouseHandlersRef.current.touchstart) {
          chartContainer.removeEventListener('touchstart', mouseHandlersRef.current.touchstart);
        }
        if (mouseHandlersRef.current.touchmove) {
          chartContainer.removeEventListener('touchmove', mouseHandlersRef.current.touchmove);
        }
        if (mouseHandlersRef.current.touchend) {
          chartContainer.removeEventListener('touchend', mouseHandlersRef.current.touchend);
          chartContainer.removeEventListener('touchcancel', mouseHandlersRef.current.touchend);
        }
      }

      // Clear handler refs
      mouseHandlersRef.current = { mousedown: null, mouseup: null, mouseleave: null, touchstart: null, touchmove: null, touchend: null };

      // Cleanup migration lines if they exist
      if (migrationLinesCleanupRef.current) {
        migrationLinesCleanupRef.current();
        migrationLinesCleanupRef.current = null;
      }

      chart.remove();
    };
  }, [poolsData, timeframe, displayMode, showVolume, resetTrigger, enabledIndicators, isLogScale, isAutoScale]);

  // Separate effect to handle migration lines toggle without recreating chart
  useEffect(() => {
    if (!chartRef.current || !chartContainerRef.current) return;

    // Small delay to ensure chart is fully initialized
    const timeoutId = setTimeout(() => {
      // Cleanup existing migration lines
      if (migrationLinesCleanupRef.current) {
        migrationLinesCleanupRef.current();
        migrationLinesCleanupRef.current = null;
      }

      // Add new migration lines if enabled
      if (showMigrationLines && chartRef.current && chartContainerRef.current && migrations.length > 0) {
        // Parse RGB from primaryColor to create darker variant
        const hex = primaryColor.replace('#', '');
        const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 20);
        const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 20);
        const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 20);
        const darkerColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

        const migrationLines = migrations.map(migration => ({
          time: migration.migrationTimestamp,
          color: darkerColor,
          label: migration.label,
          lineWidth: 2,
          labelBackgroundColor: '#000000',
          labelTextColor: primaryColor,
        }));

        const cleanup = drawVerticalLines(
          chartRef.current,
          chartContainerRef.current,
          migrationLines,
          primaryColor
        );
        migrationLinesCleanupRef.current = cleanup || null;
      }
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup on unmount
      if (migrationLinesCleanupRef.current) {
        migrationLinesCleanupRef.current();
        migrationLinesCleanupRef.current = null;
      }
    };
  }, [showMigrationLines, chartVersion]);

  // Separate effect to handle drawing mode changes without recreating chart
  useEffect(() => {
    if (!chartRef.current) return;

    // Hide crosshair when in text-box mode, eraser mode, editing, or hovering over text box
    const hideCrosshair = activeDrawingTool === 'text-box' || activeDrawingTool === 'eraser' || editingTextBoxId !== null || isHoveringTextBox;

    // Disable chart interactions when in drawing mode OR actively dragging/resizing text boxes
    const disableChartInteractions = isDrawingMode || isDraggingTextBox || isResizingTextBox;

    chartRef.current.applyOptions({
      crosshair: {
        vertLine: {
          visible: !hideCrosshair,
        },
        horzLine: {
          visible: !hideCrosshair,
        },
      },
      handleScroll: {
        mouseWheel: !disableChartInteractions,
        pressedMouseMove: !disableChartInteractions,
        horzTouchDrag: !disableChartInteractions,
        vertTouchDrag: !disableChartInteractions,
      },
      handleScale: {
        axisPressedMouseMove: {
          time: !disableChartInteractions,
          price: !disableChartInteractions,
        },
        mouseWheel: !disableChartInteractions,
        pinch: !disableChartInteractions,
        axisDoubleClickReset: {
          time: !disableChartInteractions,
          price: !disableChartInteractions,
        },
      },
      kineticScroll: {
        touch: false,
        mouse: false,
      },
    });
  }, [isDrawingMode, chartVersion, activeDrawingTool, editingTextBoxId, isHoveringTextBox, isDraggingTextBox, isResizingTextBox]);

  // Handle ESC key to cancel trend line drawing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle ESC key
      if (event.key !== 'Escape') return;

      const drawingState = drawingStateRef.current;
      const drawingPrimitive = drawingPrimitiveRef.current;

      // Check if we're currently drawing a trend line, ruler, text-box, or using eraser
      const activeToolType = drawingState.getActiveToolType();
      if (
        drawingState.isDrawing() &&
        (activeToolType === 'trend-line' || activeToolType === 'ruler' || activeToolType === 'text-box') &&
        drawingPrimitive
      ) {
        // Prevent default ESC behavior only when actually canceling a drawing
        event.preventDefault();
        event.stopPropagation();

        // Cancel the drawing
        drawingPrimitive.removeLastDrawing();
        drawingState.setTempPoint(null);
        drawingState.setIsDrawing(false);
        // Clear text box ID if canceling text box
        if (activeToolType === 'text-box') {
          delete (drawingState as any)._textBoxId;
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Convert drawing to TextBoxData for rendering
  const getTextBoxData = (textBox: any): TextBoxData | null => {
    if (!chartRef.current || !candlestickSeriesRef.current || !chartContainerRef.current) return null;

    const y = candlestickSeriesRef.current.priceToCoordinate(textBox.point.price);
    const x = chartRef.current.timeScale().logicalToCoordinate(textBox.point.logical as Logical);

    if (y === null || x === null) return null;

    return {
      id: textBox.id,
      x,
      y,
      width: textBox.width || 224,
      height: textBox.height || 100,
      text: textBox.text,
      fontSize: textBox.fontSize || 18,
      fontFamily: textBox.fontFamily || 'Inter, system-ui, -apple-system, sans-serif',
      fontWeight: textBox.fontWeight || '500',
      fontStyle: textBox.fontStyle || 'normal',
      textDecoration: textBox.textDecoration || 'none',
      color: textBox.color || primaryColor,
      backgroundColor: textBox.backgroundColor || primaryColor,
      backgroundOpacity: textBox.backgroundOpacity !== undefined ? textBox.backgroundOpacity : 0.95,
      backgroundEnabled: textBox.backgroundEnabled !== false,
      borderEnabled: textBox.borderEnabled || false,
      borderColor: textBox.borderColor || '#000000',
      borderWidth: textBox.borderWidth || 2,
      textAlign: textBox.textAlign || 'left',
      rotation: textBox.rotation || 0,
      padding: textBox.padding || 12,
      textWrap: textBox.textWrap !== false,
      baseBarSpacing: textBox.baseBarSpacing,
      logical: textBox.point.logical,
      price: textBox.point.price,
    };
  };

  // Handle text box interactions
  const handleTextBoxUpdate = (id: string, updates: Partial<TextBoxData>) => {
    const primitive = drawingPrimitiveRef.current;
    if (!primitive) return;

    // If updating position, convert screen coords to logical coords
    if (updates.x !== undefined && updates.y !== undefined && chartRef.current && candlestickSeriesRef.current) {
      const price = candlestickSeriesRef.current.coordinateToPrice(updates.y);
      const logical = chartRef.current.timeScale().coordinateToLogical(updates.x);

      if (price !== null && logical !== null) {
        primitive.updateTextBox(id, {
          point: { logical, price },
          ...updates,
        });
      }
    } else {
      primitive.updateTextBox(id, updates);
    }

    // Save to storage
    const updatedDrawings = primitive.getDrawings();
    SafeStorage.setJSON(`drawings_${timeframe}`, updatedDrawings);

    // Force re-render of text box editor for real-time drag updates
    setTextBoxUpdateCounter(prev => prev + 1);
  };

  // Handle text box delete (simplified - no other actions)
  const handleTextBoxDelete = () => {
    if (!selectedTextBoxId || !drawingPrimitiveRef.current) return;

    const primitive = drawingPrimitiveRef.current;
    primitive.removeDrawing(selectedTextBoxId);
    setSelectedTextBoxId(null);
    const updatedDrawings = primitive.getDrawings();
    SafeStorage.setJSON(`drawings_${timeframe}`, updatedDrawings);
    setDrawingCount(updatedDrawings.length);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedTextBoxId || editingTextBoxId) return;

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleTextBoxDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTextBoxId, editingTextBoxId, timeframe]);

  const handleTextBoxDragStart = (id: string, e: React.MouseEvent | React.TouchEvent, handle?: string) => {
    const textBox = drawingPrimitiveRef.current?.getTextBox(id);
    if (!textBox) return;

    const data = getTextBoxData(textBox);
    if (!data) return;

    // Get clientX and clientY from either mouse or touch event
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (handle === 'rotate') {
      // Rotation mode
      setResizeHandle('rotate');
      setDragStart({
        x: clientX,
        y: clientY,
        startX: data.x + data.width / 2,
        startY: data.y + data.height / 2,
        startRotation: data.rotation,
      });

      // Set flag to prevent new text box creation
      justStartedTextBoxDragRef.current = true;
      setTimeout(() => {
        justStartedTextBoxDragRef.current = false;
      }, 50);
    } else if (handle) {
      // Resize mode
      setIsResizingTextBox(true);
      setResizeHandle(handle);
      setDragStart({
        x: clientX,
        y: clientY,
        startX: data.x,
        startY: data.y,
        startWidth: data.width,
        startHeight: data.height,
      });

      // Set flag to prevent new text box creation
      justStartedTextBoxDragRef.current = true;
      setTimeout(() => {
        justStartedTextBoxDragRef.current = false;
      }, 50);
    } else {
      // Drag mode
      setIsDraggingTextBox(true);
      setDragStart({
        x: clientX - data.x,
        y: clientY - data.y,
      });

      // Set flag to prevent new text box creation
      justStartedTextBoxDragRef.current = true;
      setTimeout(() => {
        justStartedTextBoxDragRef.current = false;
      }, 50);
    }
  };

  // Global mouse/touch move/up handlers for text box interactions
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!selectedTextBoxId || !dragStart) return;

      const textBox = drawingPrimitiveRef.current?.getTextBox(selectedTextBoxId);
      if (!textBox) return;

      const data = getTextBoxData(textBox);
      if (!data) return;

      // Get clientX and clientY from either mouse or touch event
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (resizeHandle === 'rotate') {
        // Handle rotation - real-time update
        const centerX = dragStart.startX!;
        const centerY = dragStart.startY!;
        const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        const newRotation = angle + 90; // Offset by 90 degrees to start from top

        handleTextBoxUpdate(selectedTextBoxId, { rotation: newRotation });
      } else if (isResizingTextBox && resizeHandle) {
        // Handle resize - real-time update
        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;

        let newX = dragStart.startX!;
        let newY = dragStart.startY!;
        let newWidth = dragStart.startWidth!;
        let newHeight = dragStart.startHeight!;

        // Calculate new dimensions based on handle
        if (resizeHandle.includes('e')) {
          newWidth = Math.max(100, dragStart.startWidth! + deltaX);
        }
        if (resizeHandle.includes('w')) {
          newWidth = Math.max(100, dragStart.startWidth! - deltaX);
          newX = dragStart.startX! + deltaX;
        }
        if (resizeHandle.includes('s')) {
          newHeight = Math.max(60, dragStart.startHeight! + deltaY);
        }
        if (resizeHandle.includes('n')) {
          newHeight = Math.max(60, dragStart.startHeight! - deltaY);
          newY = dragStart.startY! + deltaY;
        }

        handleTextBoxUpdate(selectedTextBoxId, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
      } else if (isDraggingTextBox) {
        // Handle drag - real-time update with smooth movement
        const newX = clientX - dragStart.x;
        const newY = clientY - dragStart.y;

        handleTextBoxUpdate(selectedTextBoxId, { x: newX, y: newY });
      }
    };

    const handleEnd = () => {
      setIsDraggingTextBox(false);
      setIsResizingTextBox(false);
      setResizeHandle(null);
      setDragStart(null);
    };

    if (isDraggingTextBox || isResizingTextBox || resizeHandle) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);

      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDraggingTextBox, isResizingTextBox, resizeHandle, selectedTextBoxId, dragStart, timeframe]);

  // Handle clicks outside textboxes to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't deselect if currently editing, dragging, or resizing
      if (editingTextBoxId || isDraggingTextBox || isResizingTextBox) return;

      // Check if click is on any textbox element
      const target = e.target as HTMLElement;

      // Check if clicking on a textbox editor element
      if (target.closest('[data-textbox-editor]')) {
        return;
      }

      // Close all text box UI
      if (selectedTextBoxId) {
        setSelectedTextBoxId(null);
        setShowSizeControl(false);

        // Set flag to prevent starting new text box drawing immediately after deselecting
        justDeselectedTextBoxRef.current = true;
        setTimeout(() => {
          justDeselectedTextBoxRef.current = false;
        }, 100);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedTextBoxId, editingTextBoxId, isDraggingTextBox, isResizingTextBox]);

  // Update hidden textboxes in drawing primitive
  useEffect(() => {
    if (!drawingPrimitiveRef.current) return;

    // Hide any textbox that is selected, being dragged, or being resized
    // This ensures only the HTML overlay version is visible during interactions
    const hiddenIds = selectedTextBoxId ? [selectedTextBoxId] : [];
    drawingPrimitiveRef.current.setHiddenTextBoxIds(hiddenIds);
  }, [selectedTextBoxId, isDraggingTextBox, isResizingTextBox]);

  // Show size control when text box is selected (including when editing, but not when dragging)
  useEffect(() => {
    if (selectedTextBoxId && !isDraggingTextBox && !isResizingTextBox) {
      const timeoutId = setTimeout(() => {
        setShowSizeControl(true);
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      setShowSizeControl(false);
    }
  }, [selectedTextBoxId, editingTextBoxId, isDraggingTextBox, isResizingTextBox]);


  return (
    <div className="w-full h-full relative">
      <style jsx>{`
        :global(.tv-lightweight-charts) :global(canvas:nth-child(2)) {
          filter: drop-shadow(0 0 6px ${hexToRgba(primaryColor, 0.5)}) drop-shadow(0 0 3px ${hexToRgba(primaryColor, 0.3)});
        }
      `}</style>
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-textMuted">Loading chart...</div>
        </div>
      )}

      {/* Desktop: Top Left Buttons - Info, Indicators and Drawing Tools */}
      <div className="hidden lg:flex absolute top-6 left-6 md:top-8 md:left-8 z-10 gap-2">
        {/* About Info Button */}
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-all hover:bg-[var(--primary-color)]/5"
          style={buttonBaseStyle}
          aria-label="About this chart"
        >
          <svg className="w-5 h-5 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: primaryColor }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Indicators Button */}
        <div className="relative">
          <button
            onClick={() => {
              const newMenuState = !showIndicatorMenu;
              setShowIndicatorMenu(newMenuState);
              // Close drawing mode when opening indicators menu
              if (newMenuState) {
                setIsDrawingMode(false);
                drawingStateRef.current.setDrawingMode(false);
                setActiveDrawingTool(null);
                drawingStateRef.current.setActiveToolType(null);
              }
            }}
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-all hover:bg-[var(--primary-color)]/5"
            style={showIndicatorMenu || enabledIndicators.size > 0 ? buttonActiveStyle : buttonBaseStyle}
            aria-label="Technical indicators"
            title="Technical Indicators"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: primaryColor }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            {enabledIndicators.size > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor, color: secondaryColor }}>
                {enabledIndicators.size}
              </span>
            )}
          </button>

          {/* Indicators Dropdown */}
          <AnimatePresence>
            {showIndicatorMenu && (
              <motion.div
                className="absolute top-12 left-0 bg-black/95 backdrop-blur-sm border-2 rounded-lg p-3 min-w-[200px]"
                style={{ borderColor: `rgba(${rgbString}, 0.5)`, boxShadow: `0 0 20px rgba(${rgbString}, 0.3)` }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="text-xs font-bold" style={{ color: primaryColor }}>Moving Averages</div>
                  {enabledIndicators.size > 0 && (
                    <button
                      onClick={clearAllIndicators}
                      className="text-red-500 text-xs hover:text-red-400 transition-colors"
                      title="Clear All Indicators"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-1 mb-3">
                  {(['sma20', 'sma50', 'sma200', 'ema20', 'ema50', 'ema200'] as IndicatorType[]).map(ind => (
                    <button
                      key={ind}
                      onClick={() => toggleIndicator(ind)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded transition-colors border"
                      style={enabledIndicators.has(ind) ? {
                        backgroundColor: `rgba(${rgbString}, 0.2)`,
                        borderColor: primaryColor
                      } : {
                        borderColor: 'transparent'
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: INDICATORS[ind].color }}
                      />
                      <span className="text-white text-sm">{INDICATORS[ind].label}</span>
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold mb-2 px-1 pt-2 border-t" style={{ color: primaryColor, borderColor: `rgba(${rgbString}, 0.3)` }}>Indicators</div>
                <div className="space-y-1">
                  {(['rsi', 'bb'] as IndicatorType[]).map(ind => (
                    <button
                      key={ind}
                      onClick={() => toggleIndicator(ind)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded transition-colors border"
                      style={enabledIndicators.has(ind) ? {
                        backgroundColor: `rgba(${rgbString}, 0.2)`,
                        borderColor: primaryColor
                      } : {
                        borderColor: 'transparent'
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: INDICATORS[ind].color }}
                      />
                      <span className="text-white text-sm">{INDICATORS[ind].label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Drawing Tools Container */}
        <div className="relative flex items-center gap-2">
          {/* Toggle Drawing Mode Button */}
          <button
            onClick={toggleDrawingMode}
            className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-all hover:bg-[var(--primary-color)]/5"
            style={isDrawingMode ? buttonActiveStyle : buttonBaseStyle}
            aria-label="Toggle drawing mode"
            title="Toggle Drawing Mode"
          >
            <ChartNetwork className="w-5 h-5" strokeWidth={2} style={{ color: primaryColor }} />
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
                      ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                      : 'border-[var(--primary-color)]/50 hover:bg-[var(--primary-color)]/5 hover:border-[var(--primary-color)]'
                  }`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.05, ease: 'easeOut' }}
                  aria-label="Horizontal line tool"
                  title="Horizontal Line"
                >
                  <svg className="w-5 h-5 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" strokeDasharray="4 2" />
                  </svg>
                </motion.button>

                {/* Trend Line Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('trend-line')}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'trend-line'
                      ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                      : 'border-[var(--primary-color)]/50 hover:bg-[var(--primary-color)]/5 hover:border-[var(--primary-color)]'
                  }`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1, ease: 'easeOut' }}
                  aria-label="Trend line tool"
                  title="Trend Line"
                >
                  <svg className="w-5 h-5 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19l14-14" />
                  </svg>
                </motion.button>

                {/* Freehand Pencil Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('freehand')}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'freehand'
                      ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                      : 'border-[var(--primary-color)]/50 hover:bg-[var(--primary-color)]/5 hover:border-[var(--primary-color)]'
                  }`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.15, ease: 'easeOut' }}
                  aria-label="Freehand pencil tool"
                  title="Freehand Draw"
                >
                  <svg className="w-5 h-5 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </motion.button>

                {/* Ruler/Measure Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('ruler')}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'ruler'
                      ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                      : 'border-[var(--primary-color)]/50 hover:bg-[var(--primary-color)]/5 hover:border-[var(--primary-color)]'
                  }`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.2, ease: 'easeOut' }}
                  aria-label="Ruler measurement tool"
                  title="Ruler/Measure"
                >
                  <Ruler className="w-5 h-5 text-[var(--primary-color)]" strokeWidth={2} />
                </motion.button>

                {/* Text Box Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('text-box')}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'text-box'
                      ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                      : 'border-[var(--primary-color)]/50 hover:bg-[var(--primary-color)]/5 hover:border-[var(--primary-color)]'
                  }`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.225, ease: 'easeOut' }}
                  aria-label="Text box tool"
                  title="Anchored Text"
                >
                  <svg className="w-5 h-5 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </motion.button>

                {/* Eraser Tool */}
                <motion.button
                  onClick={drawingCount > 0 ? () => selectDrawingTool('eraser') : undefined}
                  disabled={drawingCount === 0}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    drawingCount === 0
                      ? 'border-red-500/20 opacity-30 cursor-not-allowed'
                      : activeDrawingTool === 'eraser'
                      ? 'bg-red-500/30 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      : 'border-red-500/50 hover:bg-red-500/5 hover:border-red-500'
                  }`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.25, ease: 'easeOut' }}
                  aria-label="Eraser tool"
                  title={drawingCount === 0 ? "No drawings to erase" : "Eraser (Click to Delete)"}
                >
                  <Eraser className={`w-5 h-5 ${drawingCount === 0 ? 'text-red-500/30' : 'text-red-500'}`} strokeWidth={2} />
                </motion.button>

                {/* Undo Last Drawing Button */}
                <motion.button
                  key="undo-button"
                  onClick={drawingCount > 0 ? undoLastDrawing : undefined}
                  disabled={drawingCount === 0}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-all ${
                    drawingCount === 0
                      ? 'border-yellow-500/20 opacity-30 cursor-not-allowed'
                      : 'border-yellow-500/50 hover:bg-white/90 hover:border-yellow-500 cursor-pointer'
                  }`}
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.275, ease: 'easeOut' }}
                  style={{ x: 0 }}
                  aria-label="Undo last drawing"
                  title={drawingCount === 0 ? "No drawings to undo" : "Undo Last Drawing"}
                >
                  <svg className={`w-5 h-5 ${drawingCount === 0 ? 'text-yellow-500/30' : 'text-yellow-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </motion.button>

                {/* Clear All Drawings Button */}
                <motion.button
                  key="clear-button"
                  onClick={drawingCount > 0 ? clearAllDrawings : undefined}
                  disabled={drawingCount === 0}
                  className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-all ${
                    drawingCount === 0
                      ? 'border-red-500/20 opacity-30 cursor-not-allowed'
                      : 'border-red-500/50 hover:bg-white/90 hover:border-red-500 cursor-pointer'
                  }`}
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.3, ease: 'easeOut' }}
                  style={{ x: 0 }}
                  aria-label="Clear all drawings"
                  title={drawingCount === 0 ? "No drawings to clear" : "Clear All Drawings"}
                >
                  <svg className={`w-5 h-5 ${drawingCount === 0 ? 'text-red-500/30' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile and Tablet: Indicators and Drawing Tools Buttons */}
      <div className="lg:hidden absolute top-4 left-4 z-30 max-h-[calc(100svh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto floating-icons-container">
        <div className="relative flex flex-col gap-2.5">
          {/* Indicators Button */}
          <div className="relative">
            <button
              onClick={() => {
                const newMenuState = !showIndicatorMenu;
                setShowIndicatorMenu(newMenuState);
                // Close drawing mode when opening indicators menu
                if (newMenuState) {
                  setIsDrawingMode(false);
                  drawingStateRef.current.setDrawingMode(false);
                  setActiveDrawingTool(null);
                  drawingStateRef.current.setActiveToolType(null);
                }
              }}
              className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-all ${
                showIndicatorMenu || enabledIndicators.size > 0
                  ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                  : 'border-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_16px_rgba(var(--primary-rgb),0.5)]'
              }`}
              aria-label="Technical indicators"
              title="Technical Indicators"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              {enabledIndicators.size > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[var(--primary-color)] text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center" style={{ color: secondaryColor }}>
                  {enabledIndicators.size}
                </span>
              )}
            </button>

            {/* Indicators Dropdown */}
            <AnimatePresence>
              {showIndicatorMenu && (
                <motion.div
                  className="fixed z-[100] bg-black/95 backdrop-blur-sm border-2 border-[var(--primary-color)]/50 rounded-lg p-3 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] left-16 sm:left-[4.5rem] top-4"
                  style={{
                    minWidth: '200px',
                    maxWidth: 'calc(100vw - 5.5rem)', // viewport width - left offset - padding
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="text-[var(--primary-color)] text-xs font-bold">Moving Averages</div>
                    {enabledIndicators.size > 0 && (
                      <button
                        onClick={clearAllIndicators}
                        className="text-red-500 text-xs hover:text-red-400 transition-colors"
                        title="Clear All Indicators"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-1 mb-3">
                    {(['sma20', 'sma50', 'sma200', 'ema20', 'ema50', 'ema200'] as IndicatorType[]).map(ind => (
                      <button
                        key={ind}
                        onClick={() => toggleIndicator(ind)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                          enabledIndicators.has(ind)
                            ? 'bg-[var(--primary-color)]/20 border border-[var(--primary-color)]'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: INDICATORS[ind].color }}
                        />
                        <span className="text-white text-sm">{INDICATORS[ind].label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="text-[var(--primary-color)] text-xs font-bold mb-2 px-1 pt-2 border-t border-[var(--primary-color)]/30">Indicators</div>
                  <div className="space-y-1">
                    {(['rsi', 'bb'] as IndicatorType[]).map(ind => (
                      <button
                        key={ind}
                        onClick={() => toggleIndicator(ind)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                          enabledIndicators.has(ind)
                            ? 'bg-[var(--primary-color)]/20 border border-[var(--primary-color)]'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: INDICATORS[ind].color }}
                        />
                        <span className="text-white text-sm">{INDICATORS[ind].label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Drawing Mode Button */}
          <button
            onClick={toggleDrawingMode}
            className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-all ${
              isDrawingMode
                ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                : 'border-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_16px_rgba(var(--primary-rgb),0.5)]'
            }`}
            aria-label="Toggle drawing mode"
            title="Toggle Drawing Mode"
          >
            <ChartNetwork className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-color)]" strokeWidth={2} />
          </button>

          {/* Drawing Tool Buttons - Slide down from toggle button */}
          <AnimatePresence>
            {isDrawingMode && (
              <motion.div
                className="flex flex-col gap-2.5 overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {/* Horizontal Line Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('horizontal-line')}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'horizontal-line'
                      ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                      : 'border-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]'
                  }`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.05, ease: 'easeOut' }}
                  aria-label="Horizontal line tool"
                  title="Horizontal Line"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" strokeDasharray="4 2" />
                  </svg>
                </motion.button>

                {/* Trend Line Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('trend-line')}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'trend-line'
                      ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                      : 'border-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]'
                  }`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1, ease: 'easeOut' }}
                  aria-label="Trend line tool"
                  title="Trend Line"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19l14-14" />
                  </svg>
                </motion.button>

                {/* Freehand Pencil Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('freehand')}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'freehand'
                      ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                      : 'border-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]'
                  }`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.15, ease: 'easeOut' }}
                  aria-label="Freehand pencil tool"
                  title="Freehand Draw"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </motion.button>

                {/* Ruler/Measure Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('ruler')}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'ruler'
                      ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                      : 'border-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]'
                  }`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.2, ease: 'easeOut' }}
                  aria-label="Ruler measurement tool"
                  title="Ruler/Measure"
                >
                  <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-color)]" strokeWidth={2} />
                </motion.button>

                {/* Text Box Tool */}
                <motion.button
                  onClick={() => selectDrawingTool('text-box')}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    activeDrawingTool === 'text-box'
                      ? 'bg-[var(--primary-color)]/30 border-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                      : 'border-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]'
                  }`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.225, ease: 'easeOut' }}
                  aria-label="Anchored text tool"
                  title="Anchored Text"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </motion.button>

                {/* Eraser Tool */}
                <motion.button
                  onClick={drawingCount > 0 ? () => selectDrawingTool('eraser') : undefined}
                  disabled={drawingCount === 0}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-colors ${
                    drawingCount === 0
                      ? 'border-red-500/20 opacity-30 cursor-not-allowed shadow-none'
                      : activeDrawingTool === 'eraser'
                      ? 'bg-red-500/30 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      : 'border-red-500/50 hover:bg-red-500/5 hover:border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                  }`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.25, ease: 'easeOut' }}
                  aria-label="Eraser tool"
                  title={drawingCount === 0 ? "No drawings to erase" : "Eraser (Click to Delete)"}
                >
                  <Eraser className={`w-5 h-5 sm:w-6 sm:h-6 ${drawingCount === 0 ? 'text-red-500/30' : 'text-red-500'}`} strokeWidth={2} />
                </motion.button>

                {/* Undo Last Drawing Button */}
                <motion.button
                  key="undo-button-mobile"
                  onClick={drawingCount > 0 ? undoLastDrawing : undefined}
                  disabled={drawingCount === 0}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-all ${
                    drawingCount === 0
                      ? 'border-yellow-500/20 opacity-30 cursor-not-allowed shadow-none'
                      : 'border-yellow-500 hover:bg-white/90 cursor-pointer shadow-[0_0_12px_rgba(234,179,8,0.3)]'
                  }`}
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.275, ease: 'easeOut' }}
                  style={{ y: 0 }}
                  aria-label="Undo last drawing"
                  title={drawingCount === 0 ? "No drawings to undo" : "Undo Last Drawing"}
                >
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${drawingCount === 0 ? 'text-yellow-500/30' : 'text-yellow-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </motion.button>

                {/* Clear All Drawings Button */}
                <motion.button
                  key="clear-button-mobile"
                  onClick={drawingCount > 0 ? clearAllDrawings : undefined}
                  disabled={drawingCount === 0}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center backdrop-blur-sm border-2 rounded-full transition-all ${
                    drawingCount === 0
                      ? 'border-red-500/20 opacity-30 cursor-not-allowed shadow-none'
                      : 'border-red-500 hover:bg-white/90 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                  }`}
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.3, ease: 'easeOut' }}
                  style={{ y: 0 }}
                  aria-label="Clear all drawings"
                  title={drawingCount === 0 ? "No drawings to clear" : "Clear All Drawings"}
                >
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${drawingCount === 0 ? 'text-red-500/30' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-[95%] max-w-6xl ${isAboutClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className="bg-gradient-to-b from-black to-black border-[3px] border-[var(--primary-color)]/60 shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)] overflow-hidden">
              {/* Header */}
              <div
                style={{ padding: '20px 28px' }}
                className="sticky top-0 z-10 bg-gradient-to-r from-black via-[var(--primary-darker)]/20 to-black border-b-[3px] border-[var(--primary-color)]/50"
              >
                <div className="flex items-center justify-between">
                  <h2 style={{ margin: 0 }} className="text-[var(--primary-color)] text-xl md:text-2xl font-bold tracking-wide">About This Chart</h2>
                  <button
                    onClick={closeAboutModal}
                    className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 rounded-full transition-all"
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
                  padding: '24px 28px',
                  WebkitOverflowScrolling: 'touch' // Enable smooth scrolling on Safari
                }}
                className="max-h-[80vh] overflow-y-auto"
              >
                {/* Overview */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ lineHeight: '1.6', margin: 0 }} className="text-white/90 text-sm">
                    Interactive candlestick chart displaying complete price history across all pool migrations (M0N3Y → ZERA Raydium → ZERA Meteora) with real-time data, technical indicators, and professional drawing tools.
                  </p>
                </div>

                {/* Divider */}
                <div style={{ margin: '20px 0' }} className="border-t-2 border-[var(--primary-color)]/30"></div>

                {/* Two Column Layout on Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Navigation */}
                    <div>
                      <h3 style={{ marginBottom: '12px' }} className="text-[var(--primary-color)] text-sm font-bold tracking-wider uppercase">Navigation</h3>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Zoom:</strong> Mouse wheel or pinch</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Pan:</strong> Drag or swipe</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Timeframes:</strong> 1H, 4H, 8H, 1D, MAX</span>
                        </div>
                      </div>
                    </div>

                    {/* Drawing Tools */}
                    <div>
                      <h3 style={{ marginBottom: '12px' }} className="text-[var(--primary-color)] text-sm font-bold tracking-wider uppercase">Drawing Tools</h3>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" strokeDasharray="4 2" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Horizontal Line:</strong> Support/resistance</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19l14-14" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Trend Line:</strong> Two points (ESC to cancel)</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Freehand:</strong> Custom annotations</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Ruler:</strong> Measure distances</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Anchored Text:</strong> Drag area, type text, drag to move (Del to delete)</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-red-500/30 rounded-lg hover:border-red-500/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Eraser:</strong> Click any drawing to delete it</span>
                        </div>
                      </div>
                    </div>

                    {/* Technical Indicators */}
                    <div>
                      <h3 style={{ marginBottom: '12px' }} className="text-[var(--primary-color)] text-sm font-bold tracking-wider uppercase">Technical Indicators</h3>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Moving Averages:</strong> SMA/EMA (20, 50, 200)</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>RSI:</strong> Relative Strength Index (14)</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Bollinger Bands:</strong> Volatility (20, 2σ)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Display Options */}
                    <div>
                      <h3 style={{ marginBottom: '12px' }} className="text-[var(--primary-color)] text-sm font-bold tracking-wider uppercase">Display Options</h3>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Y-Axis:</strong> Price (SOL) or Market Cap</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Log Scale:</strong> Logarithmic axis</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Auto Scale:</strong> Fit to visible range</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Migration Events:</strong> Pool migration markers</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span style={{ lineHeight: '1.4', margin: 0 }} className="text-white text-xs"><strong>Volume Bars:</strong> Trading volume histogram</span>
                        </div>
                      </div>
                    </div>

                    {/* Data Sources */}
                    <div style={{ padding: '14px 16px' }} className="text-center bg-black/60 border-2 border-[var(--primary-color)]/40 rounded-lg">
                      <p style={{ margin: 0 }} className="text-white/60 text-xs">
                        <span className="text-[var(--primary-color)] font-bold">Data Sources:</span> Jupiter API, DexScreener, GeckoTerminal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TextBox Editor - Only render HTML overlay for selected text box */}
      {selectedTextBoxId && (() => {
        const drawing = drawingPrimitiveRef.current?.getDrawings()
          .find((d: any) => d.type === 'text-box' && d.id === selectedTextBoxId);

        if (!drawing) return null;
        const textBoxData = getTextBoxData(drawing);
        if (!textBoxData) return null;

        return (
          <TextBoxEditor
            key={drawing.id}
            textBox={textBoxData}
            isSelected={true}
            isEditing={editingTextBoxId === drawing.id}
            onUpdate={(updates) => handleTextBoxUpdate(drawing.id, updates)}
            onStartDrag={(e, handle) => {
              e.stopPropagation();
              setIsHoveringTextBox(false);
              setShowSizeControl(false);
              handleTextBoxDragStart(drawing.id, e, handle);
            }}
            onDoubleClick={() => {
              setEditingTextBoxId(drawing.id);
              setIsHoveringTextBox(false);
              setShowSizeControl(false);

              // Set flag to prevent new text box creation
              justStartedTextBoxDragRef.current = true;
              setTimeout(() => {
                justStartedTextBoxDragRef.current = false;
              }, 50);
            }}
            onBlur={() => {
              setEditingTextBoxId(null);

              // Set flag to prevent starting new text box when clicking away from edit
              justDeselectedTextBoxRef.current = true;
              setTimeout(() => {
                justDeselectedTextBoxRef.current = false;
              }, 100);
            }}
            onHoverChange={setIsHoveringTextBox}
            primaryColor={primaryColor}
          />
        );
      })()}

      {/* Font Size Control - shown when text box is selected (including during editing) */}
      <AnimatePresence>
        {selectedTextBoxId && showSizeControl && (() => {
          const textBox = drawingPrimitiveRef.current?.getTextBox(selectedTextBoxId);
          if (!textBox) return null;
          const textBoxData = getTextBoxData(textBox);
          if (!textBoxData) return null;

          return (
            <TextBoxSizeControl
              key={`size-${selectedTextBoxId}`}
              fontSize={textBox.fontSize || 18}
              position={{
                x: textBoxData.x + textBoxData.width / 2 - 60,
                y: textBoxData.y - 40,
              }}
              onUpdate={(newSize) => handleTextBoxUpdate(selectedTextBoxId, { fontSize: newSize })}
              primaryColor={primaryColor}
            />
          );
        })()}
      </AnimatePresence>

      <div
        ref={chartContainerRef}
        className="w-full h-full"
        style={{
          touchAction: 'manipulation',
          cursor: isHoveringTextBox && !editingTextBoxId && activeDrawingTool !== 'eraser'
            ? 'move'
            : isDrawingMode && activeDrawingTool === 'eraser'
            ? 'not-allowed'
            : isDrawingMode && activeDrawingTool !== 'text-box' && !editingTextBoxId
            ? 'crosshair'
            : 'default',
          transition: 'cursor 0.1s ease',
        }}
      />
    </div>
  );
}
