import { NextResponse } from 'next/server';
import { createHelius } from 'helius-sdk';
import type { ProjectConfig } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export interface DailyBurns {
  date: string; // ISO date string
  timestamp: number; // Unix timestamp (start of day)
  burnAmount: number; // Amount of tokens burned
  burnCount: number; // Number of burn transactions
  transactions: string[]; // Transaction signatures
}

export interface BurnsResponse {
  dailyBurns: DailyBurns[];
  totalBurned: number;
  totalTransactions: number;
  avgDailyBurns: number;
}

// Initialize Helius with API key
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '6f701558-9fd6-4d38-9159-74b7f4c958e9';
const helius = createHelius({
  apiKey: HELIUS_API_KEY,
});

/**
 * GET /api/burns/[slug]?timeframe=7D|30D|90D|ALL
 * Fetches daily token burn data for a project
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
        // Get earliest pool creation timestamp
        const earliestPool = projectConfig.pools.reduce((earliest, pool) => {
          const poolMigration = projectConfig.migrations.find(m => m.toPoolId === pool.id);
          const timestamp = poolMigration?.migrationTimestamp || 0;
          return timestamp < earliest ? timestamp : earliest;
        }, now);
        cutoffTimestamp = earliestPool;
        break;
      default:
        cutoffTimestamp = now - (30 * 24 * 60 * 60); // Default to 30D
    }

    // Get the current token address (most recent pool)
    const currentPool = projectConfig.pools[projectConfig.pools.length - 1];
    const tokenAddress = currentPool.tokenAddress;

    console.log(`Fetching burn transactions for token: ${tokenAddress} from ${new Date(cutoffTimestamp * 1000).toISOString()}`);

    // Solana burn address (incinerator)
    const BURN_ADDRESS = '1nc1nerator11111111111111111111111111111111';
    const dailyBurnsMap = new Map<number, DailyBurns>();

    try {
      // Fetch transactions for the token mint address itself
      // This will capture both burns to incinerator and token account closures
      let beforeSignature: string | undefined = undefined;
      let hasMore = true;
      let burnsFound = 0;

      // Pagination loop - fetch transactions and process burns on the fly
      let batchCount = 0;
      while (hasMore) {
        batchCount++;
        // Query the incinerator address to get only burn transactions
        const BURN_ADDRESS = '1nc1nerator11111111111111111111111111111111';
        const url = new URL(`https://api-mainnet.helius-rpc.com/v0/addresses/${BURN_ADDRESS}/transactions`);
        url.searchParams.append('api-key', HELIUS_API_KEY);
        if (beforeSignature) {
          url.searchParams.append('before', beforeSignature);
        }

        console.log(`[Batch ${batchCount}] Fetching transactions... (burns found so far: ${burnsFound})`);

        // Add delay between batches to avoid rate limits (500ms between requests)
        if (batchCount > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
          console.error('Failed to fetch burn transactions:', response.statusText);
          break;
        }

        const transactions = await response.json();
        if (!transactions || transactions.length === 0) {
          console.log(`[Batch ${batchCount}] No more transactions found`);
          hasMore = false;
          break;
        }

        const oldestTx = transactions[transactions.length - 1];
        const newestTx = transactions[0];
        console.log(`[Batch ${batchCount}] Fetched ${transactions.length} transactions, range: ${new Date(newestTx.timestamp * 1000).toISOString()} to ${new Date(oldestTx.timestamp * 1000).toISOString()}`);

        // Process transactions in this batch to find burns
        for (const tx of transactions) {
          // Skip if transaction is before cutoff
          if (tx.timestamp < cutoffTimestamp) {
            console.log(`[Batch ${batchCount}] Reached transactions before cutoff (${new Date(cutoffTimestamp * 1000).toISOString()}), stopping pagination`);
            hasMore = false;
            break;
          }

          // Look for token transfers in the transaction
          const tokenTransfers = tx.tokenTransfers || [];

          for (const transfer of tokenTransfers) {
            // Check if this is a burn of our token:
            // 1. Transfer to burn address (incinerator)
            // 2. Token account closure (empty toUserAccount)
            const isBurn = (transfer.toUserAccount === BURN_ADDRESS || transfer.toUserAccount === '' || !transfer.toUserAccount) && transfer.mint === tokenAddress;

            if (isBurn) {
              console.log('Found ZERA burn:', {
                mint: transfer.mint,
                amount: transfer.tokenAmount,
                toAccount: transfer.toUserAccount || '(account closure)',
                signature: tx.signature,
              });

              const amount = transfer.tokenAmount || 0;
              const timestamp = tx.timestamp;

              // Align to start of day (midnight UTC)
              const dayTimestamp = Math.floor(timestamp / 86400) * 86400;
              const dateStr = new Date(dayTimestamp * 1000).toISOString().split('T')[0];

              // Get or create daily entry
              if (!dailyBurnsMap.has(dayTimestamp)) {
                dailyBurnsMap.set(dayTimestamp, {
                  date: dateStr,
                  timestamp: dayTimestamp,
                  burnAmount: 0,
                  burnCount: 0,
                  transactions: [],
                });
              }

              const dayEntry = dailyBurnsMap.get(dayTimestamp)!;
              dayEntry.burnAmount += amount;
              dayEntry.burnCount += 1;
              if (!dayEntry.transactions.includes(tx.signature)) {
                dayEntry.transactions.push(tx.signature);
              }

              burnsFound++;
            }
          }
        }

        // Check if oldest transaction is before cutoff
        if (oldestTx.timestamp < cutoffTimestamp) {
          console.log(`[Batch ${batchCount}] Reached transactions before cutoff, stopping pagination`);
          hasMore = false;
        } else {
          beforeSignature = oldestTx.signature;
        }
      }

      console.log(`Pagination complete: ${batchCount} batches, found ${burnsFound} burns`);


      console.log(`Aggregated burns into ${dailyBurnsMap.size} days`);
    } catch (error) {
      console.error('Error fetching burn transactions from Helius:', error);
      // Don't throw - return empty data if API fails
    }

    // Convert to array and sort by timestamp
    const dailyBurns = Array.from(dailyBurnsMap.values())
      .sort((a, b) => a.timestamp - b.timestamp);

    // Calculate totals
    const totalBurned = dailyBurns.reduce((sum, day) => sum + day.burnAmount, 0);
    const totalTransactions = dailyBurns.reduce((sum, day) => sum + day.burnCount, 0);
    const avgDailyBurns = dailyBurns.length > 0 ? totalBurned / dailyBurns.length : 0;

    const response: BurnsResponse = {
      dailyBurns,
      totalBurned,
      totalTransactions,
      avgDailyBurns,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/burns/[slug]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
