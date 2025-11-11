import { SMA, EMA, RSI, BollingerBands } from 'technicalindicators';
import { Time } from 'lightweight-charts';

export interface IndicatorData {
  time: Time;
  value: number;
}

export interface BollingerBandData {
  time: Time;
  upper: number;
  middle: number;
  lower: number;
}

export interface OHLCData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(data: OHLCData[], period: number): IndicatorData[] {
  if (data.length < period) return [];

  const closes = data.map(d => d.close);
  const smaValues = SMA.calculate({ period, values: closes });

  // Skip the first (period - 1) data points since SMA needs warmup
  return smaValues.map((value, index) => ({
    time: data[index + period - 1].time as Time,
    value,
  }));
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(data: OHLCData[], period: number): IndicatorData[] {
  if (data.length < period) return [];

  const closes = data.map(d => d.close);
  const emaValues = EMA.calculate({ period, values: closes });

  return emaValues.map((value, index) => ({
    time: data[index + period - 1].time as Time,
    value,
  }));
}

/**
 * Calculate Relative Strength Index
 */
export function calculateRSI(data: OHLCData[], period: number = 14): IndicatorData[] {
  if (data.length < period + 1) return [];

  const closes = data.map(d => d.close);
  const rsiValues = RSI.calculate({ period, values: closes });

  return rsiValues.map((value, index) => ({
    time: data[index + period].time as Time,
    value,
  }));
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  data: OHLCData[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandData[] {
  if (data.length < period) return [];

  const closes = data.map(d => d.close);
  const bbValues = BollingerBands.calculate({
    period,
    values: closes,
    stdDev
  });

  return bbValues.map((bb, index) => ({
    time: data[index + period - 1].time as Time,
    upper: bb.upper,
    middle: bb.middle,
    lower: bb.lower,
  }));
}

/**
 * Available indicator types
 */
export type IndicatorType = 'sma20' | 'sma50' | 'sma200' | 'ema20' | 'ema50' | 'ema200' | 'rsi' | 'bb';

/**
 * Indicator configuration
 */
export const INDICATORS: Record<IndicatorType, { label: string; color: string; period?: number }> = {
  sma20: { label: 'SMA 20', color: '#FFA500', period: 20 },
  sma50: { label: 'SMA 50', color: '#FF6B6B', period: 50 },
  sma200: { label: 'SMA 200', color: '#4ECDC4', period: 200 },
  ema20: { label: 'EMA 20', color: '#FFD700', period: 20 },
  ema50: { label: 'EMA 50', color: '#FF69B4', period: 50 },
  ema200: { label: 'EMA 200', color: '#9370DB', period: 200 },
  rsi: { label: 'RSI 14', color: '#F7931A' },
  bb: { label: 'BB 20', color: '#8B93FF' },
};
