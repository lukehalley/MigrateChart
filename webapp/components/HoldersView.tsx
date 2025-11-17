'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Users, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { HoldersResponse } from '@/app/api/holders/[slug]/route';

type HolderTimeframe = '7D' | '30D' | '90D' | 'ALL';

interface HoldersViewProps {
  projectSlug: string;
  primaryColor: string;
  timeframe: HolderTimeframe;
  onTimeframeChange: (timeframe: HolderTimeframe) => void;
  onOpenMobileMenu?: () => void;
}

export function HoldersView({ projectSlug, primaryColor, timeframe, onTimeframeChange, onOpenMobileMenu }: HoldersViewProps) {

  const { data: holdersData, error: holdersError, isLoading: holdersLoading } = useSWR<HoldersResponse>(
    `/api/holders/${projectSlug}?timeframe=${timeframe}`,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch holders data');
      return response.json();
    },
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Calculate daily change (last 24 hours)
  const dailyChange = useMemo(() => {
    if (!holdersData?.snapshots || holdersData.snapshots.length < 2) return null;

    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - (24 * 60 * 60);

    // Find the snapshot closest to 24 hours ago
    const sorted = [...holdersData.snapshots].sort((a, b) => a.timestamp - b.timestamp);
    const currentCount = sorted[sorted.length - 1].holder_count;

    // Find snapshot closest to 24h ago
    let oldestInRange = sorted[0];
    for (const snapshot of sorted) {
      if (snapshot.timestamp >= oneDayAgo) {
        break;
      }
      oldestInRange = snapshot;
    }

    const change = currentCount - oldestInRange.holder_count;
    const percentChange = oldestInRange.holder_count > 0
      ? ((change / oldestInRange.holder_count) * 100)
      : 0;

    return { change, percentChange };
  }, [holdersData]);

  if (holdersLoading || !holdersData) {
    return (
      <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-black via-[#0A1F12] to-black">
        {onOpenMobileMenu && (
          <div className="md:hidden absolute top-3 left-3 z-30">
            <button
              onClick={onOpenMobileMenu}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-[#0A1F12]/90 hover:bg-[#0A1F12] border-2 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_16px_rgba(var(--primary-rgb),0.5)] transition-all backdrop-blur-sm"
              style={{ borderColor: primaryColor }}
              aria-label="Open settings"
            >
              <svg className="w-5 h-5" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        )}

        <div className="animate-pulse text-center">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: primaryColor }} />
          <p className="text-white/60">Loading holder data...</p>
        </div>
      </div>
    );
  }

  const currentHolders = holdersData.currentHolderCount || 0;

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-b from-black via-[#0A1F12] to-black p-8">
      {/* Mobile: Settings Button */}
      {onOpenMobileMenu && (
        <div className="md:hidden absolute top-3 left-3 z-30">
          <button
            onClick={onOpenMobileMenu}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-[#0A1F12]/90 hover:bg-[#0A1F12] border-2 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_16px_rgba(var(--primary-rgb),0.5)] transition-all backdrop-blur-sm"
            style={{ borderColor: primaryColor }}
            aria-label="Open settings"
          >
            <svg className="w-5 h-5" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )}

      <div className="max-w-2xl w-full">
        {/* Main Holder Count */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Users className="h-12 w-12 md:h-16 md:w-16" style={{ color: primaryColor }} />
            <div>
              <p className="text-white/60 text-sm md:text-base mb-2">Current Holders</p>
              <p className="text-white text-5xl md:text-7xl font-bold" style={{ color: primaryColor }}>
                {formatNumber(currentHolders)}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Change */}
        {dailyChange && (
          <div className="bg-black/40 backdrop-blur-sm border-2 rounded-2xl p-8 mb-8"
               style={{ borderColor: `${primaryColor}40` }}>
            <div className="text-center">
              <p className="text-white/60 text-sm md:text-base mb-3">24 Hour Change</p>
              <div className="flex items-center justify-center gap-3">
                {dailyChange.change >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
                <div>
                  <p className={`text-3xl md:text-4xl font-bold ${dailyChange.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dailyChange.change >= 0 ? '+' : ''}{formatNumber(Math.abs(dailyChange.change))}
                  </p>
                  <p className={`text-lg md:text-xl font-semibold ${dailyChange.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dailyChange.percentChange >= 0 ? '+' : ''}{dailyChange.percentChange.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Info */}
        <div className="flex items-center justify-center gap-2 text-white/40 text-xs md:text-sm">
          <Clock className="h-4 w-4" />
          <p>Data updates every hour</p>
        </div>
      </div>
    </div>
  );
}
