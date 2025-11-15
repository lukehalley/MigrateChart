import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/projects
 * Fetches list of ALL projects (including inactive) for admin dashboard
 */
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Fetch all projects (including inactive)
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // Fetch pool counts for each project
    const projectsWithCounts = await Promise.all(
      (projects || []).map(async (project) => {
        const { count } = await supabase
          .from('pools')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        return {
          ...project,
          poolCount: count || 0,
        };
      })
    );

    return NextResponse.json(projectsWithCounts);
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/projects
 * Creates a new project with pools
 */
export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      slug,
      name,
      primaryColor,
      logoUrl,
      loaderSvg,
      isDefault,
      isActive,
      pools,
    } = body;

    // Validate required fields
    if (!slug || !name || !primaryColor || !logoUrl || !loaderSvg) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Validate hex color format
    if (!/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
      return NextResponse.json(
        { error: 'Primary color must be a valid hex color (e.g., #52C97D)' },
        { status: 400 }
      );
    }

    // Validate pools (at least 1, max 4)
    if (!pools || !Array.isArray(pools) || pools.length === 0 || pools.length > 4) {
      return NextResponse.json(
        { error: 'Must provide between 1 and 4 pools' },
        { status: 400 }
      );
    }

    // Validate each pool
    for (const pool of pools) {
      if (!pool.tokenAddress || !pool.poolAddress || !pool.tokenSymbol || !pool.dexType) {
        return NextResponse.json(
          { error: 'Each pool must have tokenAddress, poolAddress, tokenSymbol, and dexType' },
          { status: 400 }
        );
      }

      // Validate Solana addresses
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(pool.tokenAddress)) {
        return NextResponse.json(
          { error: `Invalid token address format: ${pool.tokenAddress}` },
          { status: 400 }
        );
      }
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(pool.poolAddress)) {
        return NextResponse.json(
          { error: `Invalid pool address format: ${pool.poolAddress}` },
          { status: 400 }
        );
      }

      // Validate dexType
      if (!['raydium', 'meteora', 'pump_fun', 'orca', 'jupiter'].includes(pool.dexType)) {
        return NextResponse.json(
          { error: `Invalid DEX type: ${pool.dexType}` },
          { status: 400 }
        );
      }
    }

    // Insert project (donation_address will use default from schema)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        slug,
        name,
        primary_color: primaryColor,
        logo_url: logoUrl,
        loader_svg: loaderSvg,
        is_default: isDefault || false,
        is_active: isActive !== undefined ? isActive : true,
      })
      .select()
      .single();

    if (projectError || !project) {
      console.error('Error creating project:', projectError);
      return NextResponse.json(
        { error: projectError?.message || 'Failed to create project' },
        { status: 500 }
      );
    }

    // Insert pools
    const poolsToInsert = pools.map((pool: any, index: number) => ({
      project_id: project.id,
      pool_address: pool.poolAddress,
      token_address: pool.tokenAddress,
      token_symbol: pool.tokenSymbol,
      pool_name: pool.poolName || `${pool.tokenSymbol} ${pool.dexType}`,
      dex_type: pool.dexType,
      order_index: pool.orderIndex !== undefined ? pool.orderIndex : index,
      fee_rate: pool.feeRate || 0,
    }));

    const { error: poolsError } = await supabase
      .from('pools')
      .insert(poolsToInsert);

    if (poolsError) {
      console.error('Error creating pools:', poolsError);
      // Rollback: delete the project
      await supabase.from('projects').delete().eq('id', project.id);
      return NextResponse.json(
        { error: 'Failed to create pools' },
        { status: 500 }
      );
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
