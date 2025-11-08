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

export const POOLS = {
  mon3y: {
    address: '95AT5r4i85gfqeew2yR6BYFG8RLrY1d9ztPs7qrSKDVc',
    name: 'M0N3Y (Original)',
    token_symbol: 'M0N3Y',
    color: '#FF6B6B',
  },
  zera_Raydium: {
    address: 'Nn9VMHJTqgG9L9F8SP3GEuFWC5zVuHrADCwehh7N7Di',
    name: 'ZERA Raydium',
    token_symbol: 'ZERA',
    color: '#4ECDC4',
  },
  zera_Meteora: {
    address: '6oUJD1EHNVBNMeTpytmY2NxKWicz5C2JUbByUrHEsjhc',
    name: 'ZERA Meteora',
    token_symbol: 'ZERA',
    color: '#52C97D',
  },
} as const;

export const MIGRATION_DATES = {
  mon3y_to_zera: {
    timestamp: 1759363200, // October 2, 2025 08:00:00 UTC
    label: 'MON3Y → Raydium',
  },
  zera_Raydium_to_Meteora: {
    timestamp: 1762300800, // November 5, 2025 08:00:00 UTC
    label: 'Raydium → Meteora',
  },
} as const;

export type Timeframe = '1H' | '4H' | '1D' | '1W';

export const TIMEFRAME_TO_JUPITER_INTERVAL: Record<Timeframe, string> = {
  '1H': '1_HOUR',
  '4H': '4_HOUR',
  '1D': '1_DAY',
  '1W': '1_WEEK',
} as const;

export interface TokenStats {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders?: number;
  buyCount24h?: number;
  sellCount24h?: number;
  twitter?: string;
  telegram?: string;
  website?: string;
}
