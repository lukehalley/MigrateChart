import { GeckoTerminalResponse, OHLCData, PoolData, POOLS, Timeframe, TIMEFRAME_TO_JUPITER_INTERVAL, TokenStats } from './types';
import { rateLimiter, getApiNameFromUrl } from './rateLimiter';
import {
  getCachedOHLCData,
  saveCachedOHLCData,
  mergeOHLCData,
} from './cacheService';
import {
  getCachedStats,
  saveCachedStats,
  getCachedHolderCount,
  saveCachedHolderCount,
  getCachedMetadata,
  saveCachedMetadata,
} from './statsCacheService';

const BASE_URL = 'https://api.geckoterminal.com/api/v2';
const NETWORK = 'solana';

// Jupiter API for comprehensive historical data
const JUPITER_API = 'https://datapi.jup.ag/v2/charts';
const MON3Y_TOKEN = 'ANNTWQsQ9J3PeM6dXLjdzwYcSzr51RREWQnjuuCEpump';
const ZERA_TOKEN = '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA';

export async function fetchPoolData(
  poolAddress: string,
  timeframe: Timeframe = '1H'
): Promise<OHLCData[]> {
  const url = `${BASE_URL}/networks/${NETWORK}/pools/${poolAddress}/ohlcv/${timeframe}`;

  try {
    const data = await rateLimiter.execute('geckoterminal', async () => {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
        next: {
          revalidate: timeframe === '1H' ? 3600 : timeframe === '4H' ? 14400 : timeframe === '1D' ? 86400 : 604800, // Cache based on timeframe
        },
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return response.json() as Promise<GeckoTerminalResponse>;
    });

    // Transform the OHLCV data
    const ohlcvList = data.data.attributes.ohlcv_list;
    return ohlcvList.map(([timestamp, open, high, low, close, volume]) => ({
      time: timestamp,
      open,
      high,
      low,
      close,
      volume,
    }));
  } catch (error) {
    console.error(`Error fetching data for pool ${poolAddress}:`, error);
    return [];
  }
}

export async function fetchJupiterData(tokenAddress: string, timeframe: Timeframe = '1H'): Promise<OHLCData[]> {
  const now = Date.now();
  const interval = TIMEFRAME_TO_JUPITER_INTERVAL[timeframe];

  try {
    // Step 1: Try to get cached data first
    console.log(`[API] Checking cache for ${tokenAddress} ${timeframe}`);
    const cachedData = await getCachedOHLCData(tokenAddress, timeframe);

    // Step 2: Fetch fresh data from Jupiter API
    console.log(`[API] Fetching fresh data from Jupiter for ${tokenAddress} ${timeframe}`);
    const url = `${JUPITER_API}/${tokenAddress}?interval=${interval}&to=${now}&candles=3000&type=price&quote=usd`;

    const data = await rateLimiter.execute('jupiter', async () => {
      const response = await fetch(url);
      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return response.json();
    });

    // Jupiter API already returns candles in the correct object format
    // {time, open, high, low, close, volume}
    const freshCandles: OHLCData[] = data.candles || [];

    // Step 3: Merge cached data with fresh data
    const mergedData = mergeOHLCData(cachedData, freshCandles);
    console.log(`[API] Merged ${cachedData.length} cached + ${freshCandles.length} fresh = ${mergedData.length} total candles`);

    // Step 4: Save new complete candles to cache (async, don't wait)
    saveCachedOHLCData(tokenAddress, timeframe, freshCandles).catch(err => {
      console.error('[API] Error saving to cache (non-blocking):', err);
    });

    return mergedData;
  } catch (error) {
    console.error(`Error fetching Jupiter data:`, error);

    // If API fails, return cached data as fallback
    try {
      const cachedData = await getCachedOHLCData(tokenAddress, timeframe);
      if (cachedData.length > 0) {
        console.log(`[API] Using cached data as fallback (${cachedData.length} candles)`);
        return cachedData;
      }
    } catch (cacheError) {
      console.error('[API] Cache fallback also failed:', cacheError);
    }

    return [];
  }
}

