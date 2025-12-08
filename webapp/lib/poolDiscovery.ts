/**
 * Pool Discovery Service
 *
 * Discovers actual liquidity pool addresses for tokens on Solana DEXs
 * Uses DexScreener and Jupiter APIs to find the best pools
 */

import { Connection, PublicKey } from '@solana/web3.js';

export interface DiscoveredPool {
  poolAddress: string;
  dexType: 'raydium' | 'meteora' | 'orca' | 'pump_fun' | 'unknown';
  liquidity: number;
  volume24h: number;
  priceUsd: number;
}

/**
 * Find the best liquidity pool for a token
 * Prefers: Raydium > Meteora > Orca
 */
export async function discoverBestPool(tokenAddress: string): Promise<DiscoveredPool | null> {
  try {
    // Try DexScreener first (most reliable for pool discovery)
    const dexScreenerPools = await fetchFromDexScreener(tokenAddress);

    if (dexScreenerPools.length > 0) {
      // Filter for preferred DEXs and sort by liquidity
      const preferred = dexScreenerPools
        .filter(p => ['raydium', 'meteora', 'orca'].includes(p.dexType))
        .sort((a, b) => b.liquidity - a.liquidity);

      if (preferred.length > 0) {
        return preferred[0];
      }

      // Fallback to highest liquidity pool
      return dexScreenerPools[0];
    }

    // Try Jupiter as fallback
    const jupiterPool = await fetchFromJupiter(tokenAddress);
    if (jupiterPool) {
      return jupiterPool;
    }

    return null;
  } catch (error) {
    console.error('Pool discovery failed:', error);
    return null;
  }
}

/**
 * Fetch pools from DexScreener API
 */
async function fetchFromDexScreener(tokenAddress: string): Promise<DiscoveredPool[]> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return [];
    }

    // Map pairs to DiscoveredPool format
    return data.pairs
      .filter((pair: any) => pair.chainId === 'solana')
      .map((pair: any) => ({
        poolAddress: pair.pairAddress,
        dexType: normalizeDexType(pair.dexId),
        liquidity: parseFloat(pair.liquidity?.usd || '0'),
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        priceUsd: parseFloat(pair.priceUsd || '0')
      }))
      .filter((pool: DiscoveredPool) => pool.liquidity > 0) // Only pools with liquidity
      .sort((a: DiscoveredPool, b: DiscoveredPool) => b.liquidity - a.liquidity); // Sort by liquidity descending
  } catch (error) {
    console.error('DexScreener fetch error:', error);
    return [];
  }
}

/**
 * Fetch pool info from Jupiter (fallback)
 */
async function fetchFromJupiter(tokenAddress: string): Promise<DiscoveredPool | null> {
  try {
    // Jupiter doesn't have a direct pool discovery endpoint
    // We'd need to use their quote API and infer pools from routes
    // For now, return null and rely on DexScreener
    return null;
  } catch (error) {
    console.error('Jupiter fetch error:', error);
    return null;
  }
}

/**
 * Normalize DEX identifiers to our standard types
 */
function normalizeDexType(dexId: string): DiscoveredPool['dexType'] {
  const normalized = dexId.toLowerCase();

  if (normalized.includes('raydium')) return 'raydium';
  if (normalized.includes('meteora')) return 'meteora';
  if (normalized.includes('orca')) return 'orca';
  if (normalized.includes('pump')) return 'pump_fun';

  return 'unknown';
}

/**
 * Validate that a pool exists and has data
 */
export async function validatePool(poolAddress: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/solana/${poolAddress}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) return false;

    const data = await response.json();
    return data.pair && parseFloat(data.pair.liquidity?.usd || '0') > 0;
  } catch (error) {
    console.error('Pool validation error:', error);
    return false;
  }
}

/**
 * Find all significant pools for a token (for multi-pool tracking)
 */
export async function discoverAllPools(tokenAddress: string, minLiquidity: number = 1000): Promise<DiscoveredPool[]> {
  const pools = await fetchFromDexScreener(tokenAddress);
  return pools.filter(p => p.liquidity >= minLiquidity);
}
