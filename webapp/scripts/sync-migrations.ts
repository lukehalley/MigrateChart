#!/usr/bin/env tsx
/**
 * Manual Migration Sync Script
 *
 * Syncs active token migrations from migrate.fun into the database.
 *
 * Usage:
 *   npx tsx scripts/sync-migrations.ts [options]
 *
 * Options:
 *   --dry-run              Show what would be added without making changes
 *   --migration <id>       Sync a single migration by ID (e.g., mig77)
 *   --stats                Show sync statistics only
 *   --days <n>             Look back N days for claims (default: 30)
 *   --limit <n>            Sync at most N migrations (default: unlimited)
 *
 * Examples:
 *   npx tsx scripts/sync-migrations.ts --dry-run
 *   npx tsx scripts/sync-migrations.ts --migration mig77
 *   npx tsx scripts/sync-migrations.ts --stats --days 90
 *   npx tsx scripts/sync-migrations.ts --limit 5
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { migrationSyncService } from '../lib/services/migrationSyncService';

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const dryRun = args.includes('--dry-run');
  const statsOnly = args.includes('--stats');
  const migrationIdIndex = args.indexOf('--migration');
  const specificMigration = migrationIdIndex >= 0 ? args[migrationIdIndex + 1] : null;

  // Parse --days and --limit
  const daysIndex = args.indexOf('--days');
  const daysBack = daysIndex >= 0 ? parseInt(args[daysIndex + 1]) || 30 : 30;

  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex >= 0 ? parseInt(args[limitIndex + 1]) : undefined;

  console.log('🚀 Migration Sync Tool\n');
  console.log('═'.repeat(60));
  console.log('');

  try {
    // Show stats only
    if (statsOnly) {
      console.log(`📊 Fetching sync statistics (last ${daysBack} days)...\n`);
      const stats = await migrationSyncService.getSyncStats(daysBack);

      console.log('Statistics:');
      console.log(`  Recent claims (${daysBack} days): ${stats.migrateFunActive}`);
      console.log(`  Already in database:     ${stats.inOurDatabase}`);
      console.log(`  Needs sync:              ${stats.needsSync}`);
      console.log('');

      if (stats.needsSync === 0) {
        console.log('✨ All migrations are already synced!');
      } else {
        console.log(`💡 Run without --stats to sync ${stats.needsSync} migration(s)`);
        if (limit) {
          console.log(`💡 Or use --limit ${Math.min(5, stats.needsSync)} to sync just the most recent`);
        }
      }

      return;
    }

    // Sync single migration
    if (specificMigration) {
      console.log(`🎯 Syncing single migration: ${specificMigration}\n`);

      if (dryRun) {
        console.log('[DRY RUN] Would sync migration:', specificMigration);
        return;
      }

      await migrationSyncService.syncSingleMigration(specificMigration);
      console.log('\n✅ Sync complete!');
      return;
    }

    // Sync all recent claims
    if (dryRun) {
      console.log('🧪 DRY RUN MODE - No changes will be made\n');
    }

    if (limit) {
      console.log(`📊 Limiting to ${limit} migration(s)\n`);
    }

    const result = await migrationSyncService.syncActiveMigrations(dryRun, daysBack, limit);

    console.log('\n' + '═'.repeat(60));
    console.log('\n📋 Summary:\n');

    if (result.added.length > 0) {
      console.log('✅ Added:', result.added.length);
      result.added.forEach(name => console.log(`   - ${name}`));
      console.log('');
    }

    if (result.skipped.length > 0) {
      console.log('⏭️  Skipped (already exists):', result.skipped.length);
      result.skipped.forEach(name => console.log(`   - ${name}`));
      console.log('');
    }

    if (result.errors.length > 0) {
      console.log('❌ Errors:', result.errors.length);
      result.errors.forEach(err => {
        console.log(`   - ${err.migration}: ${err.error}`);
      });
      console.log('');
    }

    if (result.added.length === 0 && result.errors.length === 0) {
      console.log('✨ All migrations are already synced!');
    }

    if (!dryRun && result.added.length > 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Check the new projects in your database');
      console.log('   2. Test the charts at: http://localhost:3000/?token=<slug>');
      console.log('   3. Upload custom logos if desired');
      console.log('   4. Update colors if needed\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