export async function fetchAllPoolsData(timeframe: Timeframe = '1H'): Promise<PoolData[]> {
  // Use Jupiter API for both tokens
  const [mon3yData, zeraData] = await Promise.all([
    fetchJupiterData(MON3Y_TOKEN, timeframe),
    fetchJupiterData(ZERA_TOKEN, timeframe),
  ]);

  // Add placeholder candles at migration points for marker anchoring
  const MIGRATION_1 = 1759363200; // Oct 2, 2025 - MON3Y → Raydium
  const MIGRATION_2 = 1762300800; // Nov 5, 2025 - Raydium → Meteora

  // Add placeholder at first migration if not present
  const zeraWithMarker = [...zeraData];
  const hasMarker1 = zeraWithMarker.some(c => c.time === MIGRATION_1);
  if (!hasMarker1 && zeraWithMarker.length > 0) {
    // Find surrounding candles to interpolate
    const before = mon3yData[mon3yData.length - 1];
    const after = zeraWithMarker[0];
    if (before && after) {
      zeraWithMarker.unshift({
        time: MIGRATION_1,
        open: before.close,
        high: before.close,
        low: before.close,
        close: before.close,
        volume: 0,
      });
    }
  }

  return [
    {
      pool_name: 'mon3y',
      pool_address: POOLS.mon3y.address,
      token_symbol: POOLS.mon3y.token_symbol,
      data: mon3yData,
    },
    {
      pool_name: 'zera_Raydium',
      pool_address: POOLS.zera_Raydium.address,
      token_symbol: POOLS.zera_Raydium.token_symbol,
      data: [],
    },
    {
      pool_name: 'zera_Meteora',
      pool_address: POOLS.zera_Meteora.address,
      token_symbol: POOLS.zera_Meteora.token_symbol,
      data: zeraWithMarker.sort((a, b) => a.time - b.time),
    },
  ];
}

export function findLocalPeaks(data: OHLCData[], window: number = 5): number[] {
  if (data.length < window * 2) return [];

  const peaks: number[] = [];
  const highs = data.map(d => d.high);

  // Calculate prominence threshold (25% of price range)
  const priceRange = Math.max(...highs) - Math.min(...highs);
  const minProminence = priceRange * 0.25;

  for (let i = window; i < highs.length - window; i++) {
    // Check if current point is higher than neighbors
    const isPeak =
      highs.slice(i - window, i).every(h => highs[i] >= h) &&
      highs.slice(i + 1, i + window + 1).every(h => highs[i] >= h);

    if (isPeak) {
      // Check prominence
      const leftMin = Math.min(...highs.slice(Math.max(0, i - window), i));
      const rightMin = Math.min(...highs.slice(i + 1, Math.min(highs.length, i + window + 1)));
      const prominence = highs[i] - Math.max(leftMin, rightMin);

      if (prominence >= minProminence) {
        peaks.push(i);
      }
    }
  }

  return peaks;
}

export function findLocalTroughs(data: OHLCData[], window: number = 5): number[] {
  if (data.length < window * 2) return [];

  const troughs: number[] = [];
  const lows = data.map(d => d.low);

  // Calculate prominence threshold (25% of price range)
  const priceRange = Math.max(...lows) - Math.min(...lows);
  const minProminence = priceRange * 0.25;

  for (let i = window; i < lows.length - window; i++) {
    // Check if current point is lower than neighbors
    const isTrough =
      lows.slice(i - window, i).every(l => lows[i] <= l) &&
      lows.slice(i + 1, i + window + 1).every(l => lows[i] <= l);

    if (isTrough) {
      // Check prominence
      const leftMax = Math.max(...lows.slice(Math.max(0, i - window), i));
      const rightMax = Math.max(...lows.slice(i + 1, Math.min(lows.length, i + window + 1)));
      const prominence = Math.min(leftMax, rightMax) - lows[i];

      if (prominence >= minProminence) {
        troughs.push(i);
      }
    }
  }

  return troughs;
}

