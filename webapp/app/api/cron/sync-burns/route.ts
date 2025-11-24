import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max execution

const ZERA_MINT = '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA';
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const BITQUERY_API_KEY = process.env.BITQUERY_API_KEY;

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

    // Use Bitquery to find ALL recent burn instructions for ZERA mint
    const cutoffTime = latestBurn
      ? new Date(latestBurn.timestamp * 1000).toISOString()
      : new Date(Date.now() - 7200000).toISOString(); // Last 2 hours if no burns in DB

    const query = `
      query {
        Solana {
          Instructions(
            where: {
              Instruction: {
                Program: { Method: { in: ["burn", "burnChecked"] } }
                Accounts: { includes: { Address: { is: "${ZERA_MINT}" } } }
              }
              Transaction: { Result: { Success: true } }
              Block: { Time: { after: "${cutoffTime}" } }
            }
            limit: { count: 50 }
            orderBy: { descending: Block_Time }
          ) {
            Instruction {
              Accounts {
                Address
                Token {
                  Mint
                }
              }
            }
            Transaction {
              Signature
              Signer
            }
            Block {
              Time
            }
          }
        }
      }
    `;

    const response = await fetch('https://streaming.bitquery.io/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BITQUERY_API_KEY}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Bitquery API error: ${response.statusText}`);
    }

    const data = await response.json();
    const instructions = data?.data?.Solana?.Instructions || [];

    console.log(`[SYNC-BURNS] Bitquery returned ${instructions.length} burn instructions`);

    const newBurns: Array<{
      signature: string;
      timestamp: number;
      amount: number;
      from: string;
    }> = [];

    // Build list of signatures
    const burnSignatures = instructions.map((item: any) => item.Transaction.Signature);

    if (burnSignatures.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new burns to sync',
        scanned: 0,
        inserted: 0,
      });
    }

    // Fetch burn amounts from Helius
    if (HELIUS_API_KEY) {
      const heliusResponse = await fetch(
        `https://api.helius.xyz/v0/transactions?api-key=${HELIUS_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: burnSignatures }),
        }
      );

      if (heliusResponse.ok) {
        const transactions = await heliusResponse.json();
        instructions.forEach((item: any, idx: number) => {
          const tx = transactions[idx];
          if (tx && tx.tokenTransfers) {
            const burnTransfer = tx.tokenTransfers.find((t: any) =>
              t.mint === ZERA_MINT && (!t.toUserAccount || t.toUserAccount === '')
            );
            if (burnTransfer) {
              newBurns.push({
                signature: item.Transaction.Signature,
                timestamp: new Date(item.Block.Time).getTime() / 1000,
                amount: burnTransfer.tokenAmount,
                from: item.Transaction.Signer,
              });
            }
          }
        });
      }
    }

    console.log(`[SYNC-BURNS] Found ${newBurns.length} new burns with amounts`);

    if (newBurns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new burns to sync',
        scanned: instructions.length,
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
      scanned: instructions.length,
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
