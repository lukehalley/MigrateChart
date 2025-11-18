import { NextRequest, NextResponse } from 'next/server';
import { getHolderSnapshots } from '@/lib/holderSnapshotService';
import type { ProjectConfig } from '@/lib/types';

/**
 * API endpoint to retrieve holder time-series data for a project
 * GET /api/holders/[slug]?timeframe=7D|30D|90D|ALL
 */

type HolderTimeframe = '1D' | '7D' | '30D' | '90D' | 'ALL';

export interface HolderSnapshot {
  timestamp: number;
  holder_count: number;
}

export interface HoldersResponse {
  projectId: string;
  tokenAddress: string;
  timeframe: HolderTimeframe;
  snapshots: HolderSnapshot[];
  currentHolderCount: number | null;
  firstSnapshotDate: number | null;
  totalSnapshots: number;
}

function getTimeframeStart(timeframe: HolderTimeframe): number | undefined {
  const now = Math.floor(Date.now() / 1000);

  switch (timeframe) {
    case '1D':
      return now - (1 * 86400);
    case '7D':
      return now - (7 * 86400);
    case '30D':
      return now - (30 * 86400);
    case '90D':
      return now - (90 * 86400);
    case 'ALL':
      return undefined; // No start limit
    default:
      return now - (30 * 86400); // Default to 30D
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const timeframe = (searchParams.get('timeframe') || '30D') as HolderTimeframe;

    // Fetch project config
    const projectResponse = await fetch(`${request.url.split('/api')[0]}/api/projects/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!projectResponse.ok) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project: ProjectConfig = await projectResponse.json();

    // Get current token address
    const currentPool = project.pools[project.pools.length - 1];
    const tokenAddress = currentPool.tokenAddress;

    // Calculate time range based on timeframe
    const startTimestamp = getTimeframeStart(timeframe);

    // Fetch snapshots from database
    const snapshots = await getHolderSnapshots(
      project.id,
      tokenAddress,
      startTimestamp
    );

    // Get current holder count (most recent snapshot)
    const currentHolderCount = snapshots.length > 0
      ? snapshots[snapshots.length - 1].holder_count
      : null;

    // Get first snapshot date
    const firstSnapshotDate = snapshots.length > 0
      ? snapshots[0].timestamp
      : null;

    const response: HoldersResponse = {
      projectId: project.id,
      tokenAddress,
      timeframe,
      snapshots,
      currentHolderCount,
      firstSnapshotDate,
      totalSnapshots: snapshots.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching holder data:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
