import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

const ZERA_MINT = '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA';
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const BURN_WALLET = 'CPpFuUbudkRjavR41v1oXjqyjRKcvnr6Aesy7BhExBF5'; // ZERA dev wallet doing burns
const NOV_18_2025 = 1763366400; // Nov 18, 2025 00:00:00 UTC - only track burns from this date onwards

/**
 * Admin endpoint to backfill historical burn transactions
 * This scans Helius transaction history and stores burns in the database
 *
 * Authentication: Uses CRON_SECRET for security
 *
 * Query params:
 * - maxFetches: Number of pagination batches to fetch (default: 100)
 * - projectId: Optional specific project ID (defaults to ZERA)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    if (!HELIUS_API_KEY) {
      return NextResponse.json(
        { error: 'Helius API key not configured' },
        { status: 500 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const maxFetches = parseInt(searchParams.get('maxFetches') || '100');
    const projectIdParam = searchParams.get('projectId');

    // Get ZERA project ID
    const { data: project } = await supabase!
      .from('projects')
      .select('id, slug')
      .eq('slug', 'zera')
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'ZERA project not found' },
        { status: 404 }
      );
    }

    const projectId = projectIdParam || project.id;

    // Fetch burns from Helius with pagination
    const burns: Array<{
      signature: string;
      timestamp: number;
      amount: number;
      from: string;
    }> = [];

    let beforeSignature: string | null = null;
    let fetchCount = 0;
    let totalTransactions = 0;

    console.log(`[BACKFILL-BURNS] Starting burn backfill for project ${project.slug} from wallet ${BURN_WALLET}`);

    while (fetchCount < maxFetches) {
      // Query by burn wallet address instead of mint address
      const url = beforeSignature
        ? `https://api.helius.xyz/v0/addresses/${BURN_WALLET}/transactions?api-key=${HELIUS_API_KEY}&before=${beforeSignature}`
        : `https://api.helius.xyz/v0/addresses/${BURN_WALLET}/transactions?api-key=${HELIUS_API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`[BACKFILL-BURNS] Helius API error: ${response.statusText}`);
        break;
      }

      const transactions = await response.json();

      if (!transactions || transactions.length === 0) {
        console.log('[BACKFILL-BURNS] No more transactions');
        break;
      }

      totalTransactions += transactions.length;
      console.log(`[BACKFILL-BURNS] Batch ${fetchCount + 1}: ${transactions.length} transactions (total: ${totalTransactions})`);

      // Filter for burn transactions (ZERA only, from Nov 18 onwards)
      for (const tx of transactions) {
        // Skip transactions before Nov 18, 2025
        if (tx.timestamp < NOV_18_2025) {
          console.log(`[BACKFILL-BURNS] Reached transactions before Nov 18, stopping`);
          fetchCount = maxFetches; // Stop pagination
          break;
        }

        if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
          const burnTransfer = tx.tokenTransfers.find((t: any) =>
            t.mint === ZERA_MINT && (!t.toUserAccount || t.toUserAccount === '')
          );

          if (burnTransfer && burnTransfer.tokenAmount) {
            burns.push({
              signature: tx.signature,
              timestamp: tx.timestamp,
              amount: burnTransfer.tokenAmount,
              from: burnTransfer.fromUserAccount || BURN_WALLET,
            });
          }
        }
      }

      beforeSignature = transactions[transactions.length - 1].signature;
      fetchCount++;

      // Add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[BACKFILL-BURNS] Found ${burns.length} total burns`);

    if (burns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No burns found',
        scanned: totalTransactions,
        inserted: 0,
        skipped: 0,
      });
    }

    // Insert burns into database (ignore duplicates)
    let inserted = 0;
    let skipped = 0;

    for (const burn of burns) {
      const { error } = await supabase!
        .from('burn_transactions')
        .insert({
          project_id: projectId,
          signature: burn.signature,
          timestamp: burn.timestamp,
          amount: burn.amount,
          from_account: burn.from,
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          // Duplicate signature
          skipped++;
        } else {
          console.error(`[BACKFILL-BURNS] Error inserting burn ${burn.signature}:`, error);
        }
      } else {
        inserted++;
      }
    }

    return NextResponse.json({
      success: true,
      scanned: totalTransactions,
      found: burns.length,
      inserted,
      skipped,
      fetches: fetchCount,
    });
  } catch (error) {
    console.error('[BACKFILL-BURNS] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
