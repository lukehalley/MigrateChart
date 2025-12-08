'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Candlestick Animation - Authentic Formation Lifecycle
 *
 * Animation sequence per candle:
 * 1. Body appears at full range (HIGH to LOW)
 * 2. Body shrinks directionally based on candle type:
 *    - GREEN: Shrinks from TOP first (reveals upper wick), then bottom settles
 *    - RED: Shrinks from BOTTOM first (reveals lower wick), then top settles
 * 3. Wick is revealed as body shrinks (wick is behind body)
 *
 * This reflects authentic price action:
 * - Green candles: price went UP to high, then settled back to close
 * - Red candles: price went DOWN to low, then settled back to close
 */

interface CandleData {
  id: number;
  x: number;
  rawOpen: number;
  rawHigh: number;
  rawLow: number;
  rawClose: number;
  // Normalized to SVG coordinates (Y-axis inverted: lower Y = higher price)
  open: number;
  high: number; // Top of wick (lower Y value)
  low: number;  // Bottom of wick (higher Y value)
  close: number;
  isGreen: boolean;
}

const CANDLE_COUNT = 30;
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 600;
const MARGIN = 30;
const VIEWPORT_TOP_PERCENT = 0.15;
const VIEWPORT_BOTTOM_PERCENT = 0.95;

// Animation timing (seconds) - smooth and fluid
const CANDLE_DELAY = 0.15; // Faster stagger for wave effect
const APPEAR_DURATION = 0.3; // Smoother fade in
const SETTLE_DURATION = 0.6; // Smoother settle
const EXIT_DURATION = 0.8; // Smooth fade out

// Cycle timing
// Last candle starts at (29 * 0.15) = 4.35s, finishes at 4.35 + 0.3 + 0.6 = 5.25s
// Hold for 2s, then exit animation takes 0.8s
const ANIMATION_COMPLETE = 5250; // When animation finishes
const HOLD_DURATION = 2000; // Pause before exit (2 seconds)
const CYCLE_DURATION = ANIMATION_COMPLETE + HOLD_DURATION + (EXIT_DURATION * 1000) + 300; // ~8.35s total

function generateCandleData(): Omit<CandleData, 'x' | 'open' | 'high' | 'low' | 'close' | 'id'>[] {
  const candles: Omit<CandleData, 'x' | 'open' | 'high' | 'low' | 'close' | 'id'>[] = [];

  // Randomize starting price - don't always start low
  let currentPrice = 80 + Math.random() * 140; // Range: 80-220

  let consecutiveSameColor = 0;
  let lastWasGreen: boolean | null = null;

  for (let i = 0; i < CANDLE_COUNT; i++) {
    // Force last 3 candles to be green to ensure we end high
    const forceGreen = i >= CANDLE_COUNT - 3;

    // Determine if this candle is green
    let isGreen: boolean;

    if (forceGreen) {
      isGreen = true;
    } else {
      // Base probability ~50/50 with slight green bias
      let greenProbability = 0.52;

      // Prevent long runs of same color (max 2 in a row before forcing change)
      if (consecutiveSameColor >= 2) {
        // Force opposite color
        isGreen = !lastWasGreen;
      } else if (consecutiveSameColor === 1) {
        // After 1 same color, reduce probability of another
        greenProbability = lastWasGreen ? 0.35 : 0.65;
        isGreen = Math.random() < greenProbability;
      } else {
        isGreen = Math.random() < greenProbability;
      }
    }

    // Track consecutive same-colored candles
    if (lastWasGreen === isGreen) {
      consecutiveSameColor++;
    } else {
      consecutiveSameColor = 1;
    }
    lastWasGreen = isGreen;

    // Vary body size more for volatility
    const bodySize = Math.random() * 60 + 40; // Slightly smaller, more varied

    const rawOpen = currentPrice;
    const rawClose = isGreen
      ? rawOpen + bodySize
      : rawOpen - bodySize * 0.9; // Red candles drop almost as much as green rises

    // Wick variation: sometimes no upper wick, sometimes no lower wick, sometimes both
    // ~30% chance no upper wick, ~30% chance no lower wick, ~40% chance both wicks
    const wickRoll = Math.random();
    let wickExtensionHigh: number;
    let wickExtensionLow: number;

    if (wickRoll < 0.25) {
      // No upper wick - body top IS the high
      wickExtensionHigh = 0;
      wickExtensionLow = Math.random() * 20 + 20;
    } else if (wickRoll < 0.5) {
      // No lower wick - body bottom IS the low
      wickExtensionHigh = Math.random() * 20 + 20;
      wickExtensionLow = 0;
    } else if (wickRoll < 0.6) {
      // Minimal wicks (doji-like appearance)
      wickExtensionHigh = Math.random() * 8 + 2;
      wickExtensionLow = Math.random() * 8 + 2;
    } else {
      // Both wicks (normal candle)
      wickExtensionHigh = Math.random() * 20 + 20;
      wickExtensionLow = Math.random() * 20 + 20;
    }

    const rawHigh = Math.max(rawOpen, rawClose) + wickExtensionHigh;
    const rawLow = Math.min(rawOpen, rawClose) - wickExtensionLow;

    candles.push({
      rawOpen,
      rawHigh,
      rawLow,
      rawClose,
      isGreen: rawClose > rawOpen,
    });

    // Add gap volatility between candles (gaps up or down)
    const gapDirection = Math.random() > 0.5 ? 1 : -1;
    const gapSize = Math.random() * 15 * gapDirection;
    currentPrice = rawClose + gapSize;
  }

  return candles;
}

