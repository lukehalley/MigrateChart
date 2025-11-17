import { NextResponse } from 'next/server';
import { fetchJupiterData } from '@/lib/api';
import type { ProjectConfig } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export interface DailyFees {
  date: string; // ISO date string
  timestamp: number; // Unix timestamp
  fees: number; // Fees collected in USD
  volume: number; // Volume in USD
  poolName?: string;
}

export interface FeesResponse {
  dailyFees: DailyFees[];
  totalFees: number;
  avgDailyFees: number;
}

/**
 * GET /api/fees/[slug]?timeframe=7D|30D|90D|ALL
 * Fetches daily fees data for a project
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const timeframeParam = searchParams.get('timeframe') || '30D';

    // Fetch project config
    const projectResponse = await fetch(`${request.url.split('/api')[0]}/api/projects/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!projectResponse.ok) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const projectConfig: ProjectConfig = await projectResponse.json();

    // Calculate cutoff timestamp based on timeframe
    const now = Math.floor(Date.now() / 1000);
    let cutoffTimestamp = 0;

    switch (timeframeParam) {
      case '7D':
        cutoffTimestamp = now - (7 * 24 * 60 * 60);
        break;
      case '30D':
        cutoffTimestamp = now - (30 * 24 * 60 * 60);
        break;
      case '90D':
        cutoffTimestamp = now - (90 * 24 * 60 * 60);
        break;
      case 'ALL':
        cutoffTimestamp = 0;
        break;
      default:
        cutoffTimestamp = now - (30 * 24 * 60 * 60); // Default to 30D
    }

    // Get unique token addresses
    const uniqueTokens = Array.from(new Set(projectConfig.pools.map(p => p.tokenAddress)));

    // Fetch 1D candle data for all tokens
    const tokenDataPromises = uniqueTokens.map(async (tokenAddress) => {
      const data = await fetchJupiterData(projectConfig.id, tokenAddress, '1D');
      return { tokenAddress, data };
    });

    const tokenDataArray = await Promise.all(tokenDataPromises);
    const tokenDataMap = new Map(tokenDataArray.map(({ tokenAddress, data }) => [tokenAddress, data]));

    // Calculate daily fees for each pool
    const dailyFeesMap = new Map<number, DailyFees>();

    for (const pool of projectConfig.pools) {
      const tokenData = tokenDataMap.get(pool.tokenAddress) || [];

      if (pool.feeRate <= 0) {
        continue; // Skip pools with no fees
      }

      // Find when this pool started collecting fees
      const poolStartMigration = projectConfig.migrations.find(m => m.toPoolId === pool.id);
      const feeStartTimestamp = poolStartMigration?.migrationTimestamp || 0;

      // Find when this pool ended (if applicable)
      const poolEndMigration = projectConfig.migrations.find(m => m.fromPoolId === pool.id);
      const feeEndTimestamp = poolEndMigration?.migrationTimestamp || Number.MAX_SAFE_INTEGER;

      // Filter candles to pool's active period and requested timeframe
      const eligibleCandles = tokenData.filter(candle =>
        candle.time >= feeStartTimestamp &&
        candle.time < feeEndTimestamp &&
        candle.time >= cutoffTimestamp
      );

      // Aggregate fees by day
      for (const candle of eligibleCandles) {
        const fees = candle.volume * pool.feeRate;

        if (dailyFeesMap.has(candle.time)) {
          const existing = dailyFeesMap.get(candle.time)!;
          existing.fees += fees;
          existing.volume += candle.volume;
        } else {
          dailyFeesMap.set(candle.time, {
            date: new Date(candle.time * 1000).toISOString().split('T')[0],
            timestamp: candle.time,
            fees,
            volume: candle.volume,
            poolName: pool.poolName,
          });
        }
      }
    }

    // Convert to array and sort by timestamp
    const dailyFees = Array.from(dailyFeesMap.values())
      .sort((a, b) => a.timestamp - b.timestamp);

    // Calculate totals
    const totalFees = dailyFees.reduce((sum, day) => sum + day.fees, 0);
    const avgDailyFees = dailyFees.length > 0 ? totalFees / dailyFees.length : 0;

    const response: FeesResponse = {
      dailyFees,
      totalFees,
      avgDailyFees,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/fees/[slug]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
