'use client';

import { useEffect, useRef, useState } from 'react';
import { TokenStats as TokenStatsType, Timeframe } from '@/lib/types';

interface TokenStatsProps {
  stats: TokenStatsType | null;
  isLoading: boolean;
  timeframe?: Timeframe;
}

export default function TokenStats({ stats, isLoading, timeframe = '1D' }: TokenStatsProps) {
  const prevStats = useRef<TokenStatsType | null>(null);
  const [flashingFields, setFlashingFields] = useState<Set<string>>(new Set());

  // Format timeframe label for display
  const timeframeLabel = timeframe === 'MAX' ? 'ALL TIME' : timeframe;

  useEffect(() => {
    if (!stats || !prevStats.current) {
      prevStats.current = stats;
      return;
    }

    const updated = new Set<string>();

    if (stats.price !== prevStats.current.price) updated.add('price');
    if (stats.priceChange24h !== prevStats.current.priceChange24h) updated.add('priceChange');
    if (stats.liquidity !== prevStats.current.liquidity) updated.add('liquidity');
    if (stats.marketCap !== prevStats.current.marketCap) updated.add('marketCap');
    if (stats.volume24h !== prevStats.current.volume24h) updated.add('volume');
    if (stats.fees24h !== prevStats.current.fees24h) updated.add('fees');
    if (stats.holders !== prevStats.current.holders) updated.add('holders');
    if (stats.buyCount24h !== prevStats.current.buyCount24h) updated.add('buys');
    if (stats.sellCount24h !== prevStats.current.sellCount24h) updated.add('sells');

    if (updated.size > 0) {
      setFlashingFields(updated);
      const timer = setTimeout(() => setFlashingFields(new Set()), 600);
      prevStats.current = stats;
      return () => clearTimeout(timer);
    }

    prevStats.current = stats;
  }, [stats]);
  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(decimals)}B`;
    } else if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(decimals)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(decimals)}K`;
    } else {
      return `$${num.toFixed(decimals)}`;
    }
  };

  const formatCount = (num: number, decimals: number = 2): string => {
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(decimals)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(decimals)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(decimals)}K`;
    } else {
      return `${num.toFixed(0)}`;
    }
  };

  const formatPrice = (price: number): string => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };

  const formatPercent = (percent: number): string => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  if (isLoading || !stats) {
    return (
      <div className="animate-pulse space-y-0">
        {/* Price Card Skeleton */}
        <div className="stat-card">
          <div className="h-3 bg-gray-700/50 mb-2 w-20"></div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 bg-gray-700/50 w-24"></div>
            <div className="h-3 bg-gray-700/50 w-10"></div>
          </div>
          <div className="h-4 bg-gray-700/50 w-16"></div>
        </div>

        {/* Divider */}
        <div className="dashed-divider opacity-30"></div>

        {/* Liquidity Card Skeleton */}
        <div className="stat-card">
          <div className="h-3 bg-gray-700/50 mb-2 w-16"></div>
          <div className="h-5 bg-gray-700/50 w-20"></div>
        </div>

        {/* Market Cap Card Skeleton */}
        <div className="stat-card">
          <div className="h-3 bg-gray-700/50 mb-2 w-16"></div>
          <div className="h-5 bg-gray-700/50 w-20"></div>
        </div>

        {/* Divider */}
        <div className="dashed-divider opacity-30"></div>

        {/* Volume Card Skeleton */}
        <div className="stat-card">
          <div className="h-3 bg-gray-700/50 mb-2 w-24"></div>
          <div className="h-5 bg-gray-700/50 w-20"></div>
        </div>

        {/* Fees Card Skeleton */}
        <div className="stat-card">
          <div className="h-3 bg-gray-700/50 mb-2 w-20"></div>
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-700/50 w-16"></div>
            <div className="flex-1 space-y-1">
              <div className="h-2 bg-gray-700/50 w-full"></div>
              <div className="h-2 bg-gray-700/50 w-full"></div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="dashed-divider opacity-30"></div>

        {/* Holders Card Skeleton */}
        <div className="stat-card">
          <div className="h-3 bg-gray-700/50 mb-2 w-16"></div>
          <div className="h-5 bg-gray-700/50 w-16"></div>
        </div>

        {/* Divider */}
        <div className="dashed-divider opacity-30"></div>

        {/* Transactions Card Skeleton */}
        <div className="stat-card">
          <div className="h-3 bg-gray-700/50 mb-2 w-20 mx-auto"></div>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="h-3 bg-gray-700/50 w-10 mb-1 mx-auto"></div>
              <div className="h-4 bg-gray-700/50 w-8 mx-auto"></div>
            </div>
            <div className="text-center">
              <div className="h-3 bg-gray-700/50 w-10 mb-1 mx-auto"></div>
              <div className="h-4 bg-gray-700/50 w-8 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Price Card */}
      <div className="stat-card">
        <p className="text-white text-[10px] font-medium mb-1">PRICE (USD)</p>
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`text-white text-lg font-bold select-text ${flashingFields.has('price') ? 'flash-update' : ''}`}>
            {formatPrice(stats.price)}
          </p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-[#52C97D] rounded-full animate-pulse"></div>
            <span className="text-[#52C97D] text-[8px] font-bold">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <p
            className={`text-sm font-semibold select-text ${
              stats.priceChange24h >= 0 ? 'text-[#52C97D]' : 'text-[#ef5350]'
            } ${flashingFields.has('priceChange') ? 'flash-update' : ''}`}
          >
            {formatPercent(stats.priceChange24h)}
          </p>
          <span className="text-white/50 text-[8px]">({timeframeLabel})</span>
        </div>
      </div>

      {/* Divider */}
      <div className="dashed-divider"></div>

      {/* Liquidity Card */}
      <div className="stat-card">
        <p className="text-white text-[10px] font-medium mb-1">LIQUIDITY</p>
        <p className={`text-white text-base font-bold select-text ${flashingFields.has('liquidity') ? 'flash-update' : ''}`}>
          {formatNumber(stats.liquidity)}
        </p>
      </div>

      {/* Market Cap Card */}
      <div className="stat-card">
        <p className="text-white text-[10px] font-medium mb-1">MKT CAP</p>
        <p className={`text-white text-base font-bold select-text ${flashingFields.has('marketCap') ? 'flash-update' : ''}`}>
          {formatNumber(stats.marketCap)}
        </p>
      </div>

      {/* Divider */}
      <div className="dashed-divider"></div>

      {/* Volume Card - Dynamic Timeframe */}
      <div className="stat-card">
        <p className="text-white text-[10px] font-medium mb-1">VOLUME ({timeframeLabel})</p>
        <p className={`text-white text-base font-bold select-text ${flashingFields.has('volume') ? 'flash-update' : ''}`}>
          {formatNumber(stats.volume24h)}
        </p>
      </div>

      {/* Fees Card - Dynamic Timeframe */}
      {stats.fees24h !== undefined && (
        <>
        <div className="stat-card">
          <p className="text-white text-[10px] font-medium mb-1">FEES ({timeframeLabel})</p>
          <div className="flex items-center gap-2">
            {/* Total on left */}
            <p className={`text-white text-base font-bold select-text ${flashingFields.has('fees') ? 'flash-update' : ''}`}>
              {formatNumber(stats.fees24h)}
            </p>
            {/* Split on right - values then labels */}
            <div className="flex-1 text-[8px] text-gray-400 space-y-0.5">
              <div className="flex items-center justify-end gap-1">
                <span className="text-white font-medium">{formatNumber(stats.fees24h * 0.8)}</span>
                <span>(Project 80%)</span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <span className="text-white font-medium">{formatNumber(stats.fees24h * 0.2)}</span>
                <span>(Meteora 20%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="dashed-divider"></div>
        </>
      )}

      {/* Holders Card */}
      {stats.holders !== undefined && (
        <>
        <div className="stat-card">
          <p className="text-white text-[10px] font-medium mb-1">HOLDERS</p>
          <p className={`text-white text-base font-bold select-text ${flashingFields.has('holders') ? 'flash-update' : ''}`}>
            {formatCount(stats.holders)}
          </p>
        </div>

        {/* Divider */}
        <div className="dashed-divider"></div>
        </>
      )}

      {/* Transactions Card */}
      {(stats.buyCount24h || stats.sellCount24h) && (
        <>
        <div className="stat-card">
          <p className="text-white text-[10px] font-medium mb-1 text-center">TXNS (24H)</p>
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-white text-[9px] font-medium mb-0.5">BUYS</p>
              <p className={`text-[#52C97D] font-bold text-sm select-text ${flashingFields.has('buys') ? 'flash-update' : ''}`}>
                {stats.buyCount24h || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white text-[9px] font-medium mb-0.5">SELLS</p>
              <p className={`text-[#ef5350] font-bold text-sm select-text ${flashingFields.has('sells') ? 'flash-update' : ''}`}>
                {stats.sellCount24h || 0}
              </p>
            </div>
          </div>
        </div>
        </>
      )}

    </div>
  );
}
