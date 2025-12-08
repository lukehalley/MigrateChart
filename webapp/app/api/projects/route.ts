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
      .select(`
        slug,
        name,
        primary_color,
        logo_url,
        loader_url,
        enabled,
        website_url,
        id
      `)
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

    // Fetch stats and holder data for each project
    const projectIds = (projects || []).map(p => p.id);
    const { data: statsData } = await supabase
      .from('stats_cache')
      .select('project_id, all_time_high_market_cap, all_time_volume')
      .in('project_id', projectIds);

    const { data: holderData } = await supabase
      .from('holder_cache')
      .select('project_id, holder_count')
      .in('project_id', projectIds);

    // Create maps for easy lookup - get max values for each project
    const marketCapMap = new Map<string, number>();
    const volumeMap = new Map<string, number>();
    (statsData || []).forEach((stat: any) => {
      const currentMCap = marketCapMap.get(stat.project_id) || 0;
      const currentVol = volumeMap.get(stat.project_id) || 0;

      if (stat.all_time_high_market_cap && stat.all_time_high_market_cap > currentMCap) {
        marketCapMap.set(stat.project_id, stat.all_time_high_market_cap);
      }
      if (stat.all_time_volume && stat.all_time_volume > currentVol) {
        volumeMap.set(stat.project_id, stat.all_time_volume);
      }
    });

    const holdersMap = new Map<string, number>();
    (holderData || []).forEach((holder: any) => {
      if (holder.holder_count) {
        holdersMap.set(holder.project_id, holder.holder_count);
      }
    });

    const projectList: ProjectListItem[] = (projects || []).map((p) => ({
      slug: p.slug,
      name: p.name,
      primaryColor: p.primary_color,
      logoUrl: p.logo_url,
      loaderUrl: p.loader_url,
      websiteUrl: p.website_url,
      marketCap: marketCapMap.get(p.id),
      volume24h: volumeMap.get(p.id),
      holders: holdersMap.get(p.id),
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
