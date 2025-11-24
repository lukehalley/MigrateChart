import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max execution

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC = HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : 'https://api.mainnet-beta.solana.com';

/**
 * Cron job endpoint to sync new burn transactions
 * This should be triggered by Vercel Cron every hour
 *
 * Fetches transactions from the burn program address and detects burns in inner instructions
 * No longer relies on Bitquery or specific wallet tracking
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

    // Get projects with burns enabled and program address
    const { data: projects, error: projectError } = await supabase!
      .from('projects')
      .select('id, slug, burn_program_address')
      .eq('burns_enabled', true)
      .not('burn_program_address', 'is', null);

    if (projectError) {
      throw new Error(`Failed to fetch projects: ${projectError.message}`);
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No projects with burns enabled',
        synced: 0,
      });
    }

    console.log(`[SYNC-BURNS] Found ${projects.length} projects with burns enabled`);

    let totalSynced = 0;

    for (const project of projects) {
      console.log(`[SYNC-BURNS] Processing ${project.slug}...`);

      // Get the most recent burn signature from our database
      const { data: latestBurn } = await supabase!
        .from('burn_transactions')
        .select('signature, timestamp')
        .eq('project_id', project.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      console.log(`[SYNC-BURNS] Latest burn in DB for ${project.slug}:`, latestBurn?.signature || 'none');

      // Fetch recent transactions from the program
      const connection = new Connection(HELIUS_RPC, 'confirmed');
      const programPubkey = new PublicKey(project.burn_program_address);

      // Get recent signatures (limit to 100 to avoid rate limits in hourly sync)
      const signatures = await connection.getSignaturesForAddress(programPubkey, {
        limit: 100,
      });

      console.log(`[SYNC-BURNS] Found ${signatures.length} signatures for ${project.slug}`);

      // Stop at the latest burn we already have
      let newSignatures = signatures;
      if (latestBurn) {
        const latestIndex = signatures.findIndex(sig => sig.signature === latestBurn.signature);
        if (latestIndex > 0) {
          newSignatures = signatures.slice(0, latestIndex);
        } else if (latestIndex === 0) {
          console.log(`[SYNC-BURNS] No new transactions for ${project.slug}`);
          continue;
        }
      }

      console.log(`[SYNC-BURNS] Processing ${newSignatures.length} new signatures for ${project.slug}`);

      // Fetch full transaction details in batches
      const batchSize = 10;
      const newBurns: Array<{
        signature: string;
        timestamp: number;
        amount: number;
        from: string;
      }> = [];

      for (let i = 0; i < newSignatures.length; i += batchSize) {
        const batch = newSignatures.slice(i, i + batchSize);
        const txPromises = batch.map((sig) =>
          connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          })
        );

        const txResults = await Promise.all(txPromises);

        for (let j = 0; j < txResults.length; j++) {
          const tx = txResults[j];
          const sig = batch[j];

          if (!tx || !tx.meta || !tx.transaction) continue;

          // Skip failed transactions - only process successful ones
          if (tx.meta.err !== null) {
            console.log(`[SYNC-BURNS] Skipping failed transaction: ${sig.signature}`);
            continue;
          }

          // Check inner instructions for burns
          if (tx.meta.innerInstructions) {
            for (const innerIxGroup of tx.meta.innerInstructions) {
              for (const ix of innerIxGroup.instructions) {
                if ('parsed' in ix) {
                  const parsed = ix.parsed;

                  // Check for token burn instruction
                  if (parsed.type === 'burn' || parsed.type === 'burnChecked') {
                    const amount = parsed.info.amount;
                    const authority = parsed.info.authority;

                    newBurns.push({
                      signature: sig.signature,
                      timestamp: sig.blockTime || Math.floor(Date.now() / 1000),
                      amount: typeof amount === 'string' ? parseFloat(amount) : amount,
                      from: authority,
                    });

                    // Only count first burn per transaction
                    break;
                  }
                }
              }
            }
          }
        }

        console.log(`[SYNC-BURNS] Processed ${Math.min(i + batchSize, newSignatures.length)}/${newSignatures.length} transactions for ${project.slug}`);
      }

      console.log(`[SYNC-BURNS] Found ${newBurns.length} new burns for ${project.slug}`);

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

      console.log(`[SYNC-BURNS] Inserted ${inserted} new burns for ${project.slug}`);
      totalSynced += inserted;
    }

    return NextResponse.json({
      success: true,
      projects: projects.length,
      synced: totalSynced,
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
