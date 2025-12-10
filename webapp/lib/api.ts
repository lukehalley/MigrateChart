import { GeckoTerminalResponse, OHLCData, PoolData, Timeframe, TIMEFRAME_TO_JUPITER_INTERVAL, TIMEFRAME_TO_GECKOTERMINAL, TokenStats, ProjectConfig, PoolConfig } from './types';
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
import {
  aggregateCandles,
  canAggregateFromHourly,
  getSourceTimeframe,
} from './candleAggregation';

const BASE_URL = 'https://api.geckoterminal.com/api/v2';
const NETWORK = 'solana';

// Jupiter API for comprehensive historical data
const JUPITER_API = 'https://datapi.jup.ag/v2/charts';

export async function fetchPoolData(
  poolAddress: string,
  timeframe: Timeframe = '1H'
): Promise<OHLCData[]> {
  // Map timeframe to GeckoTerminal's interval format
  const geckoInterval = TIMEFRAME_TO_GECKOTERMINAL[timeframe];
  const url = `${BASE_URL}/networks/${NETWORK}/pools/${poolAddress}/ohlcv/${geckoInterval}`;

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
    let candles = ohlcvList.map(([timestamp, open, high, low, close, volume]) => ({
      time: timestamp,
      open,
      high,
      low,
      close,
      volume,
    }));

    // For 4H and 8H, we get hourly data from GeckoTerminal - filter to approximate the timeframe
    // This isn't perfect but gives users data while Jupiter is down
    if (timeframe === '4H') {
      // Take every 4th candle for 4H approximation
      candles = candles.filter((_, index) => index % 4 === 0);
    } else if (timeframe === '8H') {
      // Take every 8th candle for 8H approximation
      candles = candles.filter((_, index) => index % 8 === 0);
    }

    return candles;
  } catch (error) {
    return [];
  }
}

export async function fetchJupiterData(
  projectId: string,
  tokenAddress: string,
  timeframe: Timeframe = '1H',
  poolAddress?: string // Optional pool address for GeckoTerminal fallback
): Promise<OHLCData[]> {
  // Check if we can aggregate from 1H data instead of making an API call
  if (canAggregateFromHourly(timeframe)) {
    try {
      // Fetch 1H data (which will use cache or API)
      const hourlyData = await fetchJupiterData(projectId, tokenAddress, '1H', poolAddress);

      if (hourlyData.length > 0) {
        // Aggregate 1H candles into the target timeframe
        const aggregated = aggregateCandles(hourlyData, timeframe as '4H' | '8H' | '1D' | 'MAX');

        // Save aggregated data to cache (async, don't wait)
        if (aggregated.length > 0) {
          saveCachedOHLCData(projectId, tokenAddress, timeframe, aggregated).catch(() => {
            // Silently fail cache save
          });
        }

        return aggregated;
      }
    } catch (error) {
      // If aggregation fails, fall through to direct API fetch
      console.error(`Aggregation failed for ${timeframe}, falling back to API`, error);
    }
  }

  const now = Date.now(); // Jupiter API expects milliseconds
  const interval = TIMEFRAME_TO_JUPITER_INTERVAL[timeframe];

  try {
    // Step 1: Try to get cached data first
    const cachedData = await getCachedOHLCData(projectId, tokenAddress, timeframe);

    // Step 2: Fetch fresh data from Jupiter API
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

    // Step 2.5: If Jupiter returns empty candles and we have a poolAddress, fall back to GeckoTerminal
    if (freshCandles.length === 0 && poolAddress) {
      try {
        const geckoData = await fetchPoolData(poolAddress, timeframe);
        if (geckoData.length > 0) {
          // Merge with cached data
          const mergedGeckoData = mergeOHLCData(cachedData, geckoData);
          // Save to cache
          saveCachedOHLCData(projectId, tokenAddress, timeframe, geckoData).catch(() => {
            // Silently fail cache save
          });
          return mergedGeckoData;
        }
      } catch (geckoError) {
        // Silently fail GeckoTerminal fallback, will use cache below
      }
    }

    // Step 3: Merge cached data with fresh data
    const mergedData = mergeOHLCData(cachedData, freshCandles);

    // Step 4: Save new complete candles to cache (async, don't wait)
    if (freshCandles.length > 0) {
      saveCachedOHLCData(projectId, tokenAddress, timeframe, freshCandles).catch(() => {
        // Silently fail cache save
      });
    }

    return mergedData;
  } catch (error) {
    // If API fails, try GeckoTerminal before falling back to cache
    if (poolAddress) {
      try {
        const geckoData = await fetchPoolData(poolAddress, timeframe);
        if (geckoData.length > 0) {
          return geckoData;
        }
      } catch (geckoError) {
        // Silently fail GeckoTerminal fallback
      }
    }

    // If GeckoTerminal also fails, return cached data as final fallback
    try {
      const cachedData = await getCachedOHLCData(projectId, tokenAddress, timeframe);
      if (cachedData.length > 0) {
        return cachedData;
      }
    } catch (cacheError) {
      // Silently fail cache fallback
    }

    return [];
  }
}

