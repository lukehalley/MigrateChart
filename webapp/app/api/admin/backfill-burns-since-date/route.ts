import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC = HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : 'https://api.mainnet-beta.solana.com';

/**
 * Admin endpoint to backfill burn transactions since a specific date
 * This fetches ALL transactions since the specified timestamp
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

    // Get cutoff date from query params (default: Dec 1, 2025 UTC)
    const { searchParams } = new URL(request.url);
    const cutoffDateStr = searchParams.get('since') || '2025-12-01T00:00:00Z';
    const cutoffTimestamp = Math.floor(new Date(cutoffDateStr).getTime() / 1000);

    console.log(`[BACKFILL-BURNS] Backfilling burns since ${cutoffDateStr} (timestamp: ${cutoffTimestamp})`);

    // Get projects with burns enabled and program address(es)
    const { data: projects, error: projectError } = await supabase!
      .from('projects')
      .select('id, slug, burn_program_address, burn_program_addresses, token_decimals')
      .eq('burns_enabled', true);

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

    console.log(`[BACKFILL-BURNS] Found ${projects.length} projects with burns enabled`);

    let totalSynced = 0;
    const connection = new Connection(HELIUS_RPC, 'confirmed');

    for (const project of projects) {
      console.log(`[BACKFILL-BURNS] Processing ${project.slug}...`);

      // Get burn program addresses (support both new array format and legacy single address)
      const burnAddresses = project.burn_program_addresses ||
                            (project.burn_program_address ? [project.burn_program_address] : []);

      if (burnAddresses.length === 0) {
        console.log(`[BACKFILL-BURNS] No burn addresses configured for ${project.slug}, skipping`);
        continue;
      }

      console.log(`[BACKFILL-BURNS] Checking ${burnAddresses.length} burn address(es) for ${project.slug}`);

      // Process each burn program address
      for (const burnAddress of burnAddresses) {
        console.log(`[BACKFILL-BURNS] Processing address ${burnAddress} for ${project.slug}...`);

        const programPubkey = new PublicKey(burnAddress);
        let allSignatures: any[] = [];
        let before: string | undefined = undefined;
        let hasMore = true;

        // Fetch ALL signatures since cutoff date (paginate through all)
        while (hasMore) {
          const signatures = await connection.getSignaturesForAddress(programPubkey, {
            limit: 1000,
            before,
          });

          if (signatures.length === 0) {
            hasMore = false;
            break;
          }

          // Filter signatures that are after cutoff
          const filteredSigs = signatures.filter(sig =>
            sig.blockTime && sig.blockTime >= cutoffTimestamp
          );

          allSignatures.push(...filteredSigs);

          // If we got signatures before our cutoff, we're done
          if (filteredSigs.length < signatures.length) {
            hasMore = false;
            break;
          }

          // Continue pagination
          before = signatures[signatures.length - 1].signature;
          console.log(`[BACKFILL-BURNS] Fetched ${allSignatures.length} signatures so far for ${burnAddress}...`);
        }

        console.log(`[BACKFILL-BURNS] Found ${allSignatures.length} total signatures for ${burnAddress} since ${cutoffDateStr}`);

        // Fetch full transaction details in batches
        const batchSize = 10;
        const newBurns: Array<{
          signature: string;
          timestamp: number;
          amount: number;
          from: string;
        }> = [];

        for (let i = 0; i < allSignatures.length; i += batchSize) {
          const batch = allSignatures.slice(i, i + batchSize);
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

                      // Convert raw amount to human-readable by dividing by 10^decimals
                      const rawAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
                      const humanReadableAmount = rawAmount / Math.pow(10, project.token_decimals);

                      newBurns.push({
                        signature: sig.signature,
                        timestamp: sig.blockTime || Math.floor(Date.now() / 1000),
                        amount: humanReadableAmount,
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

          if ((i + batchSize) % 100 === 0) {
            console.log(`[BACKFILL-BURNS] Processed ${Math.min(i + batchSize, allSignatures.length)}/${allSignatures.length} transactions for ${burnAddress}`);
          }
        }

        console.log(`[BACKFILL-BURNS] Found ${newBurns.length} new burns for ${project.slug} from ${burnAddress}`);

        // Insert new burns (skip duplicates)
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
              console.error(`[BACKFILL-BURNS] Error inserting burn:`, error);
            }
          } else {
            inserted++;
          }
        }

        console.log(`[BACKFILL-BURNS] Inserted ${inserted} new burns for ${project.slug} from address ${burnAddress}`);
        totalSynced += inserted;
      }
    }

    return NextResponse.json({
      success: true,
      projects: projects.length,
      synced: totalSynced,
      since: cutoffDateStr,
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
