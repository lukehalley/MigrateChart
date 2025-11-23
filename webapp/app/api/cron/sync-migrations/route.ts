import { NextRequest, NextResponse } from 'next/server';
import { migrationSyncService } from '@/lib/services/migrationSyncService';

/**
 * Cron job endpoint to sync active migrations from migrate.fun
 * Triggered daily at midnight UTC via Vercel Cron (see vercel.json)
 *
 * Authentication: Bearer token with CRON_SECRET
 *
 * @route GET /api/cron/sync-migrations
 */
export const maxDuration = 300; // 5 minutes max execution time

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

    console.log('[Cron] Starting migration sync...');

    // Run the sync service
    const result = await migrationSyncService.syncActiveMigrations(false);

    console.log('[Cron] Sync complete:', {
      added: result.added.length,
      skipped: result.skipped.length,
      errors: result.errors.length
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: {
        added: result.added.length,
        skipped: result.skipped.length,
        errors: result.errors.length
      },
      details: result
    });

  } catch (error) {
    console.error('[Cron] Error in migration sync:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Allow manual triggering via POST (for testing)
 */
export async function POST(request: NextRequest) {
  try {
    // For POST, we can optionally support dry-run mode
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    console.log(`[Manual] Starting migration sync (dry-run: ${dryRun})...`);

    const result = await migrationSyncService.syncActiveMigrations(dryRun);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      dryRun,
      result: {
        added: result.added.length,
        skipped: result.skipped.length,
        errors: result.errors.length
      },
      details: result
    });

  } catch (error) {
    console.error('[Manual] Error in migration sync:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
