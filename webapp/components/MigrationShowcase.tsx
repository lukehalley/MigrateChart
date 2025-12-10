'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface CandleData {
  id: number;
  open: number;
  high: number;
  low: number;
  close: number;
  isGreen: boolean;
}

const OLD_POOL = {
  symbol: 'ZERA',
  name: 'Old Pool',
  address: '8avjtj...ZERA',
  color: '#ef4444',
};

const NEW_POOL = {
  symbol: 'ZERA',
  name: 'New Pool',
  address: 'QD6pYK...ZERA',
  color: '#52C97D',
};

function generateContinuousCandles(count: number): CandleData[] {
  const candles: CandleData[] = [];
  let price = 100 + Math.random() * 40;

  for (let i = 0; i < count; i++) {
    // Force last 3 candles to be green to end bullish
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

    // Add upward bias for last few candles
    const bias = i >= count - 5 ? 3 : 0;
    price = close + (Math.random() - 0.5) * 8 + bias;
    if (price < 60) price = 60 + Math.random() * 20;
    if (price > 220) price = 220 - Math.random() * 10;
  }
  return candles;
}

function normalizeCandles(candles: CandleData[], width: number, height: number, padding: number = 20) {
  if (!candles || candles.length === 0) return [];
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const candleSpacing = usableWidth / candles.length;
  return candles.map((candle, i) => {
    const priceToY = (price: number) => padding + usableHeight - ((price - minPrice) / priceRange) * usableHeight;
    const bodyTop = priceToY(Math.max(candle.open, candle.close));
    const bodyBottom = priceToY(Math.min(candle.open, candle.close));
    return {
      candle,
      x: padding + i * candleSpacing + candleSpacing / 2,
      spacing: candleSpacing,
      y: bodyTop,
      bodyHeight: Math.max(bodyBottom - bodyTop, 2),
      wickTop: priceToY(candle.high),
      wickBottom: priceToY(candle.low),
    };
  });
}

function MiniChart({ candles, migrationIndex, isAnimating, delay = 0 }: { candles: CandleData[]; migrationIndex?: number; isAnimating: boolean; delay?: number }) {
  const width = 600;
  const height = 200;
  const candleWidth = 8;

  if (!candles || candles.length === 0) {
    return <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} />;
  }

  const normalized = normalizeCandles(candles, width, height, 30);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="candleGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="migrationLineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#52C97D" stopOpacity="0" />
          <stop offset="15%" stopColor="#52C97D" stopOpacity="1" />
          <stop offset="85%" stopColor="#52C97D" stopOpacity="1" />
          <stop offset="100%" stopColor="#52C97D" stopOpacity="0" />
        </linearGradient>
      </defs>

      {normalized.map((n, i) => {
        const color = n.candle.isGreen ? '#52C97D' : '#ef4444';
        const isOldPool = migrationIndex !== undefined && i < migrationIndex;
        const opacity = isOldPool ? 0.5 : 1;

        return (
          <motion.g
            key={n.candle.id}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={isAnimating ? { opacity: opacity, scaleY: 1 } : {}}
            transition={{ duration: 0.3, delay: delay + i * 0.03, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: `${n.x}px ${n.y + n.bodyHeight / 2}px` }}
          >
            <line x1={n.x} y1={n.wickTop} x2={n.x} y2={n.wickBottom} stroke={color} strokeWidth={1.5} strokeOpacity={0.7 * opacity} />
            <rect x={n.x - candleWidth / 2} y={n.y} width={candleWidth} height={n.bodyHeight} fill={color} fillOpacity={opacity} rx={1} filter="url(#candleGlow)" />
          </motion.g>
        );
      })}

      {migrationIndex !== undefined && normalized[migrationIndex] && normalized[migrationIndex - 1] && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={isAnimating ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: delay + migrationIndex * 0.03 + 0.3 }}
        >
          {/* Position migration line BETWEEN candles to avoid overlap */}
          {(() => {
            const lineX = normalized[migrationIndex - 1].x + (normalized[migrationIndex].x - normalized[migrationIndex - 1].x) / 2;
            return (
              <>
                {/* Glow effect behind line */}
                <line
                  x1={lineX}
                  y1={0}
                  x2={lineX}
                  y2={height}
                  stroke="#52C97D"
                  strokeWidth={10}
                  strokeOpacity={0.15}
                  strokeDasharray="6 4"
                />
                {/* Main line */}
                <line
                  x1={lineX}
                  y1={0}
                  x2={lineX}
                  y2={height}
                  stroke="#52C97D"
                  strokeWidth={2.5}
                  strokeOpacity={0.95}
                  strokeDasharray="6 4"
                />
              </>
            );
          })()}
        </motion.g>
      )}
    </svg>
  );
}

