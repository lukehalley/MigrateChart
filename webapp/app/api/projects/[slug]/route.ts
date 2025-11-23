import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ProjectConfig, PoolConfig, MigrationConfig } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

/**
 * GET /api/projects/[slug]
 * Fetches complete project configuration including pools and migrations
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('enabled', true) // Only allow enabled projects
      .single();

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch pools for this project
    const { data: pools, error: poolsError } = await supabase
      .from('pools')
      .select('*')
      .eq('project_id', project.id)
      .order('order_index', { ascending: true });

    if (poolsError) {
      console.error('Error fetching pools:', poolsError);
      return NextResponse.json(
        { error: 'Failed to fetch pools' },
        { status: 500 }
      );
    }

    // Fetch migrations for this project
    const { data: migrations, error: migrationsError } = await supabase
      .from('migrations')
      .select('*')
      .eq('project_id', project.id)
      .order('migration_timestamp', { ascending: true });

    if (migrationsError) {
      console.error('Error fetching migrations:', migrationsError);
      return NextResponse.json(
        { error: 'Failed to fetch migrations' },
        { status: 500 }
      );
    }

    // Map to ProjectConfig interface
    const poolConfigs: PoolConfig[] = (pools || []).map((p) => ({
      id: p.id,
      projectId: p.project_id,
      poolAddress: p.pool_address,
      tokenAddress: p.token_address,
      tokenSymbol: p.token_symbol,
      poolName: p.pool_name,
      dexType: p.dex_type,
      color: p.color,
      orderIndex: p.order_index,
      feeRate: parseFloat(p.fee_rate) || 0,
      createdAt: p.created_at,
    }));

    const migrationConfigs: MigrationConfig[] = (migrations || []).map((m) => ({
      id: m.id,
      projectId: m.project_id,
      fromPoolId: m.from_pool_id,
      toPoolId: m.to_pool_id,
      migrationTimestamp: m.migration_timestamp,
      label: m.label,
      createdAt: m.created_at,
    }));

    const projectConfig: ProjectConfig = {
      id: project.id,
      slug: project.slug,
      name: project.name,
      primaryColor: project.primary_color,
      secondaryColor: project.secondaryColor || '#000000',
      logoUrl: project.logo_url,
      loaderUrl: project.loader_url,
      donationAddress: project.donation_address,
      isDefault: project.is_default,
      isActive: project.is_active,
      burnsEnabled: project.burns_enabled || false,
      pools: poolConfigs,
      migrations: migrationConfigs,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };

    return NextResponse.json(projectConfig, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/projects/[slug]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
