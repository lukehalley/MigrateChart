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
    <div className="w-full h-full relative flex flex-col overflow-hidden">
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

      {/* Charts Grid - Scrollable on mobile */}
      <div className="flex-1 overflow-y-auto md:overflow-hidden p-4 md:p-6 md:min-h-0">
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 pt-16 md:pt-0 h-auto md:h-full">
          {/* Current Holder Count Card */}
          <div className="bg-black/40 backdrop-blur-sm border-2 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center min-h-[300px] md:min-h-0"
               style={{ borderColor: `${primaryColor}40` }}>
            <Users className="h-16 w-16 md:h-20 md:w-20 mb-6" style={{ color: primaryColor }} />
            <p className="text-white/60 text-base md:text-lg mb-4">Current Holders</p>
            <p className="text-white text-6xl md:text-8xl font-bold mb-2" style={{ color: primaryColor }}>
              {formatNumber(currentHolders)}
            </p>
            <p className="text-white/40 text-xs md:text-sm mt-4 flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Updates every hour
            </p>
          </div>

          {/* Daily Change Card */}
          <div className="bg-black/40 backdrop-blur-sm border-2 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center min-h-[300px] md:min-h-0"
               style={{ borderColor: `${primaryColor}40` }}>
            {dailyChange ? (
              <>
                {dailyChange.change >= 0 ? (
                  <TrendingUp className="h-16 w-16 md:h-20 md:w-20 mb-6 text-green-500" />
                ) : (
                  <TrendingDown className="h-16 w-16 md:h-20 md:w-20 mb-6 text-red-500" />
                )}
                <p className="text-white/60 text-base md:text-lg mb-4">24 Hour Change</p>
                <p className={`text-5xl md:text-7xl font-bold mb-2 ${dailyChange.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {dailyChange.change >= 0 ? '+' : ''}{formatNumber(Math.abs(dailyChange.change))}
                </p>
                <p className={`text-3xl md:text-4xl font-semibold ${dailyChange.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {dailyChange.percentChange >= 0 ? '+' : ''}{dailyChange.percentChange.toFixed(2)}%
                </p>
              </>
            ) : (
              <>
                <Clock className="h-16 w-16 md:h-20 md:w-20 mb-6 opacity-30" style={{ color: primaryColor }} />
                <p className="text-white/60 text-base md:text-lg mb-4">24 Hour Change</p>
                <p className="text-white/40 text-xl md:text-2xl text-center">
                  Collecting data...
                  <br />
                  <span className="text-sm">Check back in 24 hours</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
