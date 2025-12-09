'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, DollarSign, BarChart3, Flame, Cog, Activity } from 'lucide-react';

interface CandleData {
  id: number;
  open: number;
  high: number;
  low: number;
  close: number;
  isGreen: boolean;
}

function generateContinuousCandles(count: number): CandleData[] {
  const candles: CandleData[] = [];
  let price = 100 + Math.random() * 40;

  for (let i = 0; i < count; i++) {
    const forceGreen = i >= count - 3;
    const isGreen = forceGreen ? true : Math.random() > 0.48;
    const bodySize = Math.random() * 18 + 8;
    const wickUp = Math.random() * 10;
    const wickDown = Math.random() * 10;
    const open = price;
    const close = isGreen ? open + bodySize : open - bodySize;
    const high = Math.max(open, close) + wickUp;
    const low = Math.min(open, close) - wickDown;
    candles.push({ id: i, open, high, low, close, isGreen: close > open });
    const bias = i >= count - 5 ? 3 : 0;
    price = close + (Math.random() - 0.5) * 8 + bias;
    if (price < 60) price = 60 + Math.random() * 20;
    if (price > 220) price = 220 - Math.random() * 10;
  }
  return candles;
}

function normalizeCandles(candles: CandleData[], width: number, height: number, padding: { top: number; right: number; bottom: number; left: number }) {
  if (!candles || candles.length === 0) return { normalized: [], minPrice: 0, maxPrice: 0 };
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  const usableWidth = width - padding.left - padding.right;
  const usableHeight = height - padding.top - padding.bottom;
  const candleSpacing = usableWidth / candles.length;

  const normalized = candles.map((candle, i) => {
    const priceToY = (price: number) => padding.top + usableHeight - ((price - minPrice) / priceRange) * usableHeight;
    const bodyTop = priceToY(Math.max(candle.open, candle.close));
    const bodyBottom = priceToY(Math.min(candle.open, candle.close));
    return {
      candle,
      x: padding.left + i * candleSpacing + candleSpacing / 2,
      y: bodyTop,
      bodyHeight: Math.max(bodyBottom - bodyTop, 2),
      wickTop: priceToY(candle.high),
      wickBottom: priceToY(candle.low),
    };
  });

  return { normalized, minPrice, maxPrice };
}

