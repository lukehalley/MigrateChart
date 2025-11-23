'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Flame, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface BurnStats {
  totalBurned: number;
  currentSupply: number;
  burnPercentage: number;
}

interface DailyBurnData {
  date: string;
  amount: number;
  timestamp: number;
}

interface BurnTransaction {
  signature: string;
  timestamp: number;
  amount: number;
  from: string;
}

interface BurnsResponse {
  stats: BurnStats;
  dailyHistory: DailyBurnData[];
  recentBurns: BurnTransaction[];
}

const getChartConfig = (primaryColor: string): ChartConfig => ({
  amount: {
    label: 'Burned',
    color: primaryColor,
  },
});

interface BurnsViewProps {
  projectSlug: string;
  primaryColor: string;
  onOpenMobileMenu?: () => void;
}

export function BurnsView({ projectSlug, primaryColor, onOpenMobileMenu }: BurnsViewProps) {
  const { data: burnsData, error: burnsError, isLoading: burnsLoading } = useSWR<BurnsResponse>(
    `/api/burns/${projectSlug}`,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch burns data');
      return response.json();
    },
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  // Prepare chart data - daily aggregated burns
  const chartData = useMemo(() => {
    if (!burnsData?.dailyHistory) return [];

    return burnsData.dailyHistory.map((day) => ({
      date: new Date(day.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: day.amount,
      fullDate: day.date,
    }));
  }, [burnsData]);

  const chartConfig = useMemo(() => getChartConfig(primaryColor), [primaryColor]);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const truncateAddress = (address: string): string => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) {
      return 'Just now';
    } else if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      return `${mins} min${mins > 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diff / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (burnsLoading || !burnsData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/50">Loading burn data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* Mobile and Tablet: Settings Button */}
      {onOpenMobileMenu && (
        <div className="lg:hidden absolute top-3 left-3 z-30">
          <button
            onClick={onOpenMobileMenu}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-black/60 border rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors"
            style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Settings
          </button>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-black/50 border" style={{ borderColor: `${primaryColor}40` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: primaryColor }}>
                <Flame className="w-4 h-4" />
                Total Burned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(burnsData.stats.totalBurned)}</div>
              <p className="text-xs text-white/60 mt-1">ZERA Tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border" style={{ borderColor: `${primaryColor}40` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/80">
                <TrendingDown className="w-4 h-4" />
                Current Supply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(burnsData.stats.currentSupply)}</div>
              <p className="text-xs text-white/60 mt-1">ZERA Tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border" style={{ borderColor: `${primaryColor}40` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/80">
                <Activity className="w-4 h-4" />
                Burn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {burnsData.stats.burnPercentage >= 0.01
                  ? `${burnsData.stats.burnPercentage.toFixed(2)}%`
                  : burnsData.stats.burnPercentage >= 0.0001
                  ? `${burnsData.stats.burnPercentage.toFixed(4)}%`
                  : `${burnsData.stats.burnPercentage.toFixed(6)}%`
                }
              </div>
              <p className="text-xs text-white/60 mt-1">Of Initial Supply</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart - Individual Burns */}
        <Card className="bg-black/50 border" style={{ borderColor: `${primaryColor}40` }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: primaryColor }}>
              <Flame className="w-5 h-5" />
              Individual Burn Transactions
            </CardTitle>
            <CardDescription>Each bar represents one burn event - hover to see details</CardDescription>
          </CardHeader>
          <CardContent>
            {burnsData.recentBurns.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Flame className="w-12 h-12 mx-auto mb-2 opacity-20" style={{ color: primaryColor }} />
                  <p className="text-white/50">No burn history yet</p>
                  <p className="text-white/30 text-sm">Burns will appear here once they occur</p>
                </div>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                    tickFormatter={formatNumber}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;

                      const data = payload[0].payload;
                      return (
                        <div
                          className="bg-black/95 border-2 px-4 py-3 rounded-lg backdrop-blur-sm"
                          style={{ borderColor: primaryColor }}
                        >
                          <p className="text-lg font-bold mb-1" style={{ color: primaryColor }}>
                            {formatNumber(data.amount)} ZERA
                          </p>
                          <p className="text-white/70 text-xs">{data.fullDate}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="amount" fill={primaryColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Burns */}
        <Card className="bg-black/50 border" style={{ borderColor: `${primaryColor}40` }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: primaryColor }}>
              <Flame className="w-5 h-5" />
              Recent Protocol Burns
            </CardTitle>
            <CardDescription>Last 20 burn transactions (SPL Token Burns only)</CardDescription>
          </CardHeader>
          <CardContent>
            {burnsData.recentBurns.length === 0 ? (
              <div className="py-8 text-center">
                <Flame className="w-12 h-12 mx-auto mb-2 opacity-20" style={{ color: primaryColor }} />
                <p className="text-white/50">No recent burns</p>
                <p className="text-white/30 text-sm">Protocol burns will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {burnsData.recentBurns.map((burn, index) => (
                  <div
                    key={`${burn.signature}-${index}`}
                    className="border rounded-lg p-3 hover:bg-black/30 transition-colors"
                    style={{ borderColor: `${primaryColor}30` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
                        <div>
                          <p className="font-bold" style={{ color: primaryColor }}>
                            {formatNumber(burn.amount)} ZERA
                          </p>
                          <p className="text-white/50 text-xs">Burned</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/70 text-sm">{formatRelativeTime(burn.timestamp)}</p>
                        <p className="text-white/40 text-[10px]">
                          {new Date(burn.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] mb-2">
                      <span className="text-white/40">From:</span>
                      <a
                        href={`https://solscan.io/account/${burn.from}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono hover:underline"
                        style={{ color: primaryColor }}
                      >
                        {truncateAddress(burn.from)}
                      </a>
                    </div>

                    <div className="pt-2 border-t" style={{ borderColor: `${primaryColor}20` }}>
                      <a
                        href={`https://solscan.io/tx/${burn.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono hover:underline break-all"
                        style={{ color: `${primaryColor}90` }}
                      >
                        {burn.signature}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
