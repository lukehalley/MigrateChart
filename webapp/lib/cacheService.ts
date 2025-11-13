import { supabase, isSupabaseConfigured } from './supabase';
import { OHLCData, Timeframe } from './types';

/**
 * Service for caching OHLC data in Supabase
 * Helps reduce API calls by storing historical candlestick data
 */

interface CachedOHLCData {
  token_address: string;
  timeframe: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Get the timeframe interval in seconds
 * Used to determine which candles are "complete" and can be cached
 */
function getTimeframeInterval(timeframe: Timeframe): number {
  const intervals: Record<Timeframe, number> = {
    '1H': 3600,
    '4H': 14400,
    '8H': 28800,
    '1D': 86400,
    'MAX': 86400,
  };
  return intervals[timeframe];
}

/**
 * Determine if a candle is complete (in the past) and can be cached
 */
function isCandleComplete(timestamp: number, timeframe: Timeframe): boolean {
  const now = Math.floor(Date.now() / 1000);
  const interval = getTimeframeInterval(timeframe);

  // A candle is complete if its end time has passed
  const candleEndTime = timestamp + interval;
  return candleEndTime < now;
}

/**
 * Get cached OHLC data from Supabase
 */
export async function getCachedOHLCData(
  tokenAddress: string,
  timeframe: Timeframe
): Promise<OHLCData[]> {
  if (!isSupabaseConfigured()) {
    console.log('[Cache] Supabase not configured, skipping cache');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('ohlc_cache')
      .select('*')
      .eq('token_address', tokenAddress)
      .eq('timeframe', timeframe)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('[Cache] Error fetching from cache:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log(`[Cache] No cached data found for ${tokenAddress} ${timeframe}`);
      return [];
    }

    console.log(`[Cache] Retrieved ${data.length} candles from cache for ${tokenAddress} ${timeframe}`);

    // Transform to OHLCData format
    return data.map((row: CachedOHLCData) => ({
      time: row.timestamp,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
    }));
  } catch (error) {
    console.error('[Cache] Error accessing cache:', error);
    return [];
  }
}

/**
 * Save OHLC data to Supabase cache
 * Only caches complete candles (those in the past)
 */
export async function saveCachedOHLCData(
  tokenAddress: string,
  timeframe: Timeframe,
  data: OHLCData[]
): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[Cache] Supabase not configured, skipping cache save');
    return;
  }

  if (data.length === 0) {
    return;
  }

  try {
    // Filter to only complete candles
    const completeCandles = data.filter(candle =>
      isCandleComplete(candle.time, timeframe)
    );

    if (completeCandles.length === 0) {
      console.log(`[Cache] No complete candles to cache for ${tokenAddress} ${timeframe}`);
      return;
    }

    // Transform to cache format
    const cacheData: CachedOHLCData[] = completeCandles.map(candle => ({
      token_address: tokenAddress,
      timeframe,
      timestamp: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
    }));

    // Upsert data (insert or update if exists)
    const { error } = await supabase
      .from('ohlc_cache')
      .upsert(cacheData, {
        onConflict: 'token_address,timeframe,timestamp',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('[Cache] Error saving to cache:', error);
      return;
    }

    console.log(`[Cache] Saved ${cacheData.length} candles to cache for ${tokenAddress} ${timeframe}`);
  } catch (error) {
    console.error('[Cache] Error saving to cache:', error);
  }
}

/**
 * Get missing timestamps that need to be fetched from API
 * Compares cached data with expected data range
 */
export function getMissingTimestamps(
  cachedData: OHLCData[],
  expectedStart: number,
  expectedEnd: number,
  timeframe: Timeframe
): { needsFetch: boolean; missingRanges: Array<{ start: number; end: number }> } {
  if (cachedData.length === 0) {
    return {
      needsFetch: true,
      missingRanges: [{ start: expectedStart, end: expectedEnd }],
    };
  }

  const interval = getTimeframeInterval(timeframe);
  const cachedTimestamps = new Set(cachedData.map(d => d.time));
  const missingRanges: Array<{ start: number; end: number }> = [];

  let rangeStart: number | null = null;

  // Check each expected timestamp
  for (let ts = expectedStart; ts <= expectedEnd; ts += interval) {
    if (!cachedTimestamps.has(ts) && isCandleComplete(ts, timeframe)) {
      if (rangeStart === null) {
        rangeStart = ts;
      }
    } else {
      if (rangeStart !== null) {
        missingRanges.push({ start: rangeStart, end: ts - interval });
        rangeStart = null;
      }
    }
  }

  // Close any open range
  if (rangeStart !== null) {
    missingRanges.push({ start: rangeStart, end: expectedEnd });
  }

  return {
    needsFetch: missingRanges.length > 0,
    missingRanges,
  };
}

/**
 * Merge cached data with freshly fetched data
 */
export function mergeOHLCData(
  cachedData: OHLCData[],
  freshData: OHLCData[]
): OHLCData[] {
  // Create a map for efficient lookups
  const dataMap = new Map<number, OHLCData>();

  // Add cached data first
  cachedData.forEach(candle => {
    dataMap.set(candle.time, candle);
  });

  // Add/override with fresh data
  freshData.forEach(candle => {
    dataMap.set(candle.time, candle);
  });

  // Convert back to array and sort by time
  return Array.from(dataMap.values()).sort((a, b) => a.time - b.time);
}
