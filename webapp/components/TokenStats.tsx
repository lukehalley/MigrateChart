'use client';

import { useEffect, useRef, useState } from 'react';
import { TokenStats as TokenStatsType } from '@/lib/types';

interface TokenStatsProps {
  stats: TokenStatsType | null;
  isLoading: boolean;
}

export default function TokenStats({ stats, isLoading }: TokenStatsProps) {
  const prevStats = useRef<TokenStatsType | null>(null);
  const [flashingFields, setFlashingFields] = useState<Set<string>>(new Set());

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

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="stat-card">
          <div className="h-4 bg-gray-700 mb-3"></div>
          <div className="h-8 bg-gray-700 mb-2"></div>
          <div className="h-4 bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stat-card">
        <p className="text-white text-xs text-center">Unable to load stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Price Card */}
      <div className="stat-card">
        <p className="text-white text-[11px] font-medium mb-2">PRICE (USD)</p>
        <div className="flex items-center gap-2 mb-1">
          <p className={`text-white text-xl font-bold select-text ${flashingFields.has('price') ? 'flash-update' : ''}`}>
            {formatPrice(stats.price)}
          </p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#52C97D] rounded-full animate-pulse"></div>
            <span className="text-[#52C97D] text-[9px] font-bold">LIVE</span>
          </div>
        </div>
        <p
          className={`text-sm font-semibold select-text ${
            stats.priceChange24h >= 0 ? 'text-[#52C97D]' : 'text-[#ef5350]'
          } ${flashingFields.has('priceChange') ? 'flash-update' : ''}`}
        >
          {formatPercent(stats.priceChange24h)}
        </p>
      </div>

      {/* Divider */}
      <div className="py-3">
        <div className="dashed-divider"></div>
      </div>

      {/* Liquidity Card */}
      <div className="stat-card">
        <p className="text-white text-[11px] font-medium mb-2">LIQUIDITY</p>
        <p className={`text-white text-lg font-bold select-text ${flashingFields.has('liquidity') ? 'flash-update' : ''}`}>
          {formatNumber(stats.liquidity)}
        </p>
      </div>

      {/* Divider */}
      <div className="py-3">
        <div className="dashed-divider"></div>
      </div>

      {/* Market Cap Card */}
      <div className="stat-card">
        <p className="text-white text-[11px] font-medium mb-2">MKT CAP</p>
        <p className={`text-white text-lg font-bold select-text ${flashingFields.has('marketCap') ? 'flash-update' : ''}`}>
          {formatNumber(stats.marketCap)}
        </p>
      </div>

      {/* Divider */}
      <div className="py-3">
        <div className="dashed-divider"></div>
      </div>

      {/* Volume 24H Card */}
      <div className="stat-card">
        <p className="text-white text-[11px] font-medium mb-2">VOLUME (24H)</p>
        <p className={`text-white text-lg font-bold select-text ${flashingFields.has('volume') ? 'flash-update' : ''}`}>
          {formatNumber(stats.volume24h)}
        </p>
      </div>

      {/* Divider */}
      <div className="py-3">
        <div className="dashed-divider"></div>
      </div>

      {/* Transactions Card */}
      {(stats.buyCount24h || stats.sellCount24h) && (
        <>
        <div className="stat-card">
          <p className="text-white text-[11px] font-medium mb-3">TXNS (24H)</p>
          <div className="flex justify-center gap-8 text-sm">
            <div>
              <p className="text-white text-[11px] font-medium">BUYS</p>
              <p className={`text-[#52C97D] font-bold text-base select-text ${flashingFields.has('buys') ? 'flash-update' : ''}`}>
                {stats.buyCount24h || 0}
              </p>
            </div>
            <div>
              <p className="text-white text-[11px] font-medium">SELLS</p>
              <p className={`text-[#ef5350] font-bold text-base select-text ${flashingFields.has('sells') ? 'flash-update' : ''}`}>
                {stats.sellCount24h || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="py-3">
          <div className="dashed-divider"></div>
        </div>
        </>
      )}

    </div>
  );
}