export function filterByMinimumDistance<T extends { time: number }>(
  points: T[],
  minDistanceHours: number
): T[] {
  if (points.length <= 1) return points;

  const sorted = [...points].sort((a, b) => a.time - b.time);
  const filtered: T[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const lastTime = filtered[filtered.length - 1].time;
    const currentTime = sorted[i].time;
    const hoursDiff = (currentTime - lastTime) / 3600;

    if (hoursDiff >= minDistanceHours) {
      filtered.push(sorted[i]);
    }
  }

  return filtered;
}

// DexScreener API for token statistics
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

// Jupiter API for holder count
const JUPITER_HOLDERS_API = 'https://datapi.jup.ag/v1/holders';

export async function fetchHolderCount(tokenAddress: string): Promise<number | undefined> {
  try {
    // Step 1: Try to get cached holder count first
    const cachedCount = await getCachedHolderCount(tokenAddress);
    if (cachedCount !== null) {
      return cachedCount;
    }

    // Step 2: Fetch fresh data from API
    console.log(`[API] Fetching fresh holder count for ${tokenAddress}`);
    const data = await rateLimiter.execute('jupiter', async () => {
      const response = await fetch(`${JUPITER_HOLDERS_API}/${tokenAddress}`, {
        next: { revalidate: 300 }, // Cache for 5 minutes
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return response.json();
    });

    // The API returns { count: number }
    const count = data?.count;

    // Step 3: Save to cache (async, don't wait)
    if (count !== undefined) {
      saveCachedHolderCount(tokenAddress, count).catch(err => {
        console.error('[API] Error saving holder count to cache (non-blocking):', err);
      });
    }

    return count;
  } catch (error) {
    console.error(`Error fetching holder count for token ${tokenAddress}:`, error);
    return undefined;
  }
}

export async function fetchTokenStats(poolAddress: string): Promise<TokenStats | null> {
  try {
    // Step 1: Check for cached all-time stats (MON3Y + ZERA combined)
    const cachedMon3yStats = await getCachedStats(MON3Y_TOKEN);
    const cachedZeraStats = await getCachedStats(ZERA_TOKEN);

    let allTimeVolume: number;
    let allTimeFees: number;
    let allTimeHighPrice: number;
    let allTimeHighMarketCap: number;

    // If we have cached stats for both tokens, use them
    if (cachedMon3yStats && cachedZeraStats) {
      console.log('[API] Using cached all-time stats');
      allTimeVolume = cachedMon3yStats.all_time_volume + cachedZeraStats.all_time_volume;
      allTimeFees = cachedMon3yStats.all_time_fees + cachedZeraStats.all_time_fees;
      allTimeHighPrice = Math.max(cachedMon3yStats.all_time_high_price, cachedZeraStats.all_time_high_price);
      allTimeHighMarketCap = Math.max(cachedMon3yStats.all_time_high_market_cap, cachedZeraStats.all_time_high_market_cap);
    } else {
      // Fetch all-time data for both tokens to calculate total volume
      console.log('[API] Computing all-time stats from historical data');
      const [mon3yData, zeraData] = await Promise.all([
        fetchJupiterData(MON3Y_TOKEN, 'MAX'),
        fetchJupiterData(ZERA_TOKEN, 'MAX'),
      ]);

      // Calculate all-time volume
      const mon3yVolume = mon3yData.reduce((sum, candle) => sum + candle.volume, 0);
      const zeraVolume = zeraData.reduce((sum, candle) => sum + candle.volume, 0);
      allTimeVolume = mon3yVolume + zeraVolume;

      // Calculate all-time fees (1% of total volume)
      allTimeFees = allTimeVolume * 0.01;

      // Calculate all-time high market cap and liquidity from price data
      // Using circulating supply of 1 billion tokens
      const CIRCULATING_SUPPLY = 1_000_000_000;
      const mon3yPrices = mon3yData.map(candle => candle.high);
      const zeraPrices = zeraData.map(candle => candle.high);
      const mon3yHighPrice = mon3yPrices.length > 0 ? Math.max(...mon3yPrices) : 0;
      const zeraHighPrice = zeraPrices.length > 0 ? Math.max(...zeraPrices) : 0;
      allTimeHighPrice = Math.max(mon3yHighPrice, zeraHighPrice);
      allTimeHighMarketCap = allTimeHighPrice * CIRCULATING_SUPPLY;

      // Save individual token stats to cache (async, don't wait)
      saveCachedStats({
        token_address: MON3Y_TOKEN,
        all_time_volume: mon3yVolume,
        all_time_fees: mon3yVolume * 0.01,
        all_time_high_price: mon3yHighPrice,
        all_time_high_market_cap: mon3yHighPrice * CIRCULATING_SUPPLY,
      }).catch(err => console.error('[API] Error saving MON3Y stats (non-blocking):', err));

      saveCachedStats({
        token_address: ZERA_TOKEN,
        all_time_volume: zeraVolume,
        all_time_fees: zeraVolume * 0.01,
        all_time_high_price: zeraHighPrice,
        all_time_high_market_cap: zeraHighPrice * CIRCULATING_SUPPLY,
      }).catch(err => console.error('[API] Error saving ZERA stats (non-blocking):', err));
    }

    // Step 2: Fetch current market data from DexScreener
    const data = await rateLimiter.execute('dexscreener', async () => {
      const response = await fetch(`${DEXSCREENER_API}/pairs/solana/${poolAddress}`, {
        next: { revalidate: 60 }, // Cache for 1 minute
      });

      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return response.json();
    });

    const pair = data.pair || data.pairs?.[0];

    if (!pair) {
      return null;
    }

    // Step 3: Fetch holder count (with caching)
    const holderCount = await fetchHolderCount(ZERA_TOKEN);

    // Step 4: Extract current market data
    const volume24h = parseFloat(pair.volume?.h24 || '0');
    const fees24h = volume24h * 0.01; // 1% fee on volume
    const currentLiquidity = parseFloat(pair.liquidity?.usd || '0');
    const currentMarketCap = parseFloat(pair.fdv || pair.marketCap || '0');

    // Step 5: Cache metadata (async, don't wait)
    saveCachedMetadata({
      token_address: ZERA_TOKEN,
      pool_address: poolAddress,
      token_symbol: 'ZERA',
      twitter_url: pair.info?.socials?.find((s: any) => s.type === 'twitter')?.url,
      telegram_url: pair.info?.socials?.find((s: any) => s.type === 'telegram')?.url,
      website_url: pair.info?.websites?.[0]?.url,
    }).catch(err => console.error('[API] Error saving metadata (non-blocking):', err));

    return {
      price: parseFloat(pair.priceUsd || '0'),
      priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
      volume24h,
      fees24h,
      allTimeVolume,
      allTimeFees,
      marketCap: currentMarketCap,
      allTimeHighMarketCap,
      liquidity: currentLiquidity,
      allTimeHighLiquidity: currentLiquidity, // Use current as reference since we don't have historical liquidity
      holders: holderCount,
      buyCount24h: pair.txns?.h24?.buys,
      sellCount24h: pair.txns?.h24?.sells,
      twitter: pair.info?.socials?.find((s: any) => s.type === 'twitter')?.url,
      telegram: pair.info?.socials?.find((s: any) => s.type === 'telegram')?.url,
      website: pair.info?.websites?.[0]?.url,
    };
  } catch (error) {
    console.error(`Error fetching token stats for pool ${poolAddress}:`, error);
    return null;
  }
}

// Fetch wallet balance via server-side API route to avoid CORS issues
export async function fetchWalletBalance(walletAddress: string): Promise<number> {
  try {
    const response = await fetch(`/api/wallet-balance?address=${walletAddress}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return 0;
    }

    const data = await response.json();

    if (data.error) {
      console.error('Error fetching wallet balance:', data.error);
      return 0;
    }

    return data.balance || 0;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}
