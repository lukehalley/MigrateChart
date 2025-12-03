'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TokenStats as TokenStatsType, Timeframe } from '@/lib/types';

interface TokenStatsProps {
  stats: TokenStatsType | null;
  isLoading: boolean;
  timeframe?: Timeframe;
  displayMode?: 'price' | 'marketCap';
  avgDailyFees?: number;
}

export default function TokenStats({ stats, isLoading, timeframe = '1D', displayMode = 'price', avgDailyFees }: TokenStatsProps) {
  const prevStats = useRef<TokenStatsType | null>(null);
  const [flashingFields, setFlashingFields] = useState<Set<string>>(new Set());

  const timeframeLabel = timeframe === 'MAX' ? 'ALL TIME' : timeframe;

  useEffect(() => {
    if (!stats || !prevStats.current) {
      prevStats.current = stats;
      return;
    }

    const updated = new Set<string>();

    // Only track price and priceChange for flash animation
    if (stats.price !== prevStats.current.price) updated.add('price');
    if (stats.priceChange24h !== prevStats.current.priceChange24h) updated.add('priceChange');

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
        {/* Price Card Skeleton - matches loaded state exactly */}
        <div className="stat-card">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="h-[9px] bg-gray-700/50 mb-1.5 w-[55px] rounded"></div>
              <div className="h-[24px] bg-gray-700/50 mb-1 w-[90px] rounded"></div>
              <div className="h-[14px] bg-gray-700/50 w-[50px] rounded"></div>
            </div>
            <div className="flex-1 text-right">
              <div className="h-[9px] bg-gray-700/50 mb-1.5 w-[60px] ml-auto rounded"></div>
              <div className="h-[16px] bg-gray-700/50 w-[70px] ml-auto rounded"></div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="dashed-divider opacity-30"></div>

        {/* Liquidity and Market Cap Skeleton */}
        <div className="stat-card">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="h-[9px] bg-gray-700/50 mb-1.5 w-[55px] rounded"></div>
              <div className="h-[16px] bg-gray-700/50 w-[75px] rounded"></div>
            </div>
            <div className="flex-1 text-right">
              <div className="h-[9px] bg-gray-700/50 mb-1.5 w-[50px] ml-auto rounded"></div>
              <div className="h-[16px] bg-gray-700/50 w-[80px] ml-auto rounded"></div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="dashed-divider opacity-30"></div>

        {/* Volume Skeleton */}
        <div className="stat-card">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="h-[9px] bg-gray-700/50 mb-1.5 w-[45px] rounded"></div>
              <div className="h-[16px] bg-gray-700/50 w-[70px] rounded"></div>
            </div>
            <div className="flex-1 text-right">
              <div className="h-[9px] bg-gray-700/50 mb-1.5 w-[50px] ml-auto rounded"></div>
              <div className="h-[16px] bg-gray-700/50 w-[75px] ml-auto rounded"></div>
            </div>
          </div>
        </div>

        {/* Fees Skeleton - always show placeholder since fees often exists */}
        <div className="stat-card">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="h-[9px] bg-gray-700/50 mb-1.5 w-[35px] rounded"></div>
              <div className="h-[16px] bg-gray-700/50 w-[65px] rounded"></div>
            </div>
            <div className="flex-1 text-right">
              <div className="h-[9px] bg-gray-700/50 mb-1.5 w-[55px] ml-auto rounded"></div>
              <div className="h-[16px] bg-gray-700/50 w-[75px] ml-auto rounded"></div>
            </div>
          </div>
        </div>

        {/* Avg Daily Fees Skeleton - if avgDailyFees prop suggests it will be shown */}
        {avgDailyFees !== undefined && (
          <div className="stat-card">
            <div className="h-[9px] bg-gray-700/50 mb-1.5 w-[90px] rounded"></div>
            <div className="h-[16px] bg-gray-700/50 w-[70px] rounded"></div>
          </div>
        )}

        {/* Divider */}
        <div className="dashed-divider opacity-30"></div>

        {/* Holders Skeleton */}
        <div className="stat-card">
          <div className="h-[9px] bg-gray-700/50 mb-1.5 w-[50px] rounded"></div>
          <div className="h-[16px] bg-gray-700/50 w-[55px] rounded"></div>
        </div>

        {/* Divider */}
        <div className="dashed-divider opacity-30"></div>

        {/* Transactions Skeleton */}
        <div className="stat-card">
          <div className="h-[9px] bg-gray-700/50 mb-2 w-[110px] mx-auto rounded"></div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="h-[8px] bg-gray-700/50 mb-1 w-[28px] mx-auto rounded"></div>
              <div className="h-[16px] bg-gray-700/50 w-[35px] mx-auto rounded"></div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="h-[8px] bg-gray-700/50 mb-1 w-[32px] mx-auto rounded"></div>
              <div className="h-[16px] bg-gray-700/50 w-[35px] mx-auto rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Price Card - Enhanced Typography */}
      <motion.div
        className="stat-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3">
          {/* Current price */}
          <div className="flex-1">
            <p className="text-white text-[9px] tracking-wider mb-1.5">PRICE USD</p>
            <p className={`text-white text-xl font-bold select-text mb-1 ${flashingFields.has('price') ? 'flash-update' : ''}`}>
              {formatPrice(stats.price)}
            </p>
            <p
              className={`text-sm font-bold select-text ${flashingFields.has('priceChange') ? 'flash-update' : ''}`}
              style={{
                color: stats.priceChange24h > 0
                  ? 'var(--primary-color)'
                  : stats.priceChange24h < 0
                  ? '#C95252'
                  : 'rgb(115, 115, 115)'
              }}
            >
              {formatPercent(stats.priceChange24h)}
            </p>
          </div>
          {/* ATH */}
          {stats.allTimeHighMarketCap !== undefined && (
            <div className="flex-1 text-right">
              {displayMode === 'price' ? (
                <>
                  <p className="text-white text-[9px] tracking-wider mb-1.5">ATH PRICE</p>
                  <p className="text-white text-base select-text">
                    {formatPrice(stats.allTimeHighMarketCap / 1_000_000_000)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white text-[9px] tracking-wider mb-1.5">ATH MCAP</p>
                  <p className="text-white text-base select-text">
                    {formatNumber(stats.allTimeHighMarketCap)}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="dashed-divider"></div>

      {/* Liquidity and Market Cap */}
      <motion.div
        className="stat-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-white text-[9px]  tracking-wider mb-1.5">LIQUIDITY</p>
            <p className="text-white text-base  font-bold select-text">
              {formatNumber(stats.liquidity)}
            </p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-white text-[9px]  tracking-wider mb-1.5">MKT CAP</p>
            <p className="text-white text-base  font-bold select-text">
              {formatNumber(stats.marketCap)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Divider */}
      <div className="dashed-divider"></div>

      {/* Volume */}
      <motion.div
        className="stat-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-white text-[9px]  tracking-wider mb-1.5">VOLUME</p>
            <p className="text-white text-base  font-bold select-text">
              {formatNumber(stats.volume24h)}
            </p>
          </div>
          {stats.allTimeVolume !== undefined && timeframeLabel !== 'ALL TIME' && (
            <div className="flex-1 text-right">
              <p className="text-white text-[9px]  tracking-wider mb-1.5">VOL ATH</p>
              <p className="text-white text-base  select-text">
                {formatNumber(stats.allTimeVolume)}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Fees */}
      {stats.fees24h !== undefined && (
        <>
        <motion.div
          className="stat-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-white text-[9px]  tracking-wider mb-1.5">FEES</p>
              <p className="text-white text-base  font-bold select-text">
                {formatNumber(stats.fees24h)}
              </p>
            </div>
            {stats.allTimeFees !== undefined && timeframeLabel !== 'ALL TIME' && (
              <div className="flex-1 text-right">
                <p className="text-white text-[9px]  tracking-wider mb-1.5">FEES ATH</p>
                <p className="text-white text-base  select-text">
                  {formatNumber(stats.allTimeFees)}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {avgDailyFees !== undefined && (
          <motion.div
            className="stat-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white text-[9px]  tracking-wider mb-1.5">AVG DAILY FEES</p>
            <p className="text-white text-base  font-bold select-text">
              {formatNumber(avgDailyFees)}
            </p>
          </motion.div>
        )}

        <div className="dashed-divider"></div>
        </>
      )}

      {/* Holders */}
      {stats.holders !== undefined && (
        <>
        <motion.div
          className="stat-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-white text-[9px]  tracking-wider mb-1.5">HOLDERS</p>
          <p className="text-white text-base  font-bold select-text">
            {formatCount(stats.holders)}
          </p>
        </motion.div>

        <div className="dashed-divider"></div>
        </>
      )}

      {/* Transactions */}
      {(stats.buyCount24h || stats.sellCount24h) && (
        <motion.div
          className="stat-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-white text-[9px]  tracking-wider mb-2 text-center">TRANSACTIONS 24H</p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-white text-[8px]  tracking-wider mb-1">BUYS</p>
              <p className="text-[#52C97D] text-base  font-bold select-text">
                {stats.buyCount24h || 0}
              </p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <p className="text-white text-[8px]  tracking-wider mb-1">SELLS</p>
              <p className="text-[#ef5350] text-base  font-bold select-text">
                {stats.sellCount24h || 0}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
