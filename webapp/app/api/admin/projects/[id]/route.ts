import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/admin/projects/[id]
 * Updates an existing project and its pools
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Validate slug format
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

    // Validate pools
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

    // Update project (donation_address keeps existing value or default)
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .update({
        slug,
        name,
        primary_color: primaryColor,
        logo_url: logoUrl,
        loader_svg: loaderSvg,
        is_default: isDefault || false,
        is_active: isActive !== undefined ? isActive : true,
      })
      .eq('id', id)
      .select();

    if (projectError) {
      console.error('Error updating project:', projectError);
      return NextResponse.json(
        { error: projectError?.message || 'Failed to update project', details: projectError },
        { status: 500 }
      );
    }

    if (!projects || projects.length === 0) {
      console.error('No project returned after update');
      return NextResponse.json(
        { error: 'Project not found or not updated' },
        { status: 404 }
      );
    }

    const project = projects[0];

    // Delete existing pools
    const { error: deleteError } = await supabase
      .from('pools')
      .delete()
      .eq('project_id', id);

    if (deleteError) {
      console.error('Error deleting existing pools:', deleteError);
      return NextResponse.json(
        { error: 'Failed to update pools' },
        { status: 500 }
      );
    }

    // Insert new pools
    const poolsToInsert = pools.map((pool: any, index: number) => ({
      project_id: id,
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
      return NextResponse.json(
        { error: 'Failed to create pools' },
        { status: 500 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Unexpected error in PUT /api/admin/projects/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/projects/[id]
 * Deletes a project and all associated pools and migrations
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Delete project (CASCADE will handle pools and migrations)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/admin/projects/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
