import { OHLCData, Timeframe } from './types';

/**
 * Aggregate 1H candles into higher timeframes (4H, 8H, 1D)
 * This produces accurate OHLC data by combining smaller candles
 */

interface AggregationConfig {
  intervalSeconds: number;
  candleCount: number;
}

const AGGREGATION_CONFIGS: Record<string, AggregationConfig> = {
  '4H': { intervalSeconds: 14400, candleCount: 4 },
  '8H': { intervalSeconds: 28800, candleCount: 8 },
  '1D': { intervalSeconds: 86400, candleCount: 24 },
};

/**
 * Aggregate 1H candles into a higher timeframe
 * @param hourlyCandles - Array of 1H OHLC candles (must be sorted by time ascending)
 * @param targetTimeframe - Target timeframe to aggregate to (4H, 8H, 1D)
 * @returns Aggregated candles for the target timeframe
 */
export function aggregateCandles(
  hourlyCandles: OHLCData[],
  targetTimeframe: '4H' | '8H' | '1D'
): OHLCData[] {
  if (hourlyCandles.length === 0) {
    return [];
  }

  const config = AGGREGATION_CONFIGS[targetTimeframe];
  if (!config) {
    throw new Error(`Unsupported timeframe for aggregation: ${targetTimeframe}`);
  }

  const { intervalSeconds } = config;

  // Sort candles by time (ascending) to ensure correct aggregation
  const sortedCandles = [...hourlyCandles].sort((a, b) => a.time - b.time);

  // Group candles by their aggregation period
  const candleGroups = new Map<number, OHLCData[]>();

  for (const candle of sortedCandles) {
    // Calculate the period start time (aligned to the interval)
    const periodStart = Math.floor(candle.time / intervalSeconds) * intervalSeconds;

    if (!candleGroups.has(periodStart)) {
      candleGroups.set(periodStart, []);
    }
    candleGroups.get(periodStart)!.push(candle);
  }

  // Aggregate each group into a single candle
  const aggregatedCandles: OHLCData[] = [];

  for (const [periodStart, candles] of candleGroups) {
    if (candles.length === 0) continue;

    // Sort candles within the period by time
    candles.sort((a, b) => a.time - b.time);

    const aggregated: OHLCData = {
      time: periodStart,
      open: candles[0].open, // First candle's open
      high: Math.max(...candles.map(c => c.high)), // Highest high
      low: Math.min(...candles.map(c => c.low)), // Lowest low
      close: candles[candles.length - 1].close, // Last candle's close
      volume: candles.reduce((sum, c) => sum + c.volume, 0), // Sum of volumes
    };

    aggregatedCandles.push(aggregated);
  }

  // Sort result by time ascending
  return aggregatedCandles.sort((a, b) => a.time - b.time);
}

/**
 * Check if a timeframe can be aggregated from 1H data
 */
export function canAggregateFromHourly(timeframe: Timeframe): boolean {
  return timeframe === '4H' || timeframe === '8H' || timeframe === '1D';
}

/**
 * Get the appropriate source timeframe for aggregation
 * Returns '1H' if the target can be aggregated, otherwise returns the target itself
 */
export function getSourceTimeframe(targetTimeframe: Timeframe): Timeframe {
  if (canAggregateFromHourly(targetTimeframe)) {
    return '1H';
  }
  return targetTimeframe;
}
