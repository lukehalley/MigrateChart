import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ProjectListItem } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

/**
 * GET /api/projects
 * Fetches list of all active projects for the token switcher dropdown
 */
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('slug, name, primary_color, logo_url, loader_url, enabled')
      .eq('is_active', true)
      .eq('enabled', true) // Only show enabled projects
      .order('is_default', { ascending: false }) // Default project first
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    const projectList: ProjectListItem[] = (projects || []).map((p) => ({
      slug: p.slug,
      name: p.name,
      primaryColor: p.primary_color,
      logoUrl: p.logo_url,
      loaderUrl: p.loader_url,
    }));

    return NextResponse.json(projectList, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
