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
  const candleWidth = 1000 / count;

  for (let i = 0; i < count; i++) {
    // Add volatility but bias upward (70% chance of green candle)
    const isGreen = Math.random() > 0.3;
    const volatility = Math.random() * 20 + 5; // 5-25 points range

    const open = basePrice;
    const close = isGreen
      ? open + Math.random() * volatility
      : open - Math.random() * (volatility * 0.6); // Red candles smaller

    const high = Math.max(open, close) + Math.random() * 8;
    const low = Math.min(open, close) - Math.random() * 8;

    candles.push({
      x: i * candleWidth + candleWidth / 2,
      open,
      high,
      low,
      close,
      isGreen: close > open,
      fillFromBottom: Math.random() > 0.5, // 50% chance each direction
    });

    // Drift price upward for next candle (bullish bias)
    basePrice = close + (isGreen ? Math.random() * 3 : -Math.random() * 1.5);
  }

  return candles;
}

function normalizeCandlesToViewport(candles: Candle[], viewportHeight: number) {
  // Find price range
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;

  // Map to viewport (bottom 10% to top 30%)
  const viewportTop = viewportHeight * 0.3;
  const viewportBottom = viewportHeight * 0.9;
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
            const wickLength = candle.high - candle.low;

            // Determine clip reveal direction
            const clipStartY = candle.fillFromBottom ? bodyBottom : bodyTop;
            const clipHeight = Math.max(bodyHeight, 3);

            return (
              <g key={i}>
                {/* Wick - draws the full range line from low to high */}
                <motion.line
                  x1={candle.x}
                  x2={candle.x}
                  y1={candle.low}
                  y2={candle.low}
                  stroke={color}
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                  strokeLinecap="round"
                  animate={{ y2: candle.high }}
                  transition={{
                    duration: 0.3,
                    delay: i * 1.0, // 1 SECOND delay between each candle
                    ease: 'linear',
                  }}
                />

                {/* Candle body - fills from OPEN to CLOSE always */}
                <motion.rect
                  key={`body-${key}-${i}`}
                  x={candle.x - 8}
                  width="16"
                  fill={color}
                  fillOpacity="0.95"
                  filter={glowFilter}
                  rx="1"
                  // Always start at open price, fill to close price
                  animate={{
                    y: [candle.open, bodyTop],
                    height: [0, clipHeight],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: i * 1.0 + 0.15,
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
