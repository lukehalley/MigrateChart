/**
 * Migration Sync Service
 *
 * Automatically syncs active token migrations from migrate.fun into our database.
 * Creates project records, pool records, migration records, and backfills OHLC data.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { migrateFunApi, MigrationProject } from '../migrateFunApi';

// Lazy initialize Supabase client to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

export interface TokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  coingeckoId?: string;
}

export interface MigrationSyncResult {
  added: string[];       // Newly added project slugs
  updated: string[];     // Updated project slugs
  skipped: string[];     // Already synced project slugs
  errors: Array<{ migration: string; error: string }>;
}

export class MigrationSyncService {
  /**
   * Main sync function - fetches recent completed (Claims) migrations from migrate.fun
   * Note: We sync Claims instead of Active because the new token doesn't exist until migration completes
   */
  async syncActiveMigrations(dryRun: boolean = false, daysBack: number = 30, limit?: number): Promise<MigrationSyncResult> {
    console.log('🔄 Starting migration sync from migrate.fun...\n');

    const result: MigrationSyncResult = {
      added: [],
      updated: [],
      skipped: [],
      errors: []
    };

    try {
      // Fetch recent completed migrations
      // We use Claims status because both old and new tokens exist and have data
      let recentClaims = await migrateFunApi.fetchRecentClaims(daysBack);

      // Apply limit if specified
      if (limit && limit > 0) {
        recentClaims = recentClaims.slice(0, limit);
      }

      console.log(`Found ${recentClaims.length} recent completed migrations (last ${daysBack} days)\n`);

      for (const migration of recentClaims) {
        try {
          console.log(`Processing: ${migration.projectName} (${migration.migrationId})`);

          // Check if this migration already exists
          const exists = await this.migrationExists(
            migration.oldTokenMint!,
            migration.newTokenMint!
          );

          if (exists) {
            console.log(`  ⏭️  Already exists, skipping\n`);
            result.skipped.push(migration.projectName);
            continue;
          }

          if (dryRun) {
            console.log(`  [DRY RUN] Would create project for ${migration.projectName}\n`);
            result.added.push(migration.projectName);
            continue;
          }

          // Create the complete project setup
          await this.createProject(migration);
          result.added.push(migration.projectName);
          console.log(`  ✅ Successfully added ${migration.projectName}\n`);

        } catch (error) {
          console.error(`  ❌ Error processing ${migration.projectName}:`, error);
          result.errors.push({
            migration: migration.projectName,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      console.log('\n📊 Sync Complete:');
      console.log(`  Added: ${result.added.length}`);
      console.log(`  Skipped: ${result.skipped.length}`);
      console.log(`  Errors: ${result.errors.length}`);

      return result;

    } catch (error) {
      console.error('Fatal error during migration sync:', error);
      throw error;
    }
  }

  /**
   * Check if a migration between two tokens already exists
   */
  private async migrationExists(
    oldTokenMint: string,
    newTokenMint: string
  ): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pools')
      .select('id')
      .in('token_address', [oldTokenMint, newTokenMint])
      .limit(1);

    if (error) {
      console.error('Error checking migration existence:', error);
      return false;
    }

    return data && data.length > 0;
  }

  /**
   * Create complete project setup from migration data
   */
  private async createProject(migration: MigrationProject): Promise<void> {
    if (!migration.oldTokenMint || !migration.newTokenMint) {
      throw new Error('Missing token mint addresses');
    }

    const supabase = getSupabaseClient();

    console.log('  📦 Fetching token metadata...');

    // Fetch metadata for both tokens
    const [oldTokenMeta, newTokenMeta] = await Promise.all([
      this.fetchTokenMetadata(migration.oldTokenMint),
      this.fetchTokenMetadata(migration.newTokenMint)
    ]);

    console.log(`    Old: ${oldTokenMeta.symbol} (${oldTokenMeta.name})`);
    console.log(`    New: ${newTokenMeta.symbol} (${newTokenMeta.name})`);

    // Generate slug from project name (clean it up)
    const slug = this.generateSlug(migration.projectName);
    console.log(`  🔖 Generated slug: ${slug}`);

    // Use default color scheme for now
    // TODO: Implement logo fetching and color extraction
    const primaryColor = '#8C5CFF'; // Default purple
    const secondaryColor = '#FFFFFF';

    console.log('  💾 Creating database records...');

    // 1. Insert project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        slug,
        name: migration.projectName.replace(/\s+Migration.*$/i, '').trim(),
        primary_color: primaryColor,
        secondaryColor: secondaryColor,
        logo_url: null, // TODO: Implement logo sync
        loader_url: null, // Use default
        donation_address: migration.newTokenMint, // Use new token as donation address
        is_default: false,
        is_active: true
      })
      .select()
      .single();

    if (projectError) {
      throw new Error(`Failed to create project: ${projectError.message}`);
    }

    console.log(`    ✓ Project created: ${project.id}`);

    // 2. Find pool addresses (fallback to token addresses if not found)
    const oldPoolAddress = await this.findPoolAddress(migration.oldTokenMint) || migration.oldTokenMint;
    const newPoolAddress = await this.findPoolAddress(migration.newTokenMint) || migration.newTokenMint;

    // 3. Insert old pool (V1)
    const { data: oldPool, error: oldPoolError } = await supabase
      .from('pools')
      .insert({
        project_id: project.id,
        pool_address: oldPoolAddress,
        token_address: migration.oldTokenMint,
        token_symbol: oldTokenMeta.symbol,
        pool_name: `${oldTokenMeta.symbol} V1`,
        dex_type: 'raydium', // Default, could be detected
        order_index: 0,
        fee_rate: 0.008
      })
      .select()
      .single();

    if (oldPoolError) {
      throw new Error(`Failed to create old pool: ${oldPoolError.message}`);
    }

    console.log(`    ✓ Old pool created: ${oldPool.pool_name}`);

    // 4. Insert new pool (V2)
    const { data: newPool, error: newPoolError } = await supabase
      .from('pools')
      .insert({
        project_id: project.id,
        pool_address: newPoolAddress,
        token_address: migration.newTokenMint,
        token_symbol: newTokenMeta.symbol,
        pool_name: `${newTokenMeta.symbol} V2`,
        dex_type: 'raydium',
        order_index: 1,
        fee_rate: 0.008
      })
      .select()
      .single();

    if (newPoolError) {
      throw new Error(`Failed to create new pool: ${newPoolError.message}`);
    }

    console.log(`    ✓ New pool created: ${newPool.pool_name}`);

    // 5. Insert migration record
    const migrationTimestamp = migration.startDate
      ? Math.floor(new Date(migration.startDate).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    const { error: migrationError } = await supabase
      .from('migrations')
      .insert({
        project_id: project.id,
        from_pool_id: oldPool.id,
        to_pool_id: newPool.id,
        migration_timestamp: migrationTimestamp,
        label: `${oldTokenMeta.symbol}<br/>-><br/>${newTokenMeta.symbol}`
      });

    if (migrationError) {
      throw new Error(`Failed to create migration: ${migrationError.message}`);
    }

    console.log(`    ✓ Migration record created`);

    // 6. Backfill OHLC data
    console.log('  📈 Backfilling OHLC data...');
    await this.backfillOHLCData(migration.oldTokenMint, project.id);
    await this.backfillOHLCData(migration.newTokenMint, project.id);
    console.log(`    ✓ OHLC data backfilled for both tokens`);
  }

  /**
   * Generate URL-safe slug from project name
   */
  private generateSlug(projectName: string): string {
    return projectName
      .toLowerCase()
      .replace(/\s+migration.*$/i, '') // Remove "Migration" suffix
      .replace(/[^a-z0-9]/g, '')        // Remove special chars
      .substring(0, 20);                 // Limit length
  }

  /**
   * Fetch token metadata from Jupiter API
   */
  private async fetchTokenMetadata(tokenMint: string): Promise<TokenMetadata> {
    try {
      // Try Jupiter token list first
      const response = await fetch('https://token.jup.ag/strict');
      const tokens = await response.json();

      const token = tokens.find((t: any) => t.address === tokenMint);

      if (token) {
        return {
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: token.logoURI
        };
      }

      // Fallback: Query Solana RPC for token metadata
      console.log(`    ⚠️  Token not in Jupiter list, using fallback`);
      return {
        address: tokenMint,
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 9 // Default for Solana
      };

    } catch (error) {
      console.error('Error fetching token metadata:', error);
      // Return minimal metadata
      return {
        address: tokenMint,
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 9
      };
    }
  }

  /**
   * Find pool address for a token mint (searches Raydium, Jupiter, etc.)
   * Returns null if not found - caller should use token mint as fallback
   */
  private async findPoolAddress(tokenMint: string): Promise<string | null> {
    // For now, return null to use token address as pool address
    // TODO: Implement pool discovery via Raydium API or Jupiter
    return null;
  }

  /**
   * Backfill OHLC data from Jupiter API
   */
  private async backfillOHLCData(tokenMint: string, projectId: string): Promise<void> {
    const supabase = getSupabaseClient();

    try {
      // Fetch daily candles (last 500 days)
      const dailyCandles = await this.fetchJupiterCandles(tokenMint, '1_DAY', 500);

      if (dailyCandles.length === 0) {
        console.log(`      ⚠️  No data available for ${tokenMint}`);
        return;
      }

      console.log(`      Fetched ${dailyCandles.length} daily candles`);

      // Prepare records for insertion
      const records = dailyCandles.flatMap(candle => [
        {
          token_address: tokenMint,
          project_id: projectId,
          timeframe: '1D',
          timestamp: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume || 0
        },
        {
          token_address: tokenMint,
          project_id: projectId,
          timeframe: 'MAX',
          timestamp: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume || 0
        }
      ]);

      // Insert in batches to avoid conflicts
      const batchSize = 100;
      let inserted = 0;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error } = await supabase
          .from('ohlc_cache')
          .insert(batch);

        if (!error || error.message.includes('duplicate')) {
          inserted += batch.length;
        }
      }

      console.log(`      ✓ Inserted ${inserted} OHLC records`);

      // Fetch hourly data (last 1000 hours)
      const hourlyCandles = await this.fetchJupiterCandles(tokenMint, '1_HOUR', 1000);

      if (hourlyCandles.length > 0) {
        console.log(`      Fetched ${hourlyCandles.length} hourly candles`);

        const hourlyRecords = hourlyCandles.map(candle => ({
          token_address: tokenMint,
          project_id: projectId,
          timeframe: '1H',
          timestamp: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume || 0
        }));

        // Insert hourly data
        for (let i = 0; i < hourlyRecords.length; i += batchSize) {
          const batch = hourlyRecords.slice(i, i + batchSize);
          await supabase.from('ohlc_cache').insert(batch);
        }

        console.log(`      ✓ Inserted ${hourlyRecords.length} hourly records`);

        // Generate 4H and 8H aggregations
        await supabase.rpc('aggregate_ohlc_4h', {
          p_token_address: tokenMint,
          p_project_id: projectId
        });

        await supabase.rpc('aggregate_ohlc_8h', {
          p_token_address: tokenMint,
          p_project_id: projectId
        });

        console.log(`      ✓ Generated 4H and 8H aggregations`);
      }

    } catch (error) {
      console.error(`      ❌ Error backfilling data:`, error);
      throw error;
    }
  }

  /**
   * Fetch OHLC candles from Jupiter API
   */
  private async fetchJupiterCandles(
    tokenMint: string,
    interval: '1_HOUR' | '1_DAY',
    candles: number
  ): Promise<Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>> {
    const url = `https://datapi.jup.ag/v2/charts/${tokenMint}?interval=${interval}&to=${Date.now()}&candles=${candles}&type=price&quote=usd`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': 'https://jup.ag/',
        'Origin': 'https://jup.ag'
      }
    });

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candles || data.candles.length === 0) {
      return [];
    }

    return data.candles;
  }

  /**
   * Sync a single migration manually (for testing)
   */
  async syncSingleMigration(migrationId: string): Promise<void> {
    console.log(`🔄 Syncing single migration: ${migrationId}\n`);

    const allMigrations = await migrateFunApi.fetchAllProjects();
    const migration = allMigrations.find(m => m.migrationId === migrationId);

    if (!migration) {
      throw new Error(`Migration ${migrationId} not found`);
    }

    if (migration.status !== 'Claims') {
      console.warn(`⚠️  Warning: Migration ${migrationId} status is ${migration.status}, not Claims. New token may not have data yet.`);
    }

    await this.createProject(migration);
    console.log(`✅ Successfully synced ${migration.projectName}`);
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(daysBack: number = 30): Promise<{
    migrateFunActive: number;
    inOurDatabase: number;
    needsSync: number;
  }> {
    const recentClaims = await migrateFunApi.fetchRecentClaims(daysBack);

    let inDatabase = 0;

    for (const migration of recentClaims) {
      if (migration.oldTokenMint && migration.newTokenMint) {
        const exists = await this.migrationExists(
          migration.oldTokenMint,
          migration.newTokenMint
        );
        if (exists) inDatabase++;
      }
    }

    return {
      migrateFunActive: recentClaims.length,
      inOurDatabase: inDatabase,
      needsSync: recentClaims.length - inDatabase
    };
  }
}

// Export singleton instance
export const migrationSyncService = new MigrationSyncService();
