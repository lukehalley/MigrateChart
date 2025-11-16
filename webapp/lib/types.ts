export interface OHLCData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PoolData {
  pool_name: string;
  pool_address: string;
  token_symbol: string;
  data: OHLCData[];
}

export interface GeckoTerminalResponse {
  data: {
    attributes: {
      ohlcv_list: [number, number, number, number, number, number][]; // [timestamp, open, high, low, close, volume]
    };
  };
}

export interface PeakTrough {
  time: number;
  value: number;
  type: 'peak' | 'trough';
}

export interface Migration {
  name: string;
  timestamp: number;
  label: string;
}

// Legacy POOLS and MIGRATION_DATES constants removed
// Projects are now loaded dynamically from Supabase database
// See ProjectConfig, PoolConfig, and MigrationConfig types below

export type Timeframe = '1H' | '4H' | '8H' | '1D' | 'MAX';

export const TIMEFRAME_TO_JUPITER_INTERVAL: Record<Timeframe, string> = {
  '1H': '1_HOUR',
  '4H': '4_HOUR',
  '8H': '8_HOUR',
  '1D': '1_DAY',
  'MAX': '1_DAY', // MAX uses 1 day intervals for complete history
} as const;

export const TIMEFRAME_TO_GECKOTERMINAL: Record<Timeframe, string> = {
  '1H': 'hour',
  '4H': 'hour', // GeckoTerminal doesn't have 4H, use hour and filter
  '8H': 'hour', // GeckoTerminal doesn't have 8H, use hour and filter
  '1D': 'day',
  'MAX': 'day',
} as const;

export interface TokenStats {
  price: number;
  priceChange24h: number;
  volume24h: number;
  fees24h?: number;
  allTimeVolume?: number;
  allTimeFees?: number;
  marketCap: number;
  allTimeHighMarketCap?: number;
  liquidity: number;
  allTimeHighLiquidity?: number;
  holders?: number;
  buyCount24h?: number;
  sellCount24h?: number;
  twitter?: string;
  telegram?: string;
  website?: string;
}

// Multi-tenant project configuration types
export interface ProjectConfig {
  id: string;
  slug: string;
  name: string;
  primaryColor: string;
  logoUrl: string;
  loaderSvg: string;
  donationAddress: string;
  isDefault: boolean;
  isActive: boolean;
  pools: PoolConfig[];
  migrations: MigrationConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface PoolConfig {
  id: string;
  projectId: string;
  poolAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  poolName: string;
  dexType: string;
  color?: string;
  orderIndex: number;
  feeRate: number; // Decimal fee rate (e.g., 0.008 for 0.8%, 0 for no fees)
  createdAt: string;
}

export interface MigrationConfig {
  id: string;
  projectId: string;
  fromPoolId: string | null;
  toPoolId: string;
  migrationTimestamp: number;
  label: string;
  createdAt: string;
}

// Simple project list item for dropdown
export interface ProjectListItem {
  slug: string;
  name: string;
  primaryColor: string;
  logoUrl: string;
}
