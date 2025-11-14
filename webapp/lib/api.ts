import { GeckoTerminalResponse, OHLCData, PoolData, POOLS, Timeframe, TIMEFRAME_TO_JUPITER_INTERVAL, TokenStats, ProjectConfig, PoolConfig } from './types';
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

export async function fetchJupiterData(
  projectId: string,
  tokenAddress: string,
  timeframe: Timeframe = '1H'
): Promise<OHLCData[]> {
  const now = Date.now();
  const interval = TIMEFRAME_TO_JUPITER_INTERVAL[timeframe];

  try {
    // Step 1: Try to get cached data first
    console.log(`[API] Checking cache for ${tokenAddress} ${timeframe}`);
    const cachedData = await getCachedOHLCData(projectId, tokenAddress, timeframe);

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
    saveCachedOHLCData(projectId, tokenAddress, timeframe, freshCandles).catch(err => {
      console.error('[API] Error saving to cache (non-blocking):', err);
    });

    return mergedData;
  } catch (error) {
    console.error(`Error fetching Jupiter data:`, error);

    // If API fails, return cached data as fallback
    try {
      const cachedData = await getCachedOHLCData(projectId, tokenAddress, timeframe);
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

export async function fetchAllPoolsData(
  projectConfig: ProjectConfig,
  timeframe: Timeframe = '1H'
): Promise<PoolData[]> {
  if (!projectConfig || !projectConfig.pools || projectConfig.pools.length === 0) {
    console.error('[API] Invalid project config or no pools defined');
    return [];
  }

  // Get unique token addresses from pools
  const uniqueTokens = Array.from(
    new Set(projectConfig.pools.map(p => p.tokenAddress))
  );

  // Fetch data for all unique tokens in parallel
  const tokenDataMap = new Map<string, OHLCData[]>();
  await Promise.all(
    uniqueTokens.map(async (tokenAddress) => {
      const data = await fetchJupiterData(projectConfig.id, tokenAddress, timeframe);
      tokenDataMap.set(tokenAddress, data);
    })
  );

  // Build result array matching the pools order
  const result: PoolData[] = [];

  for (const pool of projectConfig.pools) {
    let tokenData = tokenDataMap.get(pool.tokenAddress) || [];

    // Find migration that ends this pool's active period
    const endMigration = projectConfig.migrations.find(m => m.fromPoolId === pool.id);

    // Find migration that starts this pool's active period
    const startMigration = projectConfig.migrations.find(m => m.toPoolId === pool.id);

    if (endMigration) {
      // This pool ends at this migration - show data BEFORE migration only
      tokenData = tokenData.filter(d => d.time < endMigration.migrationTimestamp);
    }

    if (startMigration) {
      // This pool starts at this migration - show data FROM migration onwards
      tokenData = tokenData.filter(d => d.time >= startMigration.migrationTimestamp);
    }

    result.push({
      pool_name: pool.poolName,
      pool_address: pool.poolAddress,
      token_symbol: pool.tokenSymbol,
      data: tokenData,
    });
  }

  // Add placeholder candles at migration points for visual markers
  if (projectConfig.migrations && projectConfig.migrations.length > 0) {
    const lastPoolData = result[result.length - 1];
    if (lastPoolData && lastPoolData.data.length > 0) {
      const dataWithMarkers = [...lastPoolData.data];

      // Add placeholder at each migration timestamp if not present
      for (const migration of projectConfig.migrations) {
        const hasMarker = dataWithMarkers.some(c => c.time === migration.migrationTimestamp);
        if (!hasMarker) {
          // Find surrounding candles to interpolate price
          const before = dataWithMarkers.find(c => c.time < migration.migrationTimestamp);
          const after = dataWithMarkers.find(c => c.time > migration.migrationTimestamp);
          const price = before?.close || after?.open || 0;

          if (price > 0) {
            dataWithMarkers.push({
              time: migration.migrationTimestamp,
              open: price,
              high: price,
              low: price,
              close: price,
              volume: 0,
            });
          }
        }
      }

      lastPoolData.data = dataWithMarkers.sort((a, b) => a.time - b.time);
    }
  }

  return result;
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

export async function fetchHolderCount(
  projectId: string,
  tokenAddress: string
): Promise<number | undefined> {
  try {
    // Step 1: Try to get cached holder count first
    const cachedCount = await getCachedHolderCount(projectId, tokenAddress);
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
      saveCachedHolderCount(projectId, tokenAddress, count).catch(err => {
        console.error('[API] Error saving holder count to cache (non-blocking):', err);
      });
    }

    return count;
  } catch (error) {
    console.error(`Error fetching holder count for token ${tokenAddress}:`, error);
    return undefined;
  }
}

export async function fetchTokenStats(
  projectConfig: ProjectConfig,
  poolAddress: string
): Promise<TokenStats | null> {
  try {
    // Step 1: Check for cached all-time stats for all project tokens
    const uniqueTokens = Array.from(new Set(projectConfig.pools.map(p => p.tokenAddress)));
    const cachedStatsPromises = uniqueTokens.map(token => getCachedStats(projectConfig.id, token));
    const cachedStatsArray = await Promise.all(cachedStatsPromises);

    let allTimeVolume: number;
    let allTimeFees: number;
    let allTimeHighPrice: number;
    let allTimeHighMarketCap: number;

    // If we have all cached stats, use them
    const allCached = cachedStatsArray.every(stat => stat !== null);
    if (allCached) {
      console.log('[API] Using cached all-time stats');
      allTimeVolume = cachedStatsArray.reduce((sum, stat) => sum + (stat?.all_time_volume || 0), 0);
      allTimeFees = cachedStatsArray.reduce((sum, stat) => sum + (stat?.all_time_fees || 0), 0);
      allTimeHighPrice = Math.max(...cachedStatsArray.map(stat => stat?.all_time_high_price || 0));
      allTimeHighMarketCap = Math.max(...cachedStatsArray.map(stat => stat?.all_time_high_market_cap || 0));
    } else {
      // Fetch all-time data for all tokens to calculate totals
      console.log('[API] Computing all-time stats from historical data');
      const tokenDataPromises = uniqueTokens.map(token => fetchJupiterData(projectConfig.id, token, 'MAX'));
      const tokenDataArray = await Promise.all(tokenDataPromises);

      const CIRCULATING_SUPPLY = 1_000_000_000; // Default 1B, could be made configurable per project

      // Calculate stats for each token/pool
      const tokenStats = uniqueTokens.map((token, idx) => {
        const data = tokenDataArray[idx];
        const volume = data.reduce((sum, candle) => sum + candle.volume, 0);
        const prices = data.map(candle => candle.high);
        const highPrice = prices.length > 0 ? Math.max(...prices) : 0;

        // Calculate fees based on pool configuration
        // Find all pools with this token and check which ones have fees
        let fees = 0;
        const poolsWithToken = projectConfig.pools.filter(p => p.tokenAddress === token);

        for (const pool of poolsWithToken) {
          if (pool.feeRate > 0) {
            // Find when this pool started collecting fees
            const poolStartMigration = projectConfig.migrations.find(m => m.toPoolId === pool.id);
            const feeStartTimestamp = poolStartMigration?.migrationTimestamp || 0;

            // Only count volume from when fees started being collected
            if (feeStartTimestamp > 0) {
              const feeEligibleData = data.filter(d => d.time >= feeStartTimestamp);
              const feeVolume = feeEligibleData.reduce((sum, candle) => sum + candle.volume, 0);
              fees += feeVolume * pool.feeRate;
            }
          }
        }

        return {
          token_address: token,
          volume,
          fees,
          highPrice,
          highMarketCap: highPrice * CIRCULATING_SUPPLY,
        };
      });

      // Aggregate stats
      allTimeVolume = tokenStats.reduce((sum, stat) => sum + stat.volume, 0);
      allTimeFees = tokenStats.reduce((sum, stat) => sum + stat.fees, 0);
      allTimeHighPrice = Math.max(...tokenStats.map(stat => stat.highPrice));
      allTimeHighMarketCap = Math.max(...tokenStats.map(stat => stat.highMarketCap));

      // Save individual token stats to cache (async, don't wait)
      tokenStats.forEach((stat, idx) => {
        saveCachedStats({
          project_id: projectConfig.id,
          token_address: stat.token_address,
          all_time_volume: stat.volume,
          all_time_fees: stat.fees,
          all_time_high_price: stat.highPrice,
          all_time_high_market_cap: stat.highMarketCap,
        }).catch(err => console.error(`[API] Error saving ${stat.token_address} stats (non-blocking):`, err));
      });
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

    // Step 3: Fetch holder count for current token (with caching)
    // Use the latest/current token address for holder count
    const currentPool = projectConfig.pools.find(p => p.poolAddress === poolAddress);
    const currentToken = currentPool?.tokenAddress || projectConfig.pools[projectConfig.pools.length - 1].tokenAddress;
    const holderCount = await fetchHolderCount(projectConfig.id, currentToken);

    // Step 4: Extract current market data
    const volume24h = parseFloat(pair.volume?.h24 || '0');
    const fees24h = volume24h * 0.01; // 1% fee on volume
    const currentLiquidity = parseFloat(pair.liquidity?.usd || '0');
    const currentMarketCap = parseFloat(pair.fdv || pair.marketCap || '0');

    // Step 5: Cache metadata (async, don't wait)
    saveCachedMetadata({
      project_id: projectConfig.id,
      token_address: currentToken,
      pool_address: poolAddress,
      token_symbol: currentPool?.tokenSymbol || projectConfig.name,
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

// Fetch token balance via server-side API route to avoid CORS issues
export async function fetchTokenBalance(walletAddress: string, tokenMint: string): Promise<number> {
  try {
    const response = await fetch(`/api/token-balance?address=${walletAddress}&mint=${tokenMint}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return 0;
    }

    const data = await response.json();

    if (data.error) {
      console.error('Error fetching token balance:', data.error);
      return 0;
    }

    return data.balance || 0;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}