// Continuous History with Price/Market Cap Toggle
function ContinuousHistoryViz({ isAnimating }: { isAnimating: boolean }) {
  const [showMarketCap, setShowMarketCap] = useState(false);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const migrationPoint = 12;
  const width = 520;
  const height = 200;
  const padding = { top: 25, right: 65, bottom: 35, left: 55 };

  useEffect(() => {
    setCandles(generateContinuousCandles(24));
    const interval = setInterval(() => {
      setShowMarketCap(prev => !prev);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const { normalized, minPrice, maxPrice } = normalizeCandles(candles, width, height, padding);
  const candleWidth = 6;

  const priceLabels = [
    { value: maxPrice, y: padding.top },
    { value: (maxPrice + minPrice) / 2, y: padding.top + (height - padding.top - padding.bottom) / 2 },
    { value: minPrice, y: height - padding.bottom },
  ];

  const mcapMultiplier = 18_620_000;
  const mcapLabels = priceLabels.map(p => ({ value: p.value * mcapMultiplier, y: p.y }));

  if (normalized.length === 0) return null;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="candleGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />

      {priceLabels.map((label, i) => (
        <line key={i} x1={padding.left} y1={label.y} x2={width - padding.right} y2={label.y} stroke="rgba(82, 201, 125, 0.04)" strokeWidth={1} strokeDasharray="4 4" />
      ))}

      {normalized.map((n, i) => {
        const color = n.candle.isGreen ? '#52C97D' : '#ef4444';
        const isOldPool = i < migrationPoint;
        const opacity = isOldPool ? 0.4 : 1;
        return (
          <motion.g
            key={n.candle.id}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={isAnimating ? { opacity: opacity, scaleY: 1 } : {}}
            transition={{ duration: 0.3, delay: i * 0.025, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: `${n.x}px ${n.y + n.bodyHeight / 2}px` }}
          >
            <line x1={n.x} y1={n.wickTop} x2={n.x} y2={n.wickBottom} stroke={color} strokeWidth={1.5} strokeOpacity={0.7 * opacity} />
            <rect x={n.x - candleWidth / 2} y={n.y} width={candleWidth} height={n.bodyHeight} fill={color} fillOpacity={opacity} rx={1} filter="url(#candleGlow)" />
          </motion.g>
        );
      })}

      {normalized[migrationPoint - 1] && normalized[migrationPoint] && (() => {
        const lineX = normalized[migrationPoint - 1].x + (normalized[migrationPoint].x - normalized[migrationPoint - 1].x) / 2;
        return (
          <motion.g initial={{ opacity: 0 }} animate={isAnimating ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.8 }}>
            <line x1={lineX} y1={padding.top} x2={lineX} y2={height - padding.bottom} stroke="#52C97D" strokeWidth={10} strokeOpacity={0.12} strokeDasharray="6 4" />
            <line x1={lineX} y1={padding.top} x2={lineX} y2={height - padding.bottom} stroke="#52C97D" strokeWidth={2.5} strokeOpacity={0.95} strokeDasharray="6 4" />
            <motion.text
              x={lineX}
              y={padding.top - 5}
              textAnchor="middle"
              fill="#52C97D"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.4, delay: 1 }}
            >
              MIGRATION
            </motion.text>
          </motion.g>
        );
      })()}

      <AnimatePresence mode="wait">
        {(showMarketCap ? mcapLabels : priceLabels).map((label, i) => (
          <motion.text
            key={`${showMarketCap ? 'mcap' : 'price'}-${i}`}
            x={width - padding.right + 10}
            y={label.y}
            textAnchor="start"
            dominantBaseline="middle"
            fill={showMarketCap ? '#D4A853' : '#52C97D'}
            fontSize="9.5"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="500"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 0.75, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            {showMarketCap ? `$${(label.value / 1_000_000).toFixed(1)}M` : `$${label.value.toFixed(2)}`}
          </motion.text>
        ))}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.text
          key={showMarketCap ? 'mcap-label' : 'price-label'}
          x={width - padding.right + 10}
          y={padding.top - 10}
          textAnchor="start"
          fill={showMarketCap ? '#D4A853' : '#52C97D'}
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="700"
          letterSpacing="0.5"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 0.9, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.4 }}
        >
          {showMarketCap ? 'MKT CAP' : 'PRICE'}
        </motion.text>
      </AnimatePresence>
    </svg>
  );
}

// Volume Analytics
function VolumeViz({ isAnimating }: { isAnimating: boolean }) {
  const bars = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    height: 40 + Math.random() * 80,
    accumulated: 20 + i * 3 + Math.random() * 15,
  }));

  return (
    <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#52C97D" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#52C97D" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {bars.map((bar, i) => {
        const x = 30 + i * 28;
        const barY = 155 - bar.height;
        const accumY = 155 - bar.accumulated;
        return (
          <motion.g key={bar.id}>
            <motion.rect
              x={x}
              y={barY}
              width={20}
              height={bar.height}
              fill="url(#volumeGradient)"
              rx={2}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={isAnimating ? { scaleY: 1, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.045, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ transformOrigin: `${x + 10}px 155px` }}
            />
            <motion.circle
              cx={x + 10}
              cy={accumY}
              r={3}
              fill="#D4A853"
              initial={{ scale: 0, opacity: 0 }}
              animate={isAnimating ? { scale: 1, opacity: 0.9 } : {}}
              transition={{ duration: 0.3, delay: i * 0.045 + 0.2 }}
            />
          </motion.g>
        );
      })}
      <motion.path
        d={bars.map((bar, i) => `${i === 0 ? 'M' : 'L'} ${30 + i * 28 + 10} ${155 - bar.accumulated}`).join(' ')}
        stroke="#D4A853"
        strokeWidth={2}
        fill="none"
        strokeDasharray="4 2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isAnimating ? { pathLength: 1, opacity: 0.7 } : {}}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.text x={30} y={170} fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="JetBrains Mono" initial={{ opacity: 0 }} animate={isAnimating ? { opacity: 1 } : {}} transition={{ delay: 1 }}>
        Daily volume (bars) · Cumulative (line)
      </motion.text>
    </svg>
  );
}

