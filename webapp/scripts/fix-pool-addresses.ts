#!/usr/bin/env tsx
/**
 * Fix Pool Addresses Script
 *
 * Finds real Raydium pool addresses for tokens that are using token addresses
 * as pool addresses. This is needed after auto-syncing migrations.
 *
 * Usage:
 *   npx tsx scripts/fix-pool-addresses.ts [--project <slug>]
 *
 * Examples:
 *   npx tsx scripts/fix-pool-addresses.ts              # Fix all projects
 *   npx tsx scripts/fix-pool-addresses.ts --project memeverse
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Pool {
  id: string;
  pool_address: string;
  token_address: string;
  pool_name: string;
  project_slug: string;
}

/**
 * Find Raydium pool address for a token
 */
async function findRaydiumPool(tokenMint: string): Promise<string | null> {
  try {
    const url = `https://api-v3.raydium.io/pools/info/mint?mint1=${tokenMint}&poolType=all&poolSortField=default&sortType=desc&pageSize=1&page=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.data?.data?.[0]?.id) {
      return data.data.data[0].id;
    }

    return null;
  } catch (error) {
    console.error(`Error finding pool for ${tokenMint}:`, error);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const projectSlugIndex = args.indexOf('--project');
  const specificProject = projectSlugIndex >= 0 ? args[projectSlugIndex + 1] : null;

  console.log('🔍 Finding Real Pool Addresses\n');
  console.log('═'.repeat(60));
  console.log('');

  // Find pools where pool_address = token_address
  // We need to fetch all pools and filter in JS since Supabase doesn't support column comparison
  let query = supabase
    .from('pools')
    .select(`
      id,
      pool_address,
      token_address,
      pool_name,
      projects!inner(slug)
    `);

  if (specificProject) {
    query = query.eq('projects.slug', specificProject);
  }

  const { data: allPools, error } = await query;

  if (error) {
    console.error('Error fetching pools:', error);
    return;
  }

  // Filter to only pools where pool_address equals token_address
  const pools = (allPools || []).filter((pool: any) =>
    pool.pool_address === pool.token_address
  );

  if (!pools || pools.length === 0) {
    console.log('✅ All pool addresses are correct! No fixes needed.');
    return;
  }

  console.log(`Found ${pools.length} pool(s) using token address as pool address:\n`);

  const results = [];

  for (const pool of pools as any[]) {
    const project_slug = pool.projects.slug;
    console.log(`📦 ${project_slug} - ${pool.pool_name}`);
    console.log(`   Token: ${pool.token_address}`);
    console.log(`   Searching Raydium API...`);

    const realPoolAddress = await findRaydiumPool(pool.token_address);

    if (realPoolAddress && realPoolAddress !== pool.pool_address) {
      console.log(`   ✅ Found: ${realPoolAddress}`);

      // Update in database
      const { error: updateError } = await supabase
        .from('pools')
        .update({ pool_address: realPoolAddress })
        .eq('id', pool.id);

      if (updateError) {
        console.log(`   ❌ Failed to update: ${updateError.message}`);
        results.push({ pool: pool.pool_name, status: 'error', error: updateError.message });
      } else {
        console.log(`   💾 Updated in database`);
        results.push({ pool: pool.pool_name, status: 'updated', poolAddress: realPoolAddress });
      }
    } else if (realPoolAddress === pool.pool_address) {
      console.log(`   ℹ️  Already has correct pool address`);
      results.push({ pool: pool.pool_name, status: 'already_correct' });
    } else {
      console.log(`   ⚠️  Pool not found on Raydium - keeping token address`);
      results.push({ pool: pool.pool_name, status: 'not_found' });
    }

    console.log('');
  }

  console.log('═'.repeat(60));
  console.log('\n📊 Summary:\n');

  const updated = results.filter(r => r.status === 'updated').length;
  const notFound = results.filter(r => r.status === 'not_found').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log(`✅ Updated: ${updated}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`❌ Errors: ${errors}`);

  if (updated > 0) {
    console.log('\n💡 Pool addresses have been updated. Charts should now load properly!');
  }
}

main();
