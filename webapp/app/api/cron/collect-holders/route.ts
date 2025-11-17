import { NextRequest, NextResponse } from 'next/server';
import { fetchHolderCount } from '@/lib/api';
import { saveHolderSnapshot } from '@/lib/holderSnapshotService';
import type { ProjectConfig } from '@/lib/types';

/**
 * Cron job endpoint to collect holder snapshots for all projects
 * This should be triggered by Vercel Cron (see vercel.json)
 *
 * Vercel Cron authentication uses the Authorization header with a cron secret
 */
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

    // Fetch all projects from the projects API
    const baseUrl = request.url.split('/api')[0];
    const projectsListResponse = await fetch(`${baseUrl}/api/projects`, {
      next: { revalidate: 0 }, // Don't cache for cron job
    });

    if (!projectsListResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch projects list' },
        { status: 500 }
      );
    }

    const projectsList: Array<{ slug: string }> = await projectsListResponse.json();

    // Fetch full details for each project
    const projects: ProjectConfig[] = [];
    for (const { slug } of projectsList) {
      const projectResponse = await fetch(`${baseUrl}/api/projects/${slug}`, {
        next: { revalidate: 0 },
      });

      if (projectResponse.ok) {
        const project = await projectResponse.json();
        projects.push(project);
      }
    }
    const results: Array<{
      projectId: string;
      tokenAddress: string;
      holderCount: number | null;
      success: boolean;
      error?: string;
    }> = [];

    // Collect holder snapshots for each project's current token
    for (const project of projects) {
      const currentPool = project.pools[project.pools.length - 1];
      const tokenAddress = currentPool.tokenAddress;

      try {
        const holderCount = await fetchHolderCount(project.id, tokenAddress);

        if (holderCount !== undefined) {
          const saved = await saveHolderSnapshot(
            project.id,
            tokenAddress,
            holderCount
          );

          results.push({
            projectId: project.id,
            tokenAddress,
            holderCount,
            success: saved,
          });
        } else {
          results.push({
            projectId: project.id,
            tokenAddress,
            holderCount: null,
            success: false,
            error: 'Failed to fetch holder count',
          });
        }
      } catch (error) {
        results.push({
          projectId: project.id,
          tokenAddress,
          holderCount: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return NextResponse.json({
      success: true,
      timestamp: Math.floor(Date.now() / 1000),
      collected: successCount,
      total: totalCount,
      results,
    });
  } catch (error) {
    console.error('Error in holder collection cron:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