const styles = `
  .migration-showcase {
    padding: 6rem 2rem;
    position: relative;
    overflow: hidden;
  }
  .showcase-container {
    max-width: 1100px;
    margin: 0 auto;
  }
  .showcase-header {
    text-align: center;
    margin-bottom: 4rem;
  }
  .showcase-label {
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
  .showcase-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
    background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .showcase-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
  .chart-comparison {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }
  .chart-section {
    position: relative;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 2rem;
    backdrop-filter: blur(20px);
  }
  .chart-section.unified {
    border-color: rgba(82, 201, 125, 0.25);
    box-shadow: 0 0 60px rgba(82, 201, 125, 0.15);
  }
  .chart-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 100px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
  }
  .chart-label.broken {
    background: rgba(239, 68, 68, 0.12);
    color: rgba(239, 68, 68, 0.9);
    border: 1px solid rgba(239, 68, 68, 0.25);
  }
  .chart-label.unified {
    background: rgba(82, 201, 125, 0.12);
    color: #52C97D;
    border: 1px solid rgba(82, 201, 125, 0.3);
  }
  .chart-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.5rem;
  }
  .chart-description {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
  .chart-container {
    height: 200px;
    position: relative;
  }
  .legend {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
  }
  .legend-badge {
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }
  .legend-badge.v1 {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.25);
  }
  .legend-badge.v2 {
    background: rgba(82, 201, 125, 0.15);
    color: #52C97D;
    border: 1px solid rgba(82, 201, 125, 0.25);
  }
  .migration-line-indicator {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .migration-line-visual {
    width: 20px;
    height: 2px;
    background: #52C97D;
    border-radius: 1px;
  }
  .migration-line-visual.dashed {
    background: linear-gradient(90deg, #52C97D 50%, transparent 50%);
    background-size: 6px 2px;
  }
  .showcase-footer {
    text-align: center;
    margin-top: 3rem;
    padding-top: 2rem;
  }
  .showcase-note {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.7;
    max-width: 700px;
    margin: 0 auto;
  }
  .showcase-note strong {
    color: #52C97D;
    font-weight: 600;
  }
  .vs-divider {
    text-align: center;
    position: relative;
    padding: 1rem 0;
  }
  .vs-text {
    display: inline-block;
    padding: 0.5rem 1.5rem;
    background: rgba(212, 168, 83, 0.12);
    border: 1px solid rgba(212, 168, 83, 0.25);
    border-radius: 100px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: 600;
    color: #D4A853;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  @media (max-width: 768px) {
    .legend {
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
    }
  }

  /* Light mode overrides */
  .light .showcase-title,
  html.light .showcase-title {
    background: linear-gradient(180deg, #1a1a1a 0%, rgba(26, 26, 26, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .light .showcase-subtitle,
  html.light .showcase-subtitle {
    color: rgba(26, 26, 26, 0.6);
  }

  .light .chart-section,
  html.light .chart-section {
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(45, 138, 82, 0.15);
    backdrop-filter: blur(20px);
  }

  .light .chart-section.unified,
  html.light .chart-section.unified {
    border-color: rgba(45, 138, 82, 0.25);
    box-shadow: 0 0 40px rgba(45, 138, 82, 0.08);
  }

  .light .chart-title,
  html.light .chart-title {
    color: #1a1a1a;
  }

  .light .chart-description,
  html.light .chart-description {
    color: rgba(26, 26, 26, 0.5);
  }

  .light .legend,
  html.light .legend {
    border-top: 1px solid rgba(45, 138, 82, 0.1);
  }

  .light .legend-item,
  html.light .legend-item {
    color: rgba(26, 26, 26, 0.6);
  }

  .light .showcase-note,
  html.light .showcase-note {
    color: rgba(26, 26, 26, 0.5);
  }

  .light .showcase-note strong,
  html.light .showcase-note strong {
    color: #2d8a52;
  }

  .light .chart-label.unified,
  html.light .chart-label.unified {
    background: rgba(45, 138, 82, 0.1);
    color: #2d8a52;
    border: 1px solid rgba(45, 138, 82, 0.2);
  }
`;

export default function MigrationShowcase() {
  const [mounted, setMounted] = useState(false);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const migrationPoint = 12;

  useEffect(() => {
    setMounted(true);
    setCandles(generateContinuousCandles(24));
  }, []);

  return (
    <section ref={ref} className="migration-showcase" suppressHydrationWarning>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {mounted && candles.length > 0 && (
        <div className="showcase-container">
          <motion.div
            className="showcase-header"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="showcase-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              How It Works
            </div>
            <h2 className="showcase-title">Continuous History Across Migrations</h2>
            <p className="showcase-subtitle">
              Most platforms lose your price history when you migrate pools. We preserve every candle.
            </p>
          </motion.div>

          <motion.div
            className="chart-section unified"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="chart-label unified">With Migrate Chart</div>
            <h3 className="chart-title">Complete Timeline, Full Story</h3>
            <p className="chart-description">
              We stitch old and new pools together automatically. One continuous chart from day one.
            </p>
            <div className="chart-container">
              <MiniChart candles={candles} migrationIndex={migrationPoint} isAnimating={isInView} delay={0.6} />
            </div>
            <div className="legend">
              <div className="legend-item">
                <span className="legend-badge v1">Old Pool</span>
                <span>Historical data preserved</span>
              </div>
              <div className="legend-item">
                <div className="migration-line-indicator">
                  <div className="migration-line-visual dashed" />
                  <span>Migration point</span>
                </div>
              </div>
              <div className="legend-item">
                <span className="legend-badge v2">New Pool</span>
                <span>Current data continues</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="showcase-footer"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <p className="showcase-note">
              <strong>Migrate Chart</strong> automatically detects pool migrations and stitches your complete price history together.
              Show investors your full journey—not just the last few days.
            </p>
          </motion.div>
        </div>
      )}
    </section>
  );
}
