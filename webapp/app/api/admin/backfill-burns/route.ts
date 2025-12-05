import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for backfill

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC = HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : 'https://api.mainnet-beta.solana.com';

/**
 * Admin endpoint to backfill historical burn transactions
 *
 * NEW APPROACH: Scans the TOKEN MINT address to find ALL burn transactions
 * regardless of which wallet performed the burn (fixes issue where burns from
 * depositor addresses were being missed)
 *
 * Authentication: Uses CRON_SECRET for security
 *
 * Query params:
 * - limit: Max transactions to fetch per batch (default: 5000)
 * - projectSlug: Specific project slug (defaults to all projects with burns enabled)
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5000');
    const projectSlug = searchParams.get('projectSlug');

    // Get projects with burns enabled - now using token_mint_address
    let query = supabaseAdmin
      .from('projects')
      .select('id, slug, token_mint_address, token_decimals')
      .eq('burns_enabled', true);

    if (projectSlug) {
      query = query.eq('slug', projectSlug);
    }

    const { data: projects, error: projectError } = await query;

    if (projectError) {
      throw new Error(`Failed to fetch projects: ${projectError.message}`);
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No projects found with burns enabled',
      });
    }

    console.log(`[BACKFILL-BURNS] Processing ${projects.length} projects`);

    const results = [];

    for (const project of projects) {
      console.log(`[BACKFILL-BURNS] Backfilling burns for ${project.slug}...`);

      // Use token mint address to track ALL burns for this token
      const tokenMintAddress = project.token_mint_address;

      if (!tokenMintAddress) {
        console.log(`[BACKFILL-BURNS] No token_mint_address configured for ${project.slug}, skipping`);
        continue;
      }

      console.log(`[BACKFILL-BURNS] Tracking burns for token mint: ${tokenMintAddress}`);

      const connection = new Connection(HELIUS_RPC, 'confirmed');
      const mintPubkey = new PublicKey(tokenMintAddress);

      // Fetch all signatures (paginate if needed)
      let allSignatures: any[] = [];
      let beforeSignature: string | undefined;
      let fetchCount = 0;
      const maxFetches = Math.ceil(limit / 1000); // Max 1000 per request

      while (fetchCount < maxFetches) {
        const signatures = await connection.getSignaturesForAddress(mintPubkey, {
          limit: 1000,
          before: beforeSignature,
        });

        if (signatures.length === 0) break;

        allSignatures = allSignatures.concat(signatures);
        beforeSignature = signatures[signatures.length - 1].signature;
        fetchCount++;

        console.log(`[BACKFILL-BURNS] Fetched ${allSignatures.length} signatures for ${project.slug}`);

        if (signatures.length < 1000) break; // No more pages
      }

      console.log(`[BACKFILL-BURNS] Found ${allSignatures.length} total signatures for ${project.slug}`);

      // Fetch full transaction details in batches and extract burns
      const batchSize = 10;
      const burns: Array<{
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

          // Skip failed transactions
          if (tx.meta.err !== null) continue;

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

                burns.push({
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

        if ((i + batchSize) % 100 === 0 || i + batchSize >= allSignatures.length) {
          console.log(`[BACKFILL-BURNS] Processed ${Math.min(i + batchSize, allSignatures.length)}/${allSignatures.length} transactions for ${project.slug}`);
        }
      }

      console.log(`[BACKFILL-BURNS] Found ${burns.length} burns for ${project.slug}`);

      // Insert burns into database
      let inserted = 0;
      let skipped = 0;

      for (const burn of burns) {
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

      console.log(`[BACKFILL-BURNS] Inserted ${inserted} new burns for ${project.slug} (skipped ${skipped} duplicates)`);

      results.push({
        project: project.slug,
        tokenMint: tokenMintAddress,
        scanned: allSignatures.length,
        found: burns.length,
        inserted,
        skipped,
      });
    } // End project loop

    return NextResponse.json({
      success: true,
      results,
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
