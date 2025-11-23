import { NextResponse } from 'next/server';
import { getAllBurnData } from '@/lib/burn-data';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

/**
 * GET /api/burns/[slug]
 * Fetches burn statistics and history for the project
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Only allow ZERA for now (can be extended for other tokens)
    if (slug !== 'zera') {
      return NextResponse.json(
        { error: 'Burns tracking not available for this token' },
        { status: 404 }
      );
    }

    // Fetch all burn data
    const burnsData = await getAllBurnData();

    return NextResponse.json(burnsData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/burns/[slug]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch burns data' },
      { status: 500 }
    );
  }
}
