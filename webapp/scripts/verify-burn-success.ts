import { Connection, PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '6f701558-9fd6-4d38-9159-74b7f4c958e9';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBurnSuccess() {
  console.log('Starting burn success verification...');

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

  // Fetch all burn transactions
  const { data: burns, error } = await supabase
    .from('burn_transactions')
    .select('id, signature, success')
    .eq('project_id', project.id);

  if (error) {
    console.error('Error fetching burns:', error);
    return;
  }

  console.log(`Found ${burns?.length || 0} burn transactions to verify`);

  const connection = new Connection(HELIUS_RPC, 'confirmed');
  let verified = 0;
  let failed = 0;
  let errors = 0;

  for (const burn of burns || []) {
    try {
      const tx = await connection.getParsedTransaction(burn.signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || !tx.meta) {
        console.log(`❓ Could not fetch transaction: ${burn.signature}`);
        errors++;
        continue;
      }

      // Check if transaction succeeded (meta.err is null)
      const isSuccess = tx.meta.err === null;

      // Update if different from current status
      if (isSuccess !== burn.success) {
        const { error: updateError } = await supabase
          .from('burn_transactions')
          .update({ success: isSuccess })
          .eq('id', burn.id);

        if (updateError) {
          console.error(`Error updating ${burn.signature}:`, updateError);
          errors++;
        } else {
          console.log(`${isSuccess ? '✅' : '❌'} Updated ${burn.signature}: success=${isSuccess}`);
          if (isSuccess) {
            verified++;
          } else {
            failed++;
          }
        }
      } else {
        verified++;
      }
    } catch (err) {
      console.error(`Error verifying ${burn.signature}:`, err);
      errors++;
    }
  }

  console.log(`\nVerification complete!`);
  console.log(`Verified successful: ${verified}`);
  console.log(`Marked as failed: ${failed}`);
  console.log(`Errors: ${errors}`);
}

verifyBurnSuccess().catch(console.error);