export async function fetchAllPoolsData(
  projectConfig: ProjectConfig,
  timeframe: Timeframe = '1H'
): Promise<PoolData[]> {
  if (!projectConfig || !projectConfig.pools || projectConfig.pools.length === 0) {
    return [];
  }

  // Get unique token addresses from pools and find a pool address for each (use the last pool for each token)
  const uniqueTokens = Array.from(
    new Set(projectConfig.pools.map(p => p.tokenAddress))
  );

  // Create a map of token addresses to pool addresses (use the most recent pool for each token)
  const tokenToPoolMap = new Map<string, string>();
  for (const pool of projectConfig.pools) {
    tokenToPoolMap.set(pool.tokenAddress, pool.poolAddress);
  }

  // Fetch data for all unique tokens in parallel
  const tokenDataMap = new Map<string, OHLCData[]>();
  await Promise.all(
    uniqueTokens.map(async (tokenAddress) => {
      const poolAddress = tokenToPoolMap.get(tokenAddress);
      const data = await fetchJupiterData(projectConfig.id, tokenAddress, timeframe, poolAddress);
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
      // This pool ends at this migration - show data UP TO (but not including) migration
      tokenData = tokenData.filter(d => d.time < endMigration.migrationTimestamp);
    }

    if (startMigration) {
      // This pool starts at this migration - show data FROM (including) migration
      tokenData = tokenData.filter(d => d.time >= startMigration.migrationTimestamp);
    }

    result.push({
      pool_name: pool.poolName,
      pool_address: pool.poolAddress,
      token_symbol: pool.tokenSymbol,
      data: tokenData,
    });
  }

  // Add single placeholder candle at migration boundaries to anchor vertical lines
  // The placeholder uses the price from the CURRENT pool (not previous) to avoid tiny candlesticks
  for (let i = 0; i < result.length; i++) {
    const poolData = result[i];
    const pool = projectConfig.pools[i];

    // Check if this pool starts at a migration
    const startMigration = projectConfig.migrations.find(m => m.toPoolId === pool.id);
    if (startMigration) {
      // Check if a candle already exists at the migration timestamp
      const candleExistsAtMigration = poolData.data.some(d => d.time === startMigration.migrationTimestamp);

      // Only add placeholder if no candle exists at the migration timestamp
      if (!candleExistsAtMigration) {
        // Get the full unfiltered data from the CURRENT pool's token
        const currentUnfilteredData = tokenDataMap.get(pool.tokenAddress) || [];

        // Find the first candle at or after the migration timestamp
        const candlesAfterMigration = currentUnfilteredData.filter(d => d.time >= startMigration.migrationTimestamp);
        const closestCandle = candlesAfterMigration.length > 0
          ? candlesAfterMigration[0]
          : null;

        if (closestCandle) {
          // Add exactly one placeholder at the migration timestamp
          poolData.data.unshift({
            time: startMigration.migrationTimestamp,
            open: closestCandle.open,
            high: closestCandle.high,
            low: closestCandle.low,
            close: closestCandle.close,
            volume: 0,
          });
        }
      }
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
      });
    }

    return count;
  } catch (error) {
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

    // If we have all cached stats with valid values (not 0), use them
    const allCached = cachedStatsArray.every(stat =>
      stat !== null && stat.all_time_high_price > 0
    );

    console.log('[fetchTokenStats] Cache check:', {
      allCached,
      cachedCount: cachedStatsArray.filter(s => s !== null).length,
      totalTokens: uniqueTokens.length,
      cachedStats: cachedStatsArray.map(s => s ? { addr: s.token_address.slice(0, 8), price: s.all_time_high_price } : null)
    });

    if (allCached) {
      allTimeVolume = cachedStatsArray.reduce((sum, stat) => sum + (stat?.all_time_volume || 0), 0);
      allTimeFees = cachedStatsArray.reduce((sum, stat) => sum + (stat?.all_time_fees || 0), 0);
      allTimeHighPrice = Math.max(...cachedStatsArray.map(stat => stat?.all_time_high_price || 0));
      allTimeHighMarketCap = Math.max(...cachedStatsArray.map(stat => stat?.all_time_high_market_cap || 0));
    } else {
      // Fetch all-time data for all tokens to calculate totals
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
        });
      });
    }

    // Step 2: Fetch current market data from DexScreener
    console.log('[fetchTokenStats] Fetching DexScreener for pool:', poolAddress);

    const data = await rateLimiter.execute('dexscreener', async () => {
      const response = await fetch(`${DEXSCREENER_API}/pairs/solana/${poolAddress}`, {
        next: { revalidate: 60 }, // Cache for 1 minute
      });

      if (!response.ok) {
        console.log('[fetchTokenStats] DexScreener error:', response.status);
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return response.json();
    });

    console.log('[fetchTokenStats] DexScreener returned:', !!data.pair || !!data.pairs?.[0]);

    const pair = data.pair || data.pairs?.[0];

    if (!pair) {
      console.log('[fetchTokenStats] No DexScreener pair found - using cached/default values');

      // Return stats with cached all-time data but no live price
      // This happens for tokens that aren't tracked on DexScreener yet
      return {
        price: 0, // No current price available
        priceChange24h: 0,
        volume24h: 0,
        fees24h: 0,
        allTimeVolume,
        allTimeFees,
        marketCap: 0,
        allTimeHighMarketCap,
        liquidity: 0,
        allTimeHighLiquidity: 0,
        holders: 0, // Will be fetched separately if available
        buyCount24h: 0,
        sellCount24h: 0,
        twitter: undefined,
        telegram: undefined,
        website: undefined,
      };
    }

    // Step 3: Fetch holder count for current token (with caching)
    // Use the latest/current token address for holder count
    const currentPool = projectConfig.pools.find(p => p.poolAddress === poolAddress);
    // Sort pools by order_index to ensure we get the correct current token as fallback
    const sortedPools = [...projectConfig.pools].sort((a, b) => a.orderIndex - b.orderIndex);
    const currentToken = currentPool?.tokenAddress || sortedPools[sortedPools.length - 1].tokenAddress;
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
    });

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
      return 0;
    }

    const data = await response.json();

    if (data.error) {
      return 0;
    }

    return data.balance || 0;
  } catch (error) {
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
      return 0;
    }

    const data = await response.json();

    if (data.error) {
      return 0;
    }

    return data.balance || 0;
  } catch (error) {
    return 0;
  }
}
