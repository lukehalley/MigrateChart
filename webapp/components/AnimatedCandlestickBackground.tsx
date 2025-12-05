'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Candle {
  x: number;
  open: number;
  high: number;
  low: number;
  close: number;
  isGreen: boolean;
  fillFromBottom: boolean; // Randomize fill direction
}

function generateBullishCandles(count: number): Candle[] {
  const candles: Candle[] = [];
  let basePrice = 100;

  // Spread across full viewport with margins
  const margin = 30;
  const usableWidth = 1000 - (margin * 2);
  const candleWidth = usableWidth / count;

  for (let i = 0; i < count; i++) {
    // Add volatility but bias upward (70% chance of green candle)
    const isGreen = Math.random() > 0.3;
    const volatility = Math.random() * 80 + 60; // 60-140 points range (MUCH larger bodies)

    const open = basePrice;
    const close = isGreen
      ? open + Math.random() * volatility
      : open - Math.random() * (volatility * 0.7); // Red candles still decent size

    const high = Math.max(open, close) + Math.random() * 25; // Longer wicks
    const low = Math.min(open, close) - Math.random() * 25;

    candles.push({
      x: margin + i * candleWidth + candleWidth / 2,
      open,
      high,
      low,
      close,
      isGreen: close > open,
      fillFromBottom: Math.random() > 0.5,
    });

    // Drift price upward for next candle (bullish bias)
    basePrice = close + (isGreen ? Math.random() * 5 : -Math.random() * 2);
  }

  return candles;
}

function normalizeCandlesToViewport(candles: Candle[], viewportHeight: number) {
  // Find price range
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;

  // Map to viewport - use more vertical space (bottom 5% to top 15%)
  const viewportTop = viewportHeight * 0.15;
  const viewportBottom = viewportHeight * 0.95;
  const viewportRange = viewportBottom - viewportTop;

  return candles.map(candle => ({
    ...candle,
    open: viewportBottom - ((candle.open - minPrice) / priceRange) * viewportRange,
    high: viewportBottom - ((candle.high - minPrice) / priceRange) * viewportRange,
    low: viewportBottom - ((candle.low - minPrice) / priceRange) * viewportRange,
    close: viewportBottom - ((candle.close - minPrice) / priceRange) * viewportRange,
  }));
}

export function AnimatedCandlestickBackground() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [key, setKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only generate on client-side to avoid hydration mismatch
    setMounted(true);

    // Generate initial candles
    const rawCandles = generateBullishCandles(30);
    const normalized = normalizeCandlesToViewport(rawCandles, 600);
    setCandles(normalized);

    // Regenerate after animation completes (30 candles * 1s = 30s + 2s pause)
    const interval = setInterval(() => {
      const newCandles = generateBullishCandles(30);
      const newNormalized = normalizeCandlesToViewport(newCandles, 600);
      setCandles(newNormalized);
      setKey(prev => prev + 1);
    }, 32000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null; // Don't render on server
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
      viewBox="0 0 1000 600"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Glow filters */}
        <filter id="greenGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="redGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <AnimatePresence mode="wait">
        <g key={key}>
          {candles.map((candle, i) => {
            const bodyTop = Math.min(candle.open, candle.close);
            const bodyBottom = Math.max(candle.open, candle.close);
            const bodyHeight = Math.abs(candle.close - candle.open);
            const color = candle.isGreen ? '#52C97D' : '#ef4444';
            const glowFilter = candle.isGreen ? 'url(#greenGlow)' : 'url(#redGlow)';

            return (
              <g key={i}>
                {/* Wick - full range from LOW to HIGH */}
                <motion.line
                  x1={candle.x}
                  x2={candle.x}
                  y1={candle.open}
                  y2={candle.open}
                  stroke={color}
                  strokeWidth="2"
                  strokeOpacity="0.7"
                  strokeLinecap="round"
                  animate={{
                    y1: candle.low,
                    y2: candle.high,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: i * 1.0,
                    ease: 'linear',
                  }}
                />

                {/* Body - fills between OPEN and CLOSE prices */}
                {/* For green: fills from bodyBottom (open) upward to bodyTop (close) */}
                {/* For red: fills from bodyTop (open) downward to bodyBottom (close) */}
                <motion.rect
                  key={`body-${key}-${i}`}
                  x={candle.x - 12}
                  width="24"
                  fill={color}
                  fillOpacity="0.95"
                  filter={glowFilter}
                  rx="2"
                  // Start at the OPEN edge of the body (bottom for green, top for red)
                  y={candle.isGreen ? bodyBottom : bodyTop}
                  height={0}
                  animate={{
                    // Always animate to bodyTop position
                    y: bodyTop,
                    height: bodyHeight,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: i * 1.0 + 0.4,
                    ease: 'linear',
                  }}
                />
              </g>
            );
          })}
        </g>
      </AnimatePresence>
    </svg>
  );
}
