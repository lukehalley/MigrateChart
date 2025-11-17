'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  HistogramData,
  LineData,
  Time,
  ColorType,
} from 'lightweight-charts';
import { DailyFees } from '@/app/api/fees/[slug]/route';
import { polyfillCanvasRoundRect } from '@/lib/canvasPolyfills';

interface FeesChartProps {
  dailyFees: DailyFees[];
  primaryColor: string;
}

export default function FeesChart({ dailyFees, primaryColor }: FeesChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to get RGB values from hex color
  const getRgbFromHex = (hex: string) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return { r, g, b };
  };

  useEffect(() => {
    // Apply canvas polyfill
    polyfillCanvasRoundRect();

    if (!chartContainerRef.current) return;

    // Clear any existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const rgb = getRgbFromHex(primaryColor);

    // Create chart with Grafana-style dark theme
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: 'rgba(255, 255, 255, 0.9)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: {
          color: 'rgba(255, 255, 255, 0.06)',
          style: 1,
          visible: true,
        },
        horzLines: {
          color: 'rgba(255, 255, 255, 0.06)',
          style: 1,
          visible: true,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textColor: 'rgba(255, 255, 255, 0.7)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.15,
        },
        autoScale: true,
      },
      leftPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textColor: 'rgba(255, 255, 255, 0.7)',
        visible: true,
        scaleMargins: {
          top: 0.15,
          bottom: 0.1,
        },
        autoScale: true,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
        borderVisible: true,
      },
      crosshair: {
        vertLine: {
          color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
          width: 1,
          style: 2,
          labelBackgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`,
        },
        horzLine: {
          color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
          width: 1,
          style: 2,
          labelBackgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`,
        },
        mode: 1,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Prepare histogram data for daily fees (bars) - Grafana-style
    const histogramData: HistogramData[] = dailyFees.map((day) => ({
      time: day.timestamp as Time,
      value: day.fees,
      color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`,
    }));

    // Add histogram series with Grafana-style bars
    const histogramSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => {
          if (price >= 1_000_000) {
            return `$${(price / 1_000_000).toFixed(2)}M`;
          } else if (price >= 1_000) {
            return `$${(price / 1_000).toFixed(2)}K`;
          }
          return `$${price.toFixed(2)}`;
        },
      },
      priceScaleId: 'right',
      base: 0,
    });

    histogramSeries.setData(histogramData);

    // Calculate cumulative fees for line chart
    let cumulative = 0;
    const cumulativeData: LineData[] = dailyFees.map((day) => {
      cumulative += day.fees;
      return {
        time: day.timestamp as Time,
        value: cumulative,
      };
    });

    // Add line series for cumulative fees - Grafana-style with brighter line
    const lineSeries = chart.addLineSeries({
      color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
      lineWidth: 3,
      lineStyle: 0,
      lineType: 2, // Simple line
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
      crosshairMarkerBackgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => {
          if (price >= 1_000_000) {
            return `$${(price / 1_000_000).toFixed(2)}M`;
          } else if (price >= 1_000) {
            return `$${(price / 1_000).toFixed(2)}K`;
          }
          return `$${price.toFixed(2)}`;
        },
      },
      priceScaleId: 'left',
      lastValueVisible: true,
      priceLineVisible: false,
    });

    lineSeries.setData(cumulativeData);

    // Configure price scales with better margins
    chart.priceScale('right').applyOptions({
      scaleMargins: {
        top: 0.05,
        bottom: 0.55,
      },
      borderVisible: true,
    });

    chart.priceScale('left').applyOptions({
      scaleMargins: {
        top: 0.55,
        bottom: 0.05,
      },
      borderVisible: true,
    });

    // Fit content
    chart.timeScale().fitContent();

    setIsLoading(false);

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

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [dailyFees, primaryColor]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <div className="text-white/70">Loading chart...</div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
