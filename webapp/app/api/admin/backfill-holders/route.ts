import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Admin endpoint to backfill historical holder data
 * This allows manual insertion of holder snapshots with custom timestamps
 *
 * Authentication: Uses CRON_SECRET for security
 *
 * Request body format:
 * {
 *   "snapshots": [
 *     {
 *       "projectId": "49fd8ab1-e85b-445f-9f92-defa0d46363a",
 *       "tokenAddress": "8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA",
 *       "holderCount": 4500,
 *       "timestamp": 1705190400  // Unix timestamp in seconds
 *     }
 *   ]
 * }
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

    const body = await request.json();
    const { snapshots } = body;

    if (!Array.isArray(snapshots) || snapshots.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: snapshots array required' },
        { status: 400 }
      );
    }

    const results: Array<{
      projectId: string;
      tokenAddress: string;
      timestamp: number;
      success: boolean;
      error?: string;
    }> = [];

    // Insert each snapshot
    for (const snapshot of snapshots) {
      const { projectId, tokenAddress, holderCount, timestamp } = snapshot;

      // Validate required fields
      if (!projectId || !tokenAddress || holderCount === undefined || !timestamp) {
        results.push({
          projectId: projectId || 'unknown',
          tokenAddress: tokenAddress || 'unknown',
          timestamp: timestamp || 0,
          success: false,
          error: 'Missing required fields',
        });
        continue;
      }

      // Validate timestamp (must be in the past, not in the future)
      const now = Math.floor(Date.now() / 1000);
      if (timestamp > now) {
        results.push({
          projectId,
          tokenAddress,
          timestamp,
          success: false,
          error: 'Timestamp cannot be in the future',
        });
        continue;
      }

      try {
        const { error } = await supabase
          .from('holder_snapshots')
          .upsert(
            {
              project_id: projectId,
              token_address: tokenAddress,
              holder_count: holderCount,
              timestamp,
            },
            {
              onConflict: 'project_id,token_address,timestamp',
              ignoreDuplicates: false,
            }
          );

        if (error) {
          results.push({
            projectId,
            tokenAddress,
            timestamp,
            success: false,
            error: error.message,
          });
        } else {
          results.push({
            projectId,
            tokenAddress,
            timestamp,
            success: true,
          });
        }
      } catch (error) {
        results.push({
          projectId,
          tokenAddress,
          timestamp,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return NextResponse.json({
      success: true,
      inserted: successCount,
      total: totalCount,
      results,
    });
  } catch (error) {
    console.error('Error in backfill holders endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
