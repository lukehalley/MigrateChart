'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Area, AreaChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp, Users, Activity } from 'lucide-react';
import { HoldersResponse } from '@/app/api/holders/[slug]/route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

type HolderTimeframe = '7D' | '30D' | '90D' | 'ALL';

const getChartConfig = (primaryColor: string): ChartConfig => ({
  holders: {
    label: 'Holders',
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

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!holdersData?.snapshots) return [];

    return holdersData.snapshots.map((snapshot) => ({
      date: new Date(snapshot.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: snapshot.timestamp,
      holders: snapshot.holder_count,
    }));
  }, [holdersData]);

  // Get chart config with project color
  const chartConfig = useMemo(() =>
    getChartConfig(primaryColor),
    [primaryColor]
  );

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toString();
  };

  // Calculate growth metrics
  const holderGrowth = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;

    const firstValue = chartData[0].holders;
    const lastValue = chartData[chartData.length - 1].holders;
    const change = lastValue - firstValue;
    const percentChange = firstValue > 0 ? ((change / firstValue) * 100) : 0;

    return {
      change,
      percentChange,
      firstValue,
      lastValue,
    };
  }, [chartData]);

  if (holdersLoading || !holdersData) {
    return (
      <div className="w-full h-full relative flex flex-col overflow-hidden">
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

        <div className="flex-1 overflow-y-auto md:overflow-hidden p-4 md:p-6 md:min-h-0">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 pt-16 md:pt-0 h-auto md:h-full md:grid-rows-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
                <CardHeader>
                  <Skeleton className="h-6 w-48 bg-neutral-800" />
                  <Skeleton className="h-4 w-64 bg-neutral-800" />
                </CardHeader>
                <CardContent className="flex-1 pb-0 md:min-h-0">
                  <Skeleton className="w-full h-[250px] md:h-full bg-neutral-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show message if no data available yet
  if (chartData.length === 0) {
    return (
      <div className="w-full h-full relative flex flex-col overflow-hidden">
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

        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="bg-neutral-900 border border-neutral-800 max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-6 w-6" style={{ color: primaryColor }} />
                Holder Tracking Starting Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 text-sm mb-4">
                Holder data collection has been set up and will begin collecting snapshots hourly.
                Charts will appear once we have enough data points to display trends.
              </p>
              <p className="text-white/60 text-xs">
                Current holder count: {holdersData.currentHolderCount !== null ? formatNumber(holdersData.currentHolderCount) : 'Loading...'}
              </p>
            </CardContent>
          </Card>
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
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 pt-16 md:pt-0 h-auto md:h-full md:grid-rows-2">
          {/* Holder Count Growth Line Chart */}
          <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" style={{ color: primaryColor }} />
                Holder Growth Over Time
              </CardTitle>
              <CardDescription className="text-white/60">
                Total Unique Token Holders
                {holderGrowth && (
                  <span className={`ml-2 font-semibold ${holderGrowth.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {holderGrowth.change >= 0 ? '+' : ''}{formatNumber(holderGrowth.change)} ({holderGrowth.percentChange >= 0 ? '+' : ''}{holderGrowth.percentChange.toFixed(1)}%)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 md:min-h-0">
              <ChartContainer config={chartConfig} className="w-full h-[250px] md:h-full">
                <LineChart data={chartData}>
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
                  <Line
                    type="monotone"
                    dataKey="holders"
                    stroke="var(--color-holders)"
                    strokeWidth={2}
                    dot={true}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Holder Count Area Chart */}
          <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" style={{ color: primaryColor }} />
                Cumulative Holder Growth
              </CardTitle>
              <CardDescription className="text-white/60">Visualizing Community Expansion</CardDescription>
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

          {/* Daily Holder Change */}
          <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5" style={{ color: primaryColor }} />
                Daily Holder Change
              </CardTitle>
              <CardDescription className="text-white/60">Day-Over-Day Growth Pattern</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 md:min-h-0">
              <ChartContainer config={chartConfig} className="w-full h-[250px] md:h-full">
                <LineChart data={chartData.map((d, i, arr) => ({
                  ...d,
                  change: i > 0 ? d.holders - arr[i - 1].holders : 0,
                }))}>
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
                    tickFormatter={(value) => value >= 0 ? `+${value}` : value.toString()}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="bg-neutral-900 border-neutral-800"
                        labelFormatter={(value) => `Date: ${value}`}
                        formatter={(value) => {
                          const num = Number(value);
                          return num >= 0 ? `+${num}` : num.toString();
                        }}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="change"
                    stroke="var(--color-holders)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Stats Summary Card */}
          <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" style={{ color: primaryColor }} />
                Holder Statistics
              </CardTitle>
              <CardDescription className="text-white/60">Summary of Holder Metrics</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center gap-6 py-6">
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Current Holders</p>
                <p className="text-white text-4xl font-bold" style={{ color: primaryColor }}>
                  {formatNumber(holderGrowth?.lastValue || 0)}
                </p>
              </div>
              {holderGrowth && (
                <>
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">Growth This Period</p>
                    <p className={`text-2xl font-bold ${holderGrowth.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {holderGrowth.change >= 0 ? '+' : ''}{formatNumber(holderGrowth.change)}
                    </p>
                    <p className={`text-sm font-semibold ${holderGrowth.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {holderGrowth.percentChange >= 0 ? '+' : ''}{holderGrowth.percentChange.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">Started With</p>
                    <p className="text-white text-xl font-semibold">
                      {formatNumber(holderGrowth.firstValue)}
                    </p>
                  </div>
                </>
              )}
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">Data Points</p>
                <p className="text-white text-xl font-semibold">
                  {chartData.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