// Holder Tracking - Split display
function HolderTrackingViz({ isAnimating }: { isAnimating: boolean }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const timeframes = [
    { label: '1H', holders: 4_127, change: 12, isPositive: true },
    { label: '4H', holders: 4_203, change: 76, isPositive: true },
    { label: '8H', holders: 4_318, change: 115, isPositive: true },
    { label: '1D', holders: 4_521, change: 203, isPositive: true },
    { label: '1W', holders: 4_847, change: 326, isPositive: true },
    { label: 'MAX', holders: 4_847, change: 1247, isPositive: true },
  ];

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % timeframes.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const frame = timeframes[currentFrame];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '220px', justifyContent: 'center', padding: '1rem 2rem', gap: '1.75rem' }}>
      {/* Timeframes at top */}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
        {timeframes.map((tf, i) => (
          <motion.div
            key={tf.label}
            animate={{
              scale: i === currentFrame ? 1.1 : 1,
              opacity: i === currentFrame ? 1 : 0.25,
            }}
            transition={{ duration: 0.3 }}
            style={{
              padding: '0.3rem 0.55rem',
              background: i === currentFrame ? 'rgba(82, 201, 125, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${i === currentFrame ? 'rgba(82, 201, 125, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '5px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              fontWeight: '600',
              color: i === currentFrame ? '#52C97D' : 'rgba(255, 255, 255, 0.3)',
              letterSpacing: '0.03em',
            }}
          >
            {tf.label}
          </motion.div>
        ))}
      </div>

      {/* Two columns below */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        {/* Left side - Holder count */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`holders-${currentFrame}`}
              initial={{ opacity: 0, y: 15, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.92 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '2rem',
                fontWeight: '700',
                color: '#fff',
                textAlign: 'center',
                lineHeight: '1',
              }}
            >
              {frame.holders.toLocaleString()}
            </motion.div>
          </AnimatePresence>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Total Holders
          </div>
        </div>

        {/* Vertical divider */}
        <div style={{ width: '1px', height: '80px', background: 'rgba(255, 255, 255, 0.08)', margin: '0 1.5rem' }} />

        {/* Right side - Change */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`change-${currentFrame}`}
              initial={{ opacity: 0, y: 15, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.92 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '2rem',
                fontWeight: '700',
                color: frame.isPositive ? '#52C97D' : '#ef4444',
                textAlign: 'center',
                lineHeight: '1',
                textShadow: `0 0 30px ${frame.isPositive ? 'rgba(82, 201, 125, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
              }}
            >
              {frame.isPositive ? '+' : '-'}{frame.change.toLocaleString()}
            </motion.div>
          </AnimatePresence>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Change
          </div>
        </div>
      </div>
    </div>
  );
}

// Fee Analytics - Two column comparison
function FeeAnalyticsViz({ isAnimating }: { isAnimating: boolean }) {
  const oldPoolFees = 180.23;
  const newPoolFees = 481.44;
  const totalFees = oldPoolFees + newPoolFees;

  return (
    <div style={{ display: 'flex', height: '180px', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', gap: '1.5rem' }}>
      {/* Left - Old Pool */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isAnimating ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '3px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '1.4rem',
            fontWeight: '700',
            color: '#ef4444',
          }}>
            $180
          </div>
        </motion.div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.7rem',
          color: 'rgba(239, 68, 68, 0.7)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Old Pool
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isAnimating ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          {((oldPoolFees / totalFees) * 100).toFixed(0)}%
        </motion.div>
      </div>

      {/* Center divider with total */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem' }}>
        <div style={{ width: '1px', height: '30px', background: 'rgba(255, 255, 255, 0.08)' }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isAnimating ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            padding: '0.5rem 0.85rem',
            background: 'rgba(212, 168, 83, 0.15)',
            border: '1px solid rgba(212, 168, 83, 0.3)',
            borderRadius: '8px',
            fontFamily: 'Syne, sans-serif',
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#D4A853',
            textAlign: 'center',
          }}
        >
          ${totalFees.toFixed(0)}
        </motion.div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          color: 'rgba(212, 168, 83, 0.7)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Total
        </div>
        <div style={{ width: '1px', height: '30px', background: 'rgba(255, 255, 255, 0.08)' }} />
      </div>

      {/* Right - New Pool */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isAnimating ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(82, 201, 125, 0.15)',
            border: '3px solid rgba(82, 201, 125, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(82, 201, 125, 0.2)',
          }}
        >
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '1.4rem',
            fontWeight: '700',
            color: '#52C97D',
          }}>
            $481
          </div>
        </motion.div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.7rem',
          color: 'rgba(82, 201, 125, 0.7)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          New Pool
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isAnimating ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          {((newPoolFees / totalFees) * 100).toFixed(0)}%
        </motion.div>
      </div>
    </div>
  );
}

// Burn Tracking - Two column supply visualization
function BurnTrackingViz({ isAnimating }: { isAnimating: boolean }) {
  const initialSupply = 999_368_326;
  const burnedAmount = 15_234_891;
  const currentSupply = initialSupply - burnedAmount;
  const burnPercentage = (burnedAmount / initialSupply) * 100;

  const totalBars = 50;
  const burnedBars = Math.round((burnPercentage / 100) * totalBars);

  return (
    <div style={{ display: 'flex', height: '180px', alignItems: 'center', justifyContent: 'space-evenly', padding: '0 1.5rem', gap: '1rem' }}>
      {/* Left column - Supply visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px', width: '140px' }}>
          {Array.from({ length: totalBars }, (_, i) => {
            const isBurned = i < burnedBars;
            return (
              <motion.div
                key={i}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={isAnimating ? { scaleY: 1, opacity: isBurned ? 0.3 : 1 } : {}}
                transition={{ duration: 0.3, delay: i * 0.015, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  height: '7px',
                  background: isBurned ? '#ef4444' : '#52C97D',
                  borderRadius: '1.5px',
                  transformOrigin: 'bottom',
                }}
              />
            );
          })}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isAnimating ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255, 255, 255, 0.4)',
            textAlign: 'center',
            letterSpacing: '0.03em',
          }}
        >
          Supply viz
        </motion.div>
      </div>

      <div style={{ width: '1px', height: '100px', background: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Right column - Numbers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isAnimating ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#ef4444',
              textShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
            }}
          >
            -15M
          </motion.div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(239, 68, 68, 0.6)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Burned
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isAnimating ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.7 }}
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#52C97D',
            }}
          >
            984M
          </motion.div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(82, 201, 125, 0.6)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Supply
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Mechanics
function CustomMechanicsViz({ isAnimating }: { isAnimating: boolean }) {
  const nodes = [
    { x: 100, y: 90, label: 'Hold', color: '#52C97D' },
    { x: 250, y: 50, label: 'Tax', color: '#D4A853' },
    { x: 250, y: 130, label: 'LP', color: '#9370DB' },
    { x: 400, y: 90, label: 'Earn', color: '#52C97D' },
  ];

  const connections = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
  ];

  return (
    <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="flowGradient1">
          <stop offset="0%" stopColor="#52C97D" />
          <stop offset="100%" stopColor="#D4A853" />
        </linearGradient>
        <linearGradient id="flowGradient2">
          <stop offset="0%" stopColor="#52C97D" />
          <stop offset="100%" stopColor="#9370DB" />
        </linearGradient>
      </defs>
      {connections.map((conn, i) => {
        const from = nodes[conn.from];
        const to = nodes[conn.to];
        return (
          <motion.line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={`url(#flowGradient${i % 2 + 1})`}
            strokeWidth={2}
            strokeOpacity={0.4}
            strokeDasharray="4 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isAnimating ? { pathLength: 1, opacity: 0.5 } : {}}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
          />
        );
      })}
      {nodes.map((node, i) => (
        <motion.g key={i}>
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={26}
            fill="rgba(0, 0, 0, 0.85)"
            stroke={node.color}
            strokeWidth={2}
            initial={{ scale: 0, opacity: 0 }}
            animate={isAnimating ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          />
          <motion.text
            x={node.x}
            y={node.y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={node.color}
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="600"
            initial={{ opacity: 0 }}
            animate={isAnimating ? { opacity: 0.9 } : {}}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.15 }}
          >
            {node.label}
          </motion.text>
        </motion.g>
      ))}
    </svg>
  );
}

