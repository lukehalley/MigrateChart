import { NextResponse } from 'next/server';
import { getAllBurnData } from '@/lib/burn-data';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

/**
 * GET /api/burns/[slug]?timeframe=1D|7D|30D|90D|ALL
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

    // Extract timeframe from query parameters
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'ALL';

    // Convert timeframe to days (undefined for ALL means "from first burn")
    let days: number | undefined;
    switch (timeframe) {
      case '1D':
        days = 1;
        break;
      case '7D':
        days = 7;
        break;
      case '30D':
        days = 30;
        break;
      case '90D':
        days = 90;
        break;
      case 'ALL':
      default:
        days = undefined; // Will fetch from first burn onwards
        break;
    }

    // Fetch burn data with the specified timeframe
    const burnsData = await getAllBurnData(days);

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
