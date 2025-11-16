import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Service for caching token statistics, holder counts, and metadata
 * Reduces API calls by caching computed aggregates and semi-static data
 */

// ========== ALL-TIME STATISTICS CACHE ==========

export interface CachedStats {
  project_id: string;
  token_address: string;
  all_time_volume: number;
  all_time_fees: number;
  all_time_high_price: number;
  all_time_high_market_cap: number;
  updated_at: string;
}

export async function getCachedStats(projectId: string, tokenAddress: string): Promise<CachedStats | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('stats_cache')
      .select('*')
      .eq('project_id', projectId)
      .eq('token_address', tokenAddress)
      .gt('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 hours
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      return null;
    }

    return data as CachedStats;
  } catch (error) {
    return null;
  }
}

export async function saveCachedStats(stats: Omit<CachedStats, 'updated_at'>): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const { error } = await supabase
      .from('stats_cache')
      .upsert({
        ...stats,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id,token_address',
      });

    if (error) {
      return;
    }

  } catch (error) {
  }
}

// ========== HOLDER COUNT CACHE ==========

export interface CachedHolderCount {
  project_id: string;
  token_address: string;
  holder_count: number;
  updated_at: string;
}

export async function getCachedHolderCount(projectId: string, tokenAddress: string): Promise<number | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error} = await supabase
      .from('holder_cache')
      .select('*')
      .eq('project_id', projectId)
      .eq('token_address', tokenAddress)
      .gt('updated_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // 1 hour
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      return null;
    }

    return data.holder_count;
  } catch (error) {
    return null;
  }
}

export async function saveCachedHolderCount(projectId: string, tokenAddress: string, holderCount: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const { error } = await supabase
      .from('holder_cache')
      .upsert({
        project_id: projectId,
        token_address: tokenAddress,
        holder_count: holderCount,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id,token_address',
      });

    if (error) {
      return;
    }

  } catch (error) {
  }
}

// ========== METADATA CACHE ==========

export interface CachedMetadata {
  project_id: string;
  token_address: string;
  pool_address?: string;
  token_symbol?: string;
  twitter_url?: string;
  telegram_url?: string;
  website_url?: string;
  updated_at: string;
}

export async function getCachedMetadata(projectId: string, tokenAddress: string): Promise<CachedMetadata | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('metadata_cache')
      .select('*')
      .eq('project_id', projectId)
      .eq('token_address', tokenAddress)
      .gt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 days
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      return null;
    }

    return data as CachedMetadata;
  } catch (error) {
    return null;
  }
}

export async function saveCachedMetadata(metadata: Omit<CachedMetadata, 'updated_at'>): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const { error } = await supabase
      .from('metadata_cache')
      .upsert({
        ...metadata,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id,token_address',
      });

    if (error) {
      return;
    }

  } catch (error) {
  }
}