const styles = `
  .unified-metrics {
    padding: 4rem 2rem 2rem;
    position: relative;
    overflow: hidden;
  }
  .unified-container {
    max-width: 1100px;
    margin: 0 auto;
  }
  .unified-header {
    text-align: center;
    margin-bottom: 5rem;
  }
  .unified-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(212, 168, 83, 0.1);
    border: 1px solid rgba(212, 168, 83, 0.25);
    border-radius: 100px;
    font-size: 0.65rem;
    font-weight: 600;
    color: #D4A853;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
  }
  .unified-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.75rem, 5vw, 3rem);
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
    background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .unified-subtitle {
    font-size: 1.05rem;
    color: rgba(255, 255, 255, 0.6);
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.7;
  }
  .metrics-features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
    gap: 2.5rem;
  }
  @media (max-width: 1050px) {
    .metrics-features-grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 540px) {
    .unified-metrics {
      padding: 2rem 1rem 1rem;
    }
    .unified-header {
      margin-bottom: 2.5rem;
    }
    .unified-subtitle {
      font-size: 0.9rem;
    }
    .metrics-features-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
  .metrics-feature-card {
    position: relative;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 2rem;
    backdrop-filter: blur(20px);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }
  .metrics-feature-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(82, 201, 125, 0.15) 0%, transparent 50%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  .metrics-feature-card:hover::before {
    opacity: 1;
  }
  .metrics-feature-card:hover {
    transform: translateY(-8px);
    border-color: rgba(82, 201, 125, 0.3);
    box-shadow: 0 20px 60px rgba(82, 201, 125, 0.15);
  }
  @media (max-width: 540px) {
    .metrics-feature-card {
      padding: 1.25rem;
      border-radius: 16px;
    }
    .metrics-feature-card:hover {
      transform: none;
    }
  }
  .metrics-feature-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .metrics-feature-icon-title {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .metrics-feature-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(82, 201, 125, 0.12);
    border: 1px solid rgba(82, 201, 125, 0.25);
    border-radius: 10px;
    color: #52C97D;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  .metrics-feature-card:hover .metrics-feature-icon {
    background: rgba(82, 201, 125, 0.2);
    box-shadow: 0 0 25px rgba(82, 201, 125, 0.3);
  }
  @media (max-width: 540px) {
    .metrics-feature-icon {
      width: 38px;
      height: 38px;
    }
    .metrics-feature-icon-title {
      gap: 0.75rem;
    }
  }
  .metrics-feature-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 600;
    color: #fff;
  }
  @media (max-width: 540px) {
    .metrics-feature-title {
      font-size: 1.1rem;
    }
  }
  .metrics-feature-badge {
    padding: 0.4rem 0.85rem;
    border-radius: 100px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  @media (max-width: 540px) {
    .metrics-feature-badge {
      padding: 0.3rem 0.6rem;
      font-size: 0.55rem;
    }
  }
  .metrics-feature-badge.core {
    background: rgba(82, 201, 125, 0.15);
    color: #52C97D;
    border: 1px solid rgba(82, 201, 125, 0.3);
  }
  .metrics-feature-badge.advanced {
    background: rgba(212, 168, 83, 0.15);
    color: #D4A853;
    border: 1px solid rgba(212, 168, 83, 0.3);
  }
  .metrics-feature-badge.custom {
    background: rgba(147, 112, 219, 0.15);
    color: #9370DB;
    border: 1px solid rgba(147, 112, 219, 0.3);
  }
  .metrics-feature-description {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }
  @media (max-width: 540px) {
    .metrics-feature-description {
      font-size: 0.8rem;
      margin-bottom: 1rem;
      line-height: 1.6;
    }
  }
  .viz-container {
    height: 220px;
    position: relative;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @media (max-width: 540px) {
    .viz-container {
      height: 200px;
      border-radius: 10px;
    }
  }
`;

