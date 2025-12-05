'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface CandleData {
  id: number;
  x: number;
  // Raw prices (before normalization)
  rawOpen: number;
  rawHigh: number;
  rawLow: number;
  rawClose: number;
  // Normalized to SVG coordinates
  open: number;
  high: number;
  low: number;
  close: number;
  isGreen: boolean;
}

const CANDLE_COUNT = 30;
const CYCLE_DURATION = 32000; // 32 seconds total cycle
const CANDLE_DELAY = 1000; // 1 second between each candle starting
const WICK_DURATION = 0.4;
const BODY_DURATION = 0.6;
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 600;
const MARGIN = 30;
const VIEWPORT_TOP_PERCENT = 0.15;
const VIEWPORT_BOTTOM_PERCENT = 0.95;

// Generate random candle data with bullish bias
function generateCandleData(): Omit<CandleData, 'x' | 'open' | 'high' | 'low' | 'close' | 'id'>[] {
  const candles: Omit<CandleData, 'x' | 'open' | 'high' | 'low' | 'close' | 'id'>[] = [];
  let currentPrice = 100;

  for (let i = 0; i < CANDLE_COUNT; i++) {
    // 70% green, 30% red (bullish bias)
    const isGreen = Math.random() > 0.3;

    // Large bodies: 60-140 point range
    const bodySize = Math.random() * 80 + 60;

    const rawOpen = currentPrice;
    const rawClose = isGreen
      ? rawOpen + bodySize
      : rawOpen - bodySize * 0.8; // Red candles slightly smaller

    // Long wicks: 20-25 points beyond body
    const wickExtensionHigh = Math.random() * 5 + 20;
    const wickExtensionLow = Math.random() * 5 + 20;

    const rawHigh = Math.max(rawOpen, rawClose) + wickExtensionHigh;
    const rawLow = Math.min(rawOpen, rawClose) - wickExtensionLow;

    candles.push({
      rawOpen,
      rawHigh,
      rawLow,
      rawClose,
      isGreen: rawClose > rawOpen,
    });

    // Drift price for next candle (bullish bias)
    currentPrice = rawClose + (isGreen ? Math.random() * 10 : -Math.random() * 5);
  }

  return candles;
}

// Normalize prices to SVG coordinate space
function normalizeCandles(rawCandles: Omit<CandleData, 'x' | 'open' | 'high' | 'low' | 'close' | 'id'>[]): CandleData[] {
  // Find price range across all candles
  const allPrices = rawCandles.flatMap(c => [c.rawHigh, c.rawLow]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  // SVG viewport boundaries
  const viewportTop = SVG_HEIGHT * VIEWPORT_TOP_PERCENT;
  const viewportBottom = SVG_HEIGHT * VIEWPORT_BOTTOM_PERCENT;
  const viewportRange = viewportBottom - viewportTop;

  // Calculate x spacing
  const usableWidth = SVG_WIDTH - MARGIN * 2;
  const candleSpacing = usableWidth / CANDLE_COUNT;

  return rawCandles.map((candle, i) => {
    // Price to Y coordinate (inverted - higher price = lower Y)
    const priceToY = (price: number) =>
      viewportBottom - ((price - minPrice) / priceRange) * viewportRange;

    return {
      id: i,
      x: MARGIN + i * candleSpacing + candleSpacing / 2,
      rawOpen: candle.rawOpen,
      rawHigh: candle.rawHigh,
      rawLow: candle.rawLow,
      rawClose: candle.rawClose,
      open: priceToY(candle.rawOpen),
      high: priceToY(candle.rawHigh),
      low: priceToY(candle.rawLow),
      close: priceToY(candle.rawClose),
      isGreen: candle.isGreen,
    };
  });
}

interface CandlestickProps {
  candle: CandleData;
  index: number;
}

function Candlestick({ candle, index }: CandlestickProps) {
  const color = candle.isGreen ? '#52C97D' : '#ef4444';
  const glowFilter = candle.isGreen ? 'url(#greenGlow)' : 'url(#redGlow)';

  // Calculate body coordinates
  const bodyTop = Math.min(candle.open, candle.close);
  const bodyBottom = Math.max(candle.open, candle.close);
  const bodyHeight = Math.abs(candle.close - candle.open);

  // Animation delay for this candle
  const delay = index * (CANDLE_DELAY / 1000);

  return (
    <g>
      {/* Wick - draws from open price, expands to full HIGH-LOW range */}
      <motion.line
        x1={candle.x}
        x2={candle.x}
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.7}
        strokeLinecap="round"
        // Start at open price (single point)
        initial={{
          y1: candle.open,
          y2: candle.open,
        }}
        // Expand to full high-low range
        animate={{
          y1: candle.high,
          y2: candle.low,
        }}
        transition={{
          duration: WICK_DURATION,
          delay: delay,
          ease: 'linear',
        }}
      />

      {/* Body - fills from OPEN toward CLOSE */}
      {/* Green candle: body starts at OPEN (bottom), fills upward to CLOSE (top) */}
      {/* Red candle: body starts at OPEN (top), fills downward to CLOSE (bottom) */}
      <motion.rect
        x={candle.x - 12}
        width={24}
        fill={color}
        fillOpacity={0.95}
        filter={glowFilter}
        rx={2}
        // Start position: at OPEN price with 0 height
        initial={{
          y: candle.open,
          height: 0,
        }}
        // End position: fill toward CLOSE
        animate={{
          y: bodyTop,
          height: bodyHeight,
        }}
        transition={{
          duration: BODY_DURATION,
          delay: delay + WICK_DURATION,
          ease: 'linear',
        }}
      />
    </g>
  );
}

export function AnimatedCandlestickBackground() {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [cycleKey, setCycleKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  const generateNewCycle = useCallback(() => {
    const rawCandles = generateCandleData();
    const normalized = normalizeCandles(rawCandles);
    setCandles(normalized);
    setCycleKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Only run on client to avoid hydration mismatch
    setMounted(true);
    generateNewCycle();

    // Regenerate every 32 seconds
    const interval = setInterval(generateNewCycle, CYCLE_DURATION);
    return () => clearInterval(interval);
  }, [generateNewCycle]);

  // Don't render on server
  if (!mounted) {
    return null;
  }

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.25,
      }}
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Green glow filter */}
        <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Red glow filter */}
        <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Key forces re-render of all candles when cycle restarts */}
      <g key={cycleKey}>
        {candles.map((candle, index) => (
          <Candlestick
            key={`${cycleKey}-${candle.id}`}
            candle={candle}
            index={index}
          />
        ))}
      </g>
    </svg>
  );
}
