import { NextResponse } from 'next/server';
import { createClient, getUser } from '@/lib/supabase-server';
import type { ProjectConfig, PoolConfig, MigrationConfig } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

/**
 * GET /api/projects/[slug]
 * Fetches complete project configuration including pools and migrations
 * Supports ?preview=true for admin preview of inactive projects
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === 'true';

    // Create SSR-aware Supabase client
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Check admin auth for preview mode
    let isAdmin = false;
    if (isPreview) {
      const user = await getUser();
      isAdmin = !!user;
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized - admin access required for preview' },
          { status: 401 }
        );
      }
    }

    // Fetch project - skip active/enabled checks if admin preview
    let query = supabase
      .from('projects')
      .select('*')
      .eq('slug', slug);

    if (!isAdmin) {
      query = query.eq('is_active', true).eq('enabled', true);
    }

    const { data: project, error: projectError } = await query.single();

    if (projectError || !project) {
      console.error(`Error fetching project '${slug}' (isPreview: ${isPreview}, isAdmin: ${isAdmin}):`, projectError);

      // If preview mode and project not found, provide more details
      if (isPreview) {
        console.error(`Project '${slug}' not found in database for preview. Check if project exists.`);
      }

      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch global donation address from site_config
    const { data: donationConfig, error: donationError } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'donation_address')
      .single();

    if (donationError) {
      console.error('Error fetching donation address:', donationError);
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
      donationAddress: donationConfig?.value || project.donation_address, // Use global config, fallback to project-specific
      isDefault: project.is_default,
      isActive: project.is_active,
      isPreview: isAdmin && !project.is_active, // Flag for preview mode
      burnsEnabled: project.burns_enabled || false,
      pools: poolConfigs,
      migrations: migrationConfigs,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };

    // Don't cache preview requests
    const cacheHeaders = isAdmin
      ? { 'Cache-Control': 'no-store' }
      : { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' };

    return NextResponse.json(projectConfig, {
      headers: cacheHeaders,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/projects/[slug]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
