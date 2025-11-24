import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

const ZERA_MINT = '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA';
const BITQUERY_API_KEY = process.env.BITQUERY_API_KEY;
const NOV_18_2025 = 1763366400; // Nov 18, 2025 00:00:00 UTC - only track burns from this date onwards

/**
 * Admin endpoint to backfill historical burn transactions
 * Uses Bitquery to find ALL burn instructions for ZERA mint (not just one wallet)
 *
 * Authentication: Uses CRON_SECRET for security
 *
 * Query params:
 * - limit: Number of burn instructions to fetch (default: 1000)
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
    const limit = parseInt(searchParams.get('limit') || '1000');
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

    console.log(`[BACKFILL-BURNS] Starting burn backfill for project ${project.slug} using Bitquery`);

    // Use Bitquery to find ALL burn instructions for ZERA mint
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
            }
            limit: { count: ${limit} }
            orderBy: { descending: Block_Time }
          ) {
            Instruction {
              Accounts {
                Address
                Token {
                  Mint
                  Owner
                }
              }
              Data
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

    console.log(`[BACKFILL-BURNS] Bitquery returned ${instructions.length} burn instructions`);

    const burns: Array<{
      signature: string;
      timestamp: number;
      amount: number;
      from: string;
    }> = [];

    // Process each burn instruction
    for (const item of instructions) {
      const timestamp = new Date(item.Block.Time).getTime() / 1000;

      // Only include burns from Nov 18 onwards
      if (timestamp < NOV_18_2025) {
        continue;
      }

      // Parse burn amount from instruction data (hex encoded)
      // First account is the token account being burned
      const burnAccount = item.Instruction.Accounts[0];
      const signer = item.Transaction.Signer;

      // Decode amount from instruction data if available
      // For now, we'll need to fetch full transaction details from Helius
      // to get the actual burn amount
      burns.push({
        signature: item.Transaction.Signature,
        timestamp,
        amount: 0, // Will be filled by Helius lookup
        from: signer,
      });
    }

    console.log(`[BACKFILL-BURNS] Found ${burns.length} burns from Nov 18 onwards`);

    if (burns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No burns found',
        scanned: instructions.length,
        inserted: 0,
        skipped: 0,
      });
    }

    // Fetch burn amounts from Helius in batches
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    if (HELIUS_API_KEY) {
      const batchSize = 100;
      for (let i = 0; i < burns.length; i += batchSize) {
        const batch = burns.slice(i, i + batchSize);
        const signatures = batch.map(b => b.signature);

        const heliusResponse = await fetch(
          `https://api.helius.xyz/v0/transactions?api-key=${HELIUS_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactions: signatures }),
          }
        );

        if (heliusResponse.ok) {
          const transactions = await heliusResponse.json();
          transactions.forEach((tx: any, idx: number) => {
            if (tx.tokenTransfers) {
              const burnTransfer = tx.tokenTransfers.find((t: any) =>
                t.mint === ZERA_MINT && (!t.toUserAccount || t.toUserAccount === '')
              );
              if (burnTransfer && batch[idx]) {
                batch[idx].amount = burnTransfer.tokenAmount;
              }
            }
          });
        }

        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit
      }
    }

    // Insert burns into database (ignore duplicates)
    let inserted = 0;
    let skipped = 0;

    for (const burn of burns) {
      // Skip burns with no amount data
      if (burn.amount === 0) {
        skipped++;
        continue;
      }

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
      scanned: instructions.length,
      found: burns.length,
      inserted,
      skipped,
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
