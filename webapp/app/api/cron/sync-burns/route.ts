import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max execution

const ZERA_MINT = '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA';
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const BURN_WALLET = 'CPpFuUbudkRjavR41v1oXjqyjRKcvnr6Aesy7BhExBF5'; // ZERA dev wallet doing burns

/**
 * Cron job endpoint to sync new burn transactions
 * This should be triggered by Vercel Cron every hour
 *
 * Vercel Cron authentication uses the Authorization header with a cron secret
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the cron secret for security
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

    // Get ZERA project
    const { data: project } = await supabase!
      .from('projects')
      .select('id, slug')
      .eq('slug', 'zera')
      .eq('burns_enabled', true)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'No projects with burns enabled' },
        { status: 404 }
      );
    }

    // Get the most recent burn signature from our database
    const { data: latestBurn } = await supabase!
      .from('burn_transactions')
      .select('signature, timestamp')
      .eq('project_id', project.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    console.log(`[SYNC-BURNS] Latest burn in DB:`, latestBurn?.signature || 'none');

    // Fetch recent transactions from burn wallet (not mint address)
    // Only need to check recent batches since we're syncing hourly
    const url: string = `https://api.helius.xyz/v0/addresses/${BURN_WALLET}/transactions?api-key=${HELIUS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.statusText}`);
    }

    const transactions = await response.json();
    const newBurns: Array<{
      signature: string;
      timestamp: number;
      amount: number;
      from: string;
    }> = [];

    // Process transactions
    for (const tx of transactions) {
      // Stop if we've reached a transaction we already have
      if (latestBurn && tx.signature === latestBurn.signature) {
        console.log('[SYNC-BURNS] Reached already-synced transaction');
        break;
      }

      if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
        const burnTransfer = tx.tokenTransfers.find((t: any) =>
          t.mint === ZERA_MINT && (!t.toUserAccount || t.toUserAccount === '')
        );

        if (burnTransfer && burnTransfer.tokenAmount) {
          newBurns.push({
            signature: tx.signature,
            timestamp: tx.timestamp,
            amount: burnTransfer.tokenAmount,
            from: burnTransfer.fromUserAccount || 'Unknown',
          });
        }
      }
    }

    console.log(`[SYNC-BURNS] Found ${newBurns.length} new burns`);

    if (newBurns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new burns to sync',
        scanned: transactions.length,
        inserted: 0,
      });
    }

    // Insert new burns
    let inserted = 0;
    for (const burn of newBurns) {
      const { error } = await supabase!
        .from('burn_transactions')
        .insert({
          project_id: project.id,
          signature: burn.signature,
          timestamp: burn.timestamp,
          amount: burn.amount,
          from_account: burn.from,
        });

      if (error) {
        if (error.code !== '23505') {
          // Not a duplicate error
          console.error(`[SYNC-BURNS] Error inserting burn:`, error);
        }
      } else {
        inserted++;
      }
    }

    return NextResponse.json({
      success: true,
      scanned: transactions.length,
      found: newBurns.length,
      inserted,
    });
  } catch (error) {
    console.error('[SYNC-BURNS] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
