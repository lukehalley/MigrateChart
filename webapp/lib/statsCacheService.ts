import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Service for caching token statistics, holder counts, and metadata
 * Reduces API calls by caching computed aggregates and semi-static data
 */

// ========== ALL-TIME STATISTICS CACHE ==========

export interface CachedStats {
  token_address: string;
  all_time_volume: number;
  all_time_fees: number;
  all_time_high_price: number;
  all_time_high_market_cap: number;
  updated_at: string;
}

export async function getCachedStats(tokenAddress: string): Promise<CachedStats | null> {
  if (!isSupabaseConfigured()) {
    console.log('[Stats Cache] Supabase not configured, skipping cache');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('stats_cache')
      .select('*')
      .eq('token_address', tokenAddress)
      .gt('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 hours
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        console.log(`[Stats Cache] No cached stats found for ${tokenAddress}`);
        return null;
      }
      console.error('[Stats Cache] Error fetching from cache:', error);
      return null;
    }

    console.log(`[Stats Cache] Retrieved cached stats for ${tokenAddress}`);
    return data as CachedStats;
  } catch (error) {
    console.error('[Stats Cache] Error accessing cache:', error);
    return null;
  }
}

export async function saveCachedStats(stats: Omit<CachedStats, 'updated_at'>): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[Stats Cache] Supabase not configured, skipping cache save');
    return;
  }

  try {
    const { error } = await supabase
      .from('stats_cache')
      .upsert({
        ...stats,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'token_address',
      });

    if (error) {
      console.error('[Stats Cache] Error saving to cache:', error);
      return;
    }

    console.log(`[Stats Cache] Saved stats for ${stats.token_address}`);
  } catch (error) {
    console.error('[Stats Cache] Error saving to cache:', error);
  }
}

// ========== HOLDER COUNT CACHE ==========

export interface CachedHolderCount {
  token_address: string;
  holder_count: number;
  updated_at: string;
}

export async function getCachedHolderCount(tokenAddress: string): Promise<number | null> {
  if (!isSupabaseConfigured()) {
    console.log('[Holder Cache] Supabase not configured, skipping cache');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('holder_cache')
      .select('*')
      .eq('token_address', tokenAddress)
      .gt('updated_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // 1 hour
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[Holder Cache] No cached holder count found for ${tokenAddress}`);
        return null;
      }
      console.error('[Holder Cache] Error fetching from cache:', error);
      return null;
    }

    console.log(`[Holder Cache] Retrieved cached holder count for ${tokenAddress}: ${data.holder_count}`);
    return data.holder_count;
  } catch (error) {
    console.error('[Holder Cache] Error accessing cache:', error);
    return null;
  }
}

export async function saveCachedHolderCount(tokenAddress: string, holderCount: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[Holder Cache] Supabase not configured, skipping cache save');
    return;
  }

  try {
    const { error } = await supabase
      .from('holder_cache')
      .upsert({
        token_address: tokenAddress,
        holder_count: holderCount,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'token_address',
      });

    if (error) {
      console.error('[Holder Cache] Error saving to cache:', error);
      return;
    }

    console.log(`[Holder Cache] Saved holder count for ${tokenAddress}: ${holderCount}`);
  } catch (error) {
    console.error('[Holder Cache] Error saving to cache:', error);
  }
}

// ========== METADATA CACHE ==========

export interface CachedMetadata {
  token_address: string;
  pool_address?: string;
  token_symbol?: string;
  twitter_url?: string;
  telegram_url?: string;
  website_url?: string;
  updated_at: string;
}

export async function getCachedMetadata(tokenAddress: string): Promise<CachedMetadata | null> {
  if (!isSupabaseConfigured()) {
    console.log('[Metadata Cache] Supabase not configured, skipping cache');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('metadata_cache')
      .select('*')
      .eq('token_address', tokenAddress)
      .gt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 days
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[Metadata Cache] No cached metadata found for ${tokenAddress}`);
        return null;
      }
      console.error('[Metadata Cache] Error fetching from cache:', error);
      return null;
    }

    console.log(`[Metadata Cache] Retrieved cached metadata for ${tokenAddress}`);
    return data as CachedMetadata;
  } catch (error) {
    console.error('[Metadata Cache] Error accessing cache:', error);
    return null;
  }
}

export async function saveCachedMetadata(metadata: Omit<CachedMetadata, 'updated_at'>): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[Metadata Cache] Supabase not configured, skipping cache save');
    return;
  }

  try {
    const { error } = await supabase
      .from('metadata_cache')
      .upsert({
        ...metadata,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'token_address',
      });

    if (error) {
      console.error('[Metadata Cache] Error saving to cache:', error);
      return;
    }

    console.log(`[Metadata Cache] Saved metadata for ${metadata.token_address}`);
  } catch (error) {
    console.error('[Metadata Cache] Error saving to cache:', error);
  }
}
