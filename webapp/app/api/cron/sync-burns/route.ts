import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

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
 * NEW APPROACH: Queries the TOKEN MINT address to find ALL burn transactions
 * regardless of which wallet performed the burn (fixes issue where burns from
 * depositor addresses were being missed)
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

    // Get projects with burns enabled - now using token_mint_address
    const { data: projects, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, slug, token_mint_address, token_decimals')
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

    console.log(`[SYNC-BURNS] Found ${projects.length} projects with burns enabled`);

    let totalSynced = 0;

    for (const project of projects) {
      console.log(`[SYNC-BURNS] Processing ${project.slug}...`);

      // Use token mint address to track ALL burns for this token
      const tokenMintAddress = project.token_mint_address;

      if (!tokenMintAddress) {
        console.log(`[SYNC-BURNS] No token_mint_address configured for ${project.slug}, skipping`);
        continue;
      }

      console.log(`[SYNC-BURNS] Tracking burns for token mint: ${tokenMintAddress}`);

      // Get the most recent burn timestamp from our database
      const { data: latestBurn } = await supabaseAdmin
        .from('burn_transactions')
        .select('signature, timestamp')
        .eq('project_id', project.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      console.log(`[SYNC-BURNS] Latest burn in DB for ${project.slug}:`, latestBurn?.signature || 'none');

      // Fetch recent transactions involving the token mint
      const connection = new Connection(HELIUS_RPC, 'confirmed');
      const mintPubkey = new PublicKey(tokenMintAddress);

      // Get recent signatures for the token mint (limit to 200 for hourly sync)
      const signatures = await connection.getSignaturesForAddress(mintPubkey, {
        limit: 200,
      });

      console.log(`[SYNC-BURNS] Found ${signatures.length} signatures for token mint ${project.slug}`);

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

      // Fetch full transaction details in batches and look for burns
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
            continue;
          }

          // Check ALL instructions (both top-level and inner) for burns
          const allInstructions: any[] = [];

          // Add top-level instructions
          if (tx.transaction.message.instructions) {
            allInstructions.push(...tx.transaction.message.instructions);
          }

          // Add inner instructions
          if (tx.meta.innerInstructions) {
            for (const innerIxGroup of tx.meta.innerInstructions) {
              allInstructions.push(...innerIxGroup.instructions);
            }
          }

          // Look for burn instructions targeting our token mint
          for (const ix of allInstructions) {
            if ('parsed' in ix) {
              const parsed = ix.parsed;

              // Check for token burn instruction
              if (parsed.type === 'burn' || parsed.type === 'burnChecked') {
                // Verify this burn is for our token mint
                const burnMint = parsed.info.mint;
                if (burnMint && burnMint !== tokenMintAddress) {
                  continue; // Skip burns for other tokens
                }

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

        if ((i + batchSize) % 50 === 0 || i + batchSize >= newSignatures.length) {
          console.log(`[SYNC-BURNS] Processed ${Math.min(i + batchSize, newSignatures.length)}/${newSignatures.length} transactions for ${project.slug}`);
        }
      }

      console.log(`[SYNC-BURNS] Found ${newBurns.length} burns for ${project.slug}`);

      // Insert new burns
      let inserted = 0;
      for (const burn of newBurns) {
        const { error } = await supabaseAdmin
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
    } // End project loop

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