export default function UnifiedMetricsShowcase() {
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <BarChart3 size={24} />,
      title: "Continuous History",
      description: "Complete Price And Market Cap Data Across All Migrations. Switch Between Views Seamlessly—Both Preserved From Day One.",
      badge: "Core",
      viz: <ContinuousHistoryViz isAnimating={mounted} />,
    },
    {
      icon: <Activity size={24} />,
      title: "Volume Analytics",
      description: "24h Volume And Cumulative Totals Across Pool Phases. Spot Liquidity Shifts And Trading Momentum Instantly.",
      badge: "Core",
      viz: <VolumeViz isAnimating={mounted} />,
    },
    {
      icon: <Users size={24} />,
      title: "Holder Tracking",
      description: "Monitor Holder Count Evolution Across Any Timeframe. See Community Growth Correlate With Migrations And Events.",
      badge: "Advanced",
      viz: <HolderTrackingViz isAnimating={mounted} />,
    },
    {
      icon: <DollarSign size={24} />,
      title: "Fee Analytics",
      description: "Visualize Fees Collected Per Pool. Revenue Tracking For Devs—See What Your Liquidity Strategy Actually Earns.",
      badge: "Advanced",
      viz: <FeeAnalyticsViz isAnimating={mounted} />,
    },
    {
      icon: <Flame size={24} />,
      title: "Burn Tracking",
      description: "Deflationary Mechanics Visualized. Monitor Burn Rate, Supply Reduction, And Scarcity Increases Over Time.",
      badge: "Advanced",
      viz: <BurnTrackingViz isAnimating={mounted} />,
    },
    {
      icon: <Cog size={24} />,
      title: "Custom Mechanics",
      description: "Map Your Unique Tokenomics. Rebases, Reflections, Staking Rewards—We Adapt To Any Model Your Project Uses.",
      badge: "Custom",
      viz: <CustomMechanicsViz isAnimating={mounted} />,
    },
  ];

  return (
    <section ref={ref} id="metrics" className="unified-metrics" suppressHydrationWarning>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {mounted && (
        <div className="unified-container">
          <div className="unified-header">
            <div className="unified-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Comprehensive Analytics
            </div>
            <h2 className="unified-title">Track Every Metric That Matters</h2>
            <p className="unified-subtitle">
              From Market Fundamentals To Advanced Tokenomics—All Preserved Across Migrations.
              One Unified Dashboard For Complete Project Intelligence.
            </p>
          </div>

          <div className="metrics-features-grid">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="metrics-feature-card"
              >
                <div className="metrics-feature-header">
                  <div className="metrics-feature-icon-title">
                    <div className="metrics-feature-icon">{feature.icon}</div>
                    <h3 className="metrics-feature-title">{feature.title}</h3>
                  </div>
                  <span className={`metrics-feature-badge ${feature.badge.toLowerCase()}`}>
                    {feature.badge}
                  </span>
                </div>
                <p className="metrics-feature-description">{feature.description}</p>
                <div className="viz-container">{feature.viz}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
