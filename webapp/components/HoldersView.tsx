'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Users, TrendingUp, Clock } from 'lucide-react';
import { Area, AreaChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { HoldersResponse } from '@/app/api/holders/[slug]/route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

type HolderTimeframe = '7D' | '30D' | '90D' | 'ALL';

const getChartConfig = (primaryColor: string): ChartConfig => ({
  holders: {
    label: 'Holders',
    color: primaryColor,
  },
  change: {
    label: 'Change',
    color: primaryColor,
  },
});

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

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!holdersData?.snapshots || holdersData.snapshots.length === 0) return [];

    return holdersData.snapshots.map((snapshot) => ({
      date: new Date(snapshot.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: snapshot.timestamp,
      holders: snapshot.holder_count,
    }));
  }, [holdersData]);

  // Calculate change data for the second chart
  const changeData = useMemo(() => {
    if (!chartData || chartData.length < 2) return [];

    return chartData.map((point, idx) => {
      if (idx === 0) {
        return { ...point, change: 0 };
      }
      const change = point.holders - chartData[idx - 1].holders;
      return { ...point, change };
    });
  }, [chartData]);

  // Get chart config with project color
  const chartConfig = useMemo(() =>
    getChartConfig(primaryColor),
    [primaryColor]
  );

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
        <div className="grid gap-4 grid-cols-1 pt-16 md:pt-0 h-auto md:h-full md:grid-rows-2">
          {/* Holder Count Growth Area Chart */}
          <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" style={{ color: primaryColor }} />
                Holder Count Over Time
              </CardTitle>
              <CardDescription className="text-white/60">
                Total Token Holders - Updates Every Hour
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 md:min-h-0">
              <ChartContainer config={chartConfig} className="w-full h-[250px] md:h-full">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillHolders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-holders)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-holders)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-white/10" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="bg-neutral-900 border-neutral-800"
                        labelFormatter={(value) => `Date: ${value}`}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="holders"
                    stroke="var(--color-holders)"
                    fill="url(#fillHolders)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Daily Holder Change Line Chart */}
          <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" style={{ color: primaryColor }} />
                Daily Holder Change
              </CardTitle>
              <CardDescription className="text-white/60">
                Day-to-Day Holder Growth Pattern
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 md:min-h-0">
              <ChartContainer config={chartConfig} className="w-full h-[250px] md:h-full">
                <LineChart data={changeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-white/10" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const absValue = Math.abs(value);
                      if (absValue >= 1000) return `${value >= 0 ? '+' : '-'}${(absValue / 1000).toFixed(1)}K`;
                      return value >= 0 ? `+${value}` : `${value}`;
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="bg-neutral-900 border-neutral-800"
                        labelFormatter={(value) => `Date: ${value}`}
                        formatter={(value) => {
                          const num = Number(value);
                          return num >= 0 ? `+${formatNumber(num)}` : formatNumber(num);
                        }}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="change"
                    stroke="var(--color-change)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
