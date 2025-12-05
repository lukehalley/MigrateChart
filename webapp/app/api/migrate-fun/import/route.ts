import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { migrateFunApi, MigrationProject } from '@/lib/migrateFunApi';
import { fetchMigrationByUrl, migrationToProjectConfig, migrationToPoolConfigs, migrationToMigrationConfig } from '@/lib/migrateFun';
import { Connection, PublicKey } from '@solana/web3.js';
import { saveHolderSnapshot } from '@/lib/holderSnapshotService';
import { discoverBestPool } from '@/lib/poolDiscovery';
import { uploadLogoFromUrl } from '@/lib/logoUpload';

async function verifyAdminAuth() {
  const cookieStore = await cookies();

  // Use anon client for auth verification
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  );

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

function getAdminClient() {
  // Use service role for admin database operations
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/migrate-fun/import
 *
 * Comprehensive migration import from migrate.fun
 *
 * End-to-End Process:
 * ==================
 * 1. Extract migration ID from URL (e.g., mig81) - only used for on-chain lookup
 * 2. Fetch migration account data from Solana (start/end dates, exchange rate)
 * 3. Fetch token metadata from Metaplex for BOTH old and new tokens:
 *    - Token names (e.g., "Roru Labs" -> "HereWeGo")
 *    - Token symbols (e.g., "RORU" -> "HEREWEGO")
 *    - Token images from IPFS/Arweave
 * 4. Generate clean slug from new token symbol (e.g., "herewego" NOT "mig81")
 * 5. Upload logo to Supabase Storage (project-logos bucket)
 * 6. Discover actual Raydium/Meteora pool address using DexScreener
 * 7. Fetch global donation address from site_config
 * 8. Create project record with all metadata
 * 9. Create pool records:
 *    - Old token: Uses token address as pool (pump.fun/legacy)
 *    - New token: Uses DISCOVERED pool address (critical for charts!)
 * 10. Create migration record with proper labels (RORU -> HEREWEGO)
 * 11. Fetch initial holder count from DexScreener (with Helius fallback)
 * 12. Save holder snapshot to database
 *
 * Data Collected:
 * ===============
 * ✅ Token Metadata: Names, symbols, decimals, supply
 * ✅ Pool Addresses: Actual liquidity pool addresses from DexScreener
 * ✅ Logo: Downloaded from IPFS and uploaded to Supabase Storage
 * ✅ Holders: Initial snapshot from DexScreener or Helius
 * ✅ Donation Address: From global site_config
 * ❌ Historical Candlesticks: Must backfill via /api/admin/backfill-candlesticks
 * ❌ Historical Holders: Must backfill via /api/admin/backfill-holders
 * ❌ Burns: Disabled by default (can be enabled + backfilled if needed)
 *
 * Post-Import Steps Required:
 * ===========================
 * Admin must run backfill jobs to populate historical data:
 * 1. Backfill candlestick data (Jupiter API)
 * 2. Backfill holder snapshots (historical data)
 * 3. Enable project when ready (is_active = true)
 *
 * Body: { migrateFunUrl: string, overrides?: Partial<Project> }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    await verifyAdminAuth();

    // Use service role client for database operations
    const supabase = getAdminClient();
    const body = await request.json();
    const { migrateFunUrl, overrides = {} } = body;

    if (!migrateFunUrl) {
      return NextResponse.json(
        { error: 'migrateFunUrl is required' },
        { status: 400 }
      );
    }

    // 1. Fetch complete migration data with token metadata from on-chain
    console.log('Fetching migration data from:', migrateFunUrl);

    const migrationData = await fetchMigrationByUrl(migrateFunUrl);

    // 2. Check if project already exists
    const { data: existing } = await supabase
      .from('projects')
      .select('id, slug')
      .eq('migrate_fun_id', migrationData.migrationId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Project already imported', projectId: existing.id, slug: existing.slug },
        { status: 409 }
      );
    }

    // 3. Fetch global donation address
    const { data: donationConfig } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'donation_address')
      .single();

    const donationAddress = donationConfig?.value || 'G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb';

    // 4. Upload logo and loader SVG
    const projectSlug = migrationToProjectConfig(migrationData).slug;
    let logoUrl = null;
    let loaderUrl = null;

    if (migrationData.newToken.imageUri) {
      console.log('Uploading logo from:', migrationData.newToken.imageUri);
      logoUrl = await uploadLogoFromUrl(migrationData.newToken.imageUri, projectSlug);
      console.log('Logo uploaded:', logoUrl || 'failed');

      // Also use logo as loader (can be replaced later with custom SVG)
      loaderUrl = logoUrl;
    }

    // Fallback to default loader if no image
    if (!loaderUrl) {
      loaderUrl = 'https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-logos/default-loader.svg';
    }

    // 5. Discover actual pool address for new token
    console.log('Discovering pool for new token:', migrationData.newToken.address);
    const discoveredPool = await discoverBestPool(migrationData.newToken.address);

    if (!discoveredPool) {
      console.warn('Could not discover pool for new token, using token address as fallback');
    } else {
      console.log('Discovered pool:', discoveredPool.poolAddress, 'on', discoveredPool.dexType, 'with $', discoveredPool.liquidity.toFixed(2), 'liquidity');
    }

    // 6. Convert migration data to project config (uses token name/symbol)
    const projectConfig = {
      ...migrationToProjectConfig(migrationData),
      logo_url: logoUrl || migrationData.newToken.imageUri, // Use uploaded URL or fallback to original
      loader_url: loaderUrl, // Use logo as loader
      donation_address: donationAddress,
      ...overrides // Allow admin to override defaults
    };

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(projectConfig)
      .select()
      .single();

    if (projectError) {
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    console.log('Created project:', project.id, 'with slug:', project.slug);

    // 7. Create pool records with discovered pool addresses
    const poolConfigsBase = migrationToPoolConfigs(migrationData);

    // Update new token pool with discovered pool address
    if (discoveredPool && poolConfigsBase[1]) {
      poolConfigsBase[1].pool_address = discoveredPool.poolAddress;
      poolConfigsBase[1].dex_type = discoveredPool.dexType;
    }

    const poolConfigs = poolConfigsBase.map(pool => ({
      ...pool,
      project_id: project.id
    }));

    const { data: pools, error: poolsError } = await supabase
      .from('pools')
      .insert(poolConfigs)
      .select();

    if (poolsError) {
      // Rollback: delete project if pools fail
      await supabase.from('projects').delete().eq('id', project.id);
      throw new Error(`Failed to create pools: ${poolsError.message}`);
    }

    console.log('Created pools:', pools.map(p => `${p.id} (${p.token_symbol})`));

    // 8. Create migration record
    const migrationConfigBase = migrationToMigrationConfig(migrationData);
    const migrationConfig = {
      ...migrationConfigBase,
      project_id: project.id,
      from_pool_id: pools[0].id, // Old token pool
      to_pool_id: pools[1].id, // New token pool
    };

    const { data: migrationRecord, error: migrationError } = await supabase
      .from('migrations')
      .insert(migrationConfig)
      .select()
      .single();

    if (migrationError) {
      // Rollback: delete project and pools if migration fails
      await supabase.from('pools').delete().eq('project_id', project.id);
      await supabase.from('projects').delete().eq('id', project.id);
      throw new Error(`Failed to create migration: ${migrationError.message}`);
    }

    console.log('Created migration:', migrationRecord.id);

    // 9. Fetch initial holder count for new token
    let holderCount = 0;
    try {
      console.log('Fetching holder count for:', migrationData.newToken.address);

      // Use DexScreener API which has holder counts
      const dexResponse = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${migrationData.newToken.address}`,
        { next: { revalidate: 0 } }
      );

      if (dexResponse.ok) {
        const dexData = await dexResponse.json();
        if (dexData.pairs && dexData.pairs.length > 0) {
          // Get holder count from the first pair (usually most liquid)
          const holderInfo = dexData.pairs[0].info;
          holderCount = holderInfo?.holders || 0;

          if (holderCount > 0) {
            const saved = await saveHolderSnapshot(project.id, migrationData.newToken.address, holderCount);
            console.log('Saved initial holder snapshot:', holderCount, '- Success:', saved);
          }
        }
      }

      // Fallback: Try Helius if DexScreener doesn't have holder count
      if (holderCount === 0 && process.env.HELIUS_API_KEY) {
        const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

        const response = await fetch(heliusUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'holder-count',
            method: 'getTokenLargestAccounts',
            params: [migrationData.newToken.address, { commitment: 'confirmed' }]
          })
        });

        const data = await response.json();
        if (data.result?.value) {
          // Count non-zero balance accounts
          holderCount = data.result.value.filter((acc: any) =>
            parseFloat(acc.amount || '0') > 0
          ).length;

          if (holderCount > 0) {
            await saveHolderSnapshot(project.id, migrationData.newToken.address, holderCount);
            console.log('Saved holder snapshot from Helius:', holderCount);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch initial holder count:', error);
      // Non-fatal - continue with import
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        slug: project.slug,
        name: project.name,
        logo_url: project.logo_url,
        donation_address: project.donation_address
      },
      pools: pools.map(p => ({
        id: p.id,
        name: p.pool_name,
        symbol: p.token_symbol,
        pool_address: p.pool_address,
        dex_type: p.dex_type
      })),
      migration: {
        id: migrationRecord.id,
        label: migrationRecord.label
      },
      dataFetched: {
        tokenMetadata: true,
        poolAddress: !!discoveredPool,
        logo: !!logoUrl,
        holders: holderCount > 0,
        holderCount: holderCount,
        burns: false
      },
      warnings: discoveredPool ? [] : ['Could not discover pool address - using token address as fallback. Charts may not work correctly.']
    });
  } catch (error: any) {
    console.error('Error importing migration:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to import migration',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
