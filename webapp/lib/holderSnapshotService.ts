import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Service for managing holder count snapshots
 * Stores periodic snapshots for time-series tracking
 */

export interface HolderSnapshot {
  project_id: string;
  token_address: string;
  holder_count: number;
  timestamp: number;
}

export interface HolderSnapshotData {
  timestamp: number;
  holder_count: number;
}

/**
 * Save a holder count snapshot to the database
 */
export async function saveHolderSnapshot(
  projectId: string,
  tokenAddress: string,
  holderCount: number
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot save holder snapshot');
    return false;
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);

    const { error } = await supabase
      .from('holder_snapshots')
      .upsert(
        {
          project_id: projectId,
          token_address: tokenAddress,
          holder_count: holderCount,
          timestamp,
        },
        {
          onConflict: 'project_id,token_address,timestamp',
          ignoreDuplicates: false,
        }
      );

    if (error) {
      console.error('Error saving holder snapshot:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving holder snapshot:', error);
    return false;
  }
}

/**
 * Get holder snapshots for a project/token within a time range
 */
export async function getHolderSnapshots(
  projectId: string,
  tokenAddress: string,
  startTimestamp?: number,
  endTimestamp?: number
): Promise<HolderSnapshotData[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    let query = supabase
      .from('holder_snapshots')
      .select('timestamp, holder_count')
      .eq('project_id', projectId)
      .eq('token_address', tokenAddress)
      .order('timestamp', { ascending: true });

    if (startTimestamp !== undefined) {
      query = query.gte('timestamp', startTimestamp);
    }

    if (endTimestamp !== undefined) {
      query = query.lte('timestamp', endTimestamp);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching holder snapshots:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching holder snapshots:', error);
    return [];
  }
}

/**
 * Get the latest holder snapshot for a project/token
 */
export async function getLatestHolderSnapshot(
  projectId: string,
  tokenAddress: string
): Promise<HolderSnapshotData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('holder_snapshots')
      .select('timestamp, holder_count')
      .eq('project_id', projectId)
      .eq('token_address', tokenAddress)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Delete old snapshots beyond a certain retention period
 * @param retentionDays Number of days to keep snapshots
 */
export async function cleanupOldSnapshots(retentionDays: number = 365): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  try {
    const cutoffTimestamp = Math.floor(Date.now() / 1000) - (retentionDays * 86400);

    const { error, count } = await supabase
      .from('holder_snapshots')
      .delete()
      .lt('timestamp', cutoffTimestamp);

    if (error) {
      console.error('Error cleaning up old snapshots:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error cleaning up old snapshots:', error);
    return 0;
  }
}
