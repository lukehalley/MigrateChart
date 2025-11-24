import { Connection, PublicKey } from '@solana/web3.js';
import { supabase } from './supabase';

const ZERA_MINT = '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA';
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '6f701558-9fd6-4d38-9159-74b7f4c958e9';
const BITQUERY_API_KEY = process.env.BITQUERY_API_KEY || 'ory_at_OqO0TXPRByW2UiXPe_kakXXEl_lXuDORXafygPyAM-k.8UV-ZIOESYhFSl8xDtffVJAlVG18LWLxXrIEkbgsPro';
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';

// Known initial supply
const INITIAL_SUPPLY = 999_368_326; // ZERA's initial supply based on current supply

export interface DailyBurnData {
  date: string; // ISO date string
  amount: number; // Tokens burned (absolute value)
  timestamp: number; // Unix timestamp
}

export interface BurnTransaction {
  signature: string;
  timestamp: number;
  amount: number; // Tokens burned
  from: string; // Burn authority/account
}

export interface BurnStats {
  totalBurned: number;
  currentSupply: number;
  burnPercentage: number;
}

/**
 * Fetches daily burn history from database
 * Returns empty array if no data, fills in days with 0 burns
 * @param days Number of days to fetch (undefined means from first burn onwards)
 */
export async function getDailyBurnHistory(days?: number): Promise<DailyBurnData[]> {
  try {
    if (!supabase) {
      console.warn('[BURN-DATA] Supabase not configured');
      return [];
    }

    // Get ZERA project ID
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', 'zera')
      .single();

    if (!project) {
      console.warn('[BURN-DATA] ZERA project not found');
      return [];
    }

    // If days is undefined, fetch ALL burns to find the first one
    let cutoffTimestamp: number;

    if (days === undefined) {
      // Find the timestamp of the first burn
      const { data: firstBurn, error: firstBurnError } = await supabase
        .from('burn_transactions')
        .select('timestamp')
        .eq('project_id', project.id)
        .order('timestamp', { ascending: true })
        .limit(1)
        .single();

      if (firstBurnError || !firstBurn) {
        // No burns yet, return empty
        return [];
      }

      cutoffTimestamp = firstBurn.timestamp;
    } else {
      // Calculate cutoff timestamp for the number of days requested
      cutoffTimestamp = Math.floor(Date.now() / 1000) - (days * 24 * 3600);
    }

    // Fetch burns from database (only successful ones)
    const { data: burns, error } = await supabase
      .from('burn_transactions')
      .select('timestamp, amount')
      .eq('project_id', project.id)
      .eq('success', true)
      .gte('timestamp', cutoffTimestamp)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('[BURN-DATA] Error fetching burns from database:', error);
      return [];
    }

    // Aggregate burns by day
    const burnsByDay = new Map<string, number>();

    if (burns && burns.length > 0) {
      burns.forEach((burn) => {
        const date = new Date(burn.timestamp * 1000).toISOString().split('T')[0];
        const amount = typeof burn.amount === 'string' ? parseFloat(burn.amount) : burn.amount;
        burnsByDay.set(date, (burnsByDay.get(date) || 0) + amount);
      });
    }

    // Fill in all days in the range with 0 for days without burns
    const now = new Date();
    const startDate = new Date(cutoffTimestamp * 1000);
    const result: DailyBurnData[] = [];

    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().split('T')[0];
      const amount = burnsByDay.get(date) || 0;
      result.push({
        date,
        amount,
        timestamp: new Date(date).getTime() / 1000,
      });
    }

    return result;
  } catch (error) {
    console.error('[BURN-DATA] Error fetching daily burn history:', error);
    return [];
  }
}

/**
 * Fetches recent burn transactions from database
 * Returns empty array if no burns found
 */
export async function getRecentBurns(limit: number = 20): Promise<BurnTransaction[]> {
  try {
    if (!supabase) {
      console.warn('[BURN-DATA] Supabase not configured');
      return [];
    }

    // Get ZERA project ID
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', 'zera')
      .single();

    if (!project) {
      console.warn('[BURN-DATA] ZERA project not found');
      return [];
    }

    // Fetch recent burns from database (only successful ones)
    const { data: burns, error } = await supabase
      .from('burn_transactions')
      .select('signature, timestamp, amount, from_account')
      .eq('project_id', project.id)
      .eq('success', true)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[BURN-DATA] Error fetching burns from database:', error);
      return [];
    }

    if (!burns || burns.length === 0) {
      return [];
    }

    return burns.map((burn) => ({
      signature: burn.signature,
      timestamp: burn.timestamp,
      amount: typeof burn.amount === 'string' ? parseFloat(burn.amount) : burn.amount,
      from: burn.from_account,
    }));
  } catch (error) {
    console.error('[BURN-DATA] Error fetching recent burns:', error);
    return [];
  }
}

/**
 * Calculates total burned from database records
 * Returns burn statistics
 */
export async function getBurnStats(): Promise<BurnStats> {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Get ZERA project ID
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', 'zera')
      .single();

    if (!project) {
      throw new Error('ZERA project not found');
    }

    // Calculate total burned from database (only successful burns)
    const { data: burns, error } = await supabase
      .from('burn_transactions')
      .select('amount')
      .eq('project_id', project.id)
      .eq('success', true);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const totalBurned = (burns || []).reduce((sum, burn) => {
      const amount = typeof burn.amount === 'string' ? parseFloat(burn.amount) : burn.amount;
      return sum + amount;
    }, 0);

    // Get current supply from on-chain
    const connection = new Connection(RPC_ENDPOINT);
    const mintPublicKey = new PublicKey(ZERA_MINT);
    const mintInfo = await connection.getParsedAccountInfo(mintPublicKey);

    let currentSupply = INITIAL_SUPPLY;

    if (mintInfo.value && mintInfo.value.data && 'parsed' in mintInfo.value.data) {
      const parsedData = mintInfo.value.data.parsed;
      currentSupply = parsedData.info.supply / Math.pow(10, parsedData.info.decimals);
    }

    const burnPercentage = (totalBurned / INITIAL_SUPPLY) * 100;

    return {
      totalBurned,
      currentSupply,
      burnPercentage,
    };
  } catch (error) {
    console.error('[BURN-DATA] Error fetching burn stats:', error);

    // Return fallback data
    return {
      totalBurned: 0,
      currentSupply: INITIAL_SUPPLY,
      burnPercentage: 0,
    };
  }
}

/**
 * Gets comprehensive burn data for the tracker page
 * @param days Number of days to fetch history for (undefined means from first burn onwards)
 */
export async function getAllBurnData(days?: number) {
  const [stats, dailyHistory, recentBurns] = await Promise.all([
    getBurnStats(),
    getDailyBurnHistory(days),
    getRecentBurns(),
  ]);

  return {
    stats,
    dailyHistory,
    recentBurns,
  };
}
