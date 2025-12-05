import { NextRequest, NextResponse } from 'next/server';
import { migrateFunApi } from '@/lib/migrateFunApi';

/**
 * GET /api/migrate-fun/project/:id
 *
 * Fetch migration data from migrate.fun platform
 * Accepts either migration ID (e.g., "mig79") or full URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let migrationId = decodeURIComponent(id);

    // If full URL provided, extract ID
    if (migrationId.includes('migrate.fun')) {
      const match = migrationId.match(/\/claim\/(\w+)/);
      if (match) {
        migrationId = match[1];
      }
    }

    console.log('Searching for migration:', migrationId);

    // Fetch all projects and find the matching one
    const projects = await migrateFunApi.searchProjects(migrationId);

    // Find exact match by migrationId
    const project = projects.find(p =>
      p.migrationId.toLowerCase() === migrationId.toLowerCase()
    );

    if (!project) {
      return NextResponse.json(
        { error: `Migration ${migrationId} not found` },
        { status: 404 }
      );
    }

    // Transform to the expected format for the import page
    return NextResponse.json({
      migrationId: project.migrationId,
      projectName: project.projectName,
      oldToken: {
        address: project.oldTokenMint || '',
        symbol: 'V1', // Will be fetched during import
        name: `${project.projectName} (Legacy)`
      },
      newToken: {
        address: project.newTokenMint || '',
        symbol: 'V2',
        name: project.projectName
      },
      startDate: project.startDate || new Date().toISOString(),
      endDate: project.endDate || new Date().toISOString(),
      exchangeRate: 1,
      totalMigrated: project.tokensMigrated ? parseFloat(project.tokensMigrated) : 0,
      status: project.status
    });
  } catch (error: any) {
    console.error('Error fetching migration data:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch migration data',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