function normalizeCandles(rawCandles: Omit<CandleData, 'x' | 'open' | 'high' | 'low' | 'close' | 'id'>[]): CandleData[] {
  const allPrices = rawCandles.flatMap(c => [c.rawHigh, c.rawLow]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  const viewportTop = SVG_HEIGHT * VIEWPORT_TOP_PERCENT;
  const viewportBottom = SVG_HEIGHT * VIEWPORT_BOTTOM_PERCENT;
  const viewportRange = viewportBottom - viewportTop;

  const usableWidth = SVG_WIDTH - MARGIN * 2;
  const candleSpacing = usableWidth / CANDLE_COUNT;

  return rawCandles.map((candle, i) => {
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

interface MigrationMarker {
  x: number; // Position in SVG coordinates
  label: string;
}

interface CandlestickProps {
  candle: CandleData;
  index: number;
}

interface MigrationLineProps {
  marker: MigrationMarker;
  index: number;
}

function MigrationLine({ marker, index }: MigrationLineProps) {
  const lineColor = '#52C97D';
  const baseDelay = 1.5 + (index * 0.4); // Start after first few candles appear

  // Line spans the entire height of the hero
  const lineTop = 0;
  const lineBottom = SVG_HEIGHT;

  // Label positioned at original location (near top of viewport area)
  const labelY = SVG_HEIGHT * VIEWPORT_TOP_PERCENT + 20;

  return (
    <g>
      {/* Vertical dashed line */}
      <motion.line
        x1={marker.x}
        x2={marker.x}
        y1={lineTop}
        y2={lineBottom}
        stroke={lineColor}
        strokeWidth={3}
        strokeDasharray="10 8"
        strokeOpacity={0.7}
        strokeLinecap="round"
        initial={{ opacity: 0, pathLength: 0 }}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={{
          opacity: {
            duration: 0.4,
            delay: baseDelay,
            ease: 'easeOut',
          },
          pathLength: {
            duration: 0.8,
            delay: baseDelay,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
        filter="url(#migrationGlow)"
      />

      {/* Label using foreignObject to prevent text squishing */}
      <motion.g
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: baseDelay + 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <foreignObject
          x={marker.x - 50}
          y={labelY}
          width={100}
          height={32}
          style={{ overflow: 'visible' }}
        >
          <div
            style={{
              width: '100px',
              height: '32px',
              background: '#000000',
              border: `2px solid ${lineColor}`,
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 12px ${lineColor}40`,
            }}
          >
            <span
              style={{
                color: lineColor,
                fontSize: '13px',
                fontWeight: '700',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.8px',
                whiteSpace: 'nowrap',
              }}
            >
              {marker.label}
            </span>
          </div>
        </foreignObject>
      </motion.g>
    </g>
  );
}

function Candlestick({ candle, index }: CandlestickProps) {
  const color = candle.isGreen ? '#52C97D' : '#ef4444';
  const glowFilter = candle.isGreen ? 'url(#greenGlow)' : 'url(#redGlow)';

  // Wick range (full H-L)
  const wickTop = candle.high;
  const wickBottom = candle.low;
  const wickHeight = wickBottom - wickTop;

  // Body range (O-C)
  const bodyTop = Math.min(candle.open, candle.close);
  const bodyBottom = Math.max(candle.open, candle.close);
  const bodyHeight = bodyBottom - bodyTop;

  const baseDelay = index * CANDLE_DELAY;

  /**
   * Directional shrinking based on candle type
   */

  let yKeyframes: number[];
  let heightKeyframes: number[];

  if (candle.isGreen) {
    // GREEN: Top moves first, then bottom moves
    yKeyframes = [wickTop, bodyTop, bodyTop];
    heightKeyframes = [
      wickHeight,
      wickBottom - bodyTop,
      bodyHeight,
    ];
  } else {
    // RED: Bottom moves first, then top moves
    yKeyframes = [wickTop, wickTop, bodyTop];
    heightKeyframes = [
      wickHeight,
      bodyBottom - wickTop,
      bodyHeight,
    ];
  }

  return (
    <g>
      {/* WICK - rendered behind body */}
      <motion.line
        x1={candle.x}
        x2={candle.x}
        y1={wickTop}
        y2={wickBottom}
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.7}
        strokeLinecap="round"
        initial={{ opacity: 0, pathLength: 0 }}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={{
          opacity: {
            duration: APPEAR_DURATION * 0.5,
            delay: baseDelay,
            ease: 'easeOut',
          },
          pathLength: {
            duration: APPEAR_DURATION,
            delay: baseDelay,
            ease: 'easeOut',
          },
        }}
      />

      {/* BODY - shrinks directionally to reveal wicks */}
      <motion.rect
        x={candle.x - 12}
        width={24}
        fill={color}
        fillOpacity={0.95}
        filter={glowFilter}
        rx={2}
        initial={{
          y: wickTop,
          height: wickHeight,
          opacity: 0,
        }}
        animate={{
          y: yKeyframes,
          height: heightKeyframes,
          opacity: 1,
        }}
        transition={{
          opacity: {
            duration: APPEAR_DURATION,
            delay: baseDelay,
            ease: [0.25, 0.1, 0.25, 1], // Smooth cubic bezier
          },
          y: {
            duration: SETTLE_DURATION,
            delay: baseDelay + APPEAR_DURATION * 0.5,
            ease: [0.34, 1.56, 0.64, 1], // Slight overshoot for organic feel
            times: [0, 0.6, 1],
          },
          height: {
            duration: SETTLE_DURATION,
            delay: baseDelay + APPEAR_DURATION * 0.5,
            ease: [0.34, 1.56, 0.64, 1], // Slight overshoot for organic feel
            times: [0, 0.6, 1],
          },
        }}
      />
    </g>
  );
}

function generateMigrationMarkers(): MigrationMarker[] {
  // Place migration marker at dead center of the timeline
  // Represents a key pool migration event in the project's history
  const markers: MigrationMarker[] = [
    {
      x: SVG_WIDTH * 0.5, // Dead center
      label: 'MIGRATION',
    },
  ];

  return markers;
}

export function AnimatedCandlestickBackground() {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [migrations, setMigrations] = useState<MigrationMarker[]>([]);
  const [cycleKey, setCycleKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Generate initial candles and migrations
    const rawCandles = generateCandleData();
    const normalized = normalizeCandles(rawCandles);
    setCandles(normalized);
    setMigrations(generateMigrationMarkers());
    setIsVisible(true);
  }, []);

  // Handle the animation cycle
  useEffect(() => {
    if (!mounted) return;

    // Schedule exit after animation completes + hold
    const exitTimeout = setTimeout(() => {
      setIsVisible(false);
    }, ANIMATION_COMPLETE + HOLD_DURATION);

    // Schedule new cycle after exit animation
    const newCycleTimeout = setTimeout(() => {
      const rawCandles = generateCandleData();
      const normalized = normalizeCandles(rawCandles);
      setCandles(normalized);
      setMigrations(generateMigrationMarkers());
      setCycleKey(prev => prev + 1);
      setIsVisible(true);
    }, CYCLE_DURATION);

    return () => {
      clearTimeout(exitTimeout);
      clearTimeout(newCycleTimeout);
    };
  }, [mounted, cycleKey]);

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
        <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="migrationGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="labelGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.g
            key={cycleKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: EXIT_DURATION,
              ease: [0.4, 0, 0.2, 1] // Smooth ease out
            }}
          >
            {/* Render candlesticks first (behind migration labels) */}
            {candles.map((candle, index) => (
              <Candlestick
                key={`${cycleKey}-${candle.id}`}
                candle={candle}
                index={index}
              />
            ))}

            {/* Render migration lines and labels on top */}
            {migrations.map((marker, index) => (
              <MigrationLine
                key={`${cycleKey}-migration-${index}`}
                marker={marker}
                index={index}
              />
            ))}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
