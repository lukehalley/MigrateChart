import { Connection, PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const PROGRAM_ADDRESS = '52g6zhWcSjM1o9YsF2DtBPJvL84Qosc4Vo5X7penkWg5';
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '6f701558-9fd6-4d38-9159-74b7f4c958e9';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set');

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillBurns() {
  console.log('Starting burn backfill...');

  // Get ZERA project
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', 'zera')
    .single();

  if (!project) {
    console.error('ZERA project not found');
    return;
  }

  console.log(`Found ZERA project: ${project.id}`);

  const connection = new Connection(HELIUS_RPC, 'confirmed');
  const programPubkey = new PublicKey(PROGRAM_ADDRESS);

  // Fetch all signatures
  const signatures = await connection.getSignaturesForAddress(programPubkey, {
    limit: 1000,
  });

  console.log(`Found ${signatures.length} signatures`);

  // Fetch full transaction details in batches
  const batchSize = 10;
  const burns: Array<{
    signature: string;
    timestamp: number;
    amount: number;
    from: string;
  }> = [];

  for (let i = 0; i < signatures.length; i += batchSize) {
    const batch = signatures.slice(i, i + batchSize);
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
        console.log(`Skipping failed transaction: ${sig.signature}`);
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

                burns.push({
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

    console.log(`Processed ${Math.min(i + batchSize, signatures.length)}/${signatures.length} transactions`);
  }

  console.log(`Found ${burns.length} burns`);

  // Insert burns
  let inserted = 0;
  let skipped = 0;

  for (const burn of burns) {
    const { error } = await supabase
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
        skipped++;
      } else {
        console.error(`Error inserting burn ${burn.signature}:`, error);
      }
    } else {
      inserted++;
    }
  }

  console.log(`\nBackfill complete!`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (duplicates): ${skipped}`);
}

backfillBurns().catch(console.error);
