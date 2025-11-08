'use client';

import { TokenStats as TokenStatsType } from '@/lib/types';

interface TokenStatsProps {
  stats: TokenStatsType | null;
  isLoading: boolean;
}

export default function TokenStats({ stats, isLoading }: TokenStatsProps) {
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
          <p className="text-white text-xl font-bold">{formatPrice(stats.price)}</p>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#52C97D] rounded-full animate-pulse"></div>
            <span className="text-[#52C97D] text-[9px] font-bold">LIVE</span>
          </div>
        </div>
        <p
          className={`text-sm font-semibold ${
            stats.priceChange24h >= 0 ? 'text-[#52C97D]' : 'text-[#ef5350]'
          }`}
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
        <p className="text-white text-lg font-bold">{formatNumber(stats.liquidity)}</p>
      </div>

      {/* Divider */}
      <div className="py-3">
        <div className="dashed-divider"></div>
      </div>

      {/* Market Cap Card */}
      <div className="stat-card">
        <p className="text-white text-[11px] font-medium mb-2">MKT CAP</p>
        <p className="text-white text-lg font-bold">{formatNumber(stats.marketCap)}</p>
      </div>

      {/* Volume 24H Card */}
      <div className="stat-card">
        <p className="text-white text-[11px] font-medium mb-2">VOLUME (24H)</p>
        <p className="text-white text-lg font-bold">{formatNumber(stats.volume24h)}</p>
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
              <p className="text-[#52C97D] font-bold text-base">{stats.buyCount24h || 0}</p>
            </div>
            <div>
              <p className="text-white text-[11px] font-medium">SELLS</p>
              <p className="text-[#ef5350] font-bold text-base">{stats.sellCount24h || 0}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="py-3">
          <div className="dashed-divider"></div>
        </div>
        </>
      )}

      {/* Social Links Card */}
      {(stats.website || stats.twitter || stats.telegram) && (
        <div className="stat-card">
          <p className="text-white text-[11px] font-medium mb-3">LINKS</p>
          <div className="flex flex-col gap-2">
            {stats.website && (
              <a
                href={stats.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#52C97D] text-xs transition-colors flex items-center gap-2"
              >
                <span>Website</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
            {stats.twitter && (
              <a
                href={stats.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#52C97D] text-xs transition-colors flex items-center gap-2"
              >
                <span>Twitter</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
            {stats.telegram && (
              <a
                href={stats.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#52C97D] text-xs transition-colors flex items-center gap-2"
              >
                <span>Telegram</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
