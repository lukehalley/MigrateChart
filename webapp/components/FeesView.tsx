'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp, Activity, BarChart3, LineChart as LineChartIcon, DollarSign, Calendar } from 'lucide-react';
import { FeesResponse } from '@/app/api/fees/[slug]/route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { FeesChartSkeleton } from '@/components/FeesChartSkeleton';

type FeesTimeframe = '7D' | '30D' | '90D' | 'ALL';

const getChartConfig = (primaryColor: string): ChartConfig => ({
  fees: {
    label: 'Fees',
    color: primaryColor,
  },
  cumulative: {
    label: 'Cumulative',
    color: primaryColor,
  },
  movingAverage: {
    label: '7-Day Average',
    color: primaryColor,
  },
});

interface FeesViewProps {
  projectSlug: string;
  primaryColor: string;
  timeframe: FeesTimeframe;
  onTimeframeChange: (timeframe: FeesTimeframe) => void;
  onOpenMobileMenu?: () => void;
}

export function FeesView({ projectSlug, primaryColor, timeframe, onTimeframeChange, onOpenMobileMenu }: FeesViewProps) {

  const { data: feesData, error: feesError, isLoading: feesLoading } = useSWR<FeesResponse>(
    `/api/fees/${projectSlug}?timeframe=${timeframe}`,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch fees data');
      return response.json();
    },
    {
      refreshInterval: 300000,
      revalidateOnFocus: false,
    }
  );

  // Prepare chart data with cumulative and moving average
  const chartData = useMemo(() => {
    if (!feesData?.dailyFees) return [];

    let cumulative = 0;
    return feesData.dailyFees.map((day, index, array) => {
      cumulative += day.fees;

      // Calculate 7-day moving average
      const start = Math.max(0, index - 6);
      const window = array.slice(start, index + 1);
      const movingAverage = window.reduce((sum, d) => sum + d.fees, 0) / window.length;

      return {
        date: new Date(day.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: day.timestamp,
        fees: day.fees,
        cumulative,
        movingAverage,
      };
    });
  }, [feesData]);

  // Get chart config with project color
  const chartConfig = useMemo(() =>
    getChartConfig(primaryColor),
    [primaryColor]
  );

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  if (feesLoading || !feesData) {
    return <FeesChartSkeleton />;
  }

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* Mobile and Tablet: Settings Button */}
      {onOpenMobileMenu && (
        <div className="lg:hidden absolute top-3 left-3 z-30">
          <button
            onClick={onOpenMobileMenu}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-black/90 hover:bg-black border-2 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_16px_rgba(var(--primary-rgb),0.5)] transition-all backdrop-blur-sm"
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 md:min-h-0 md:overflow-hidden">
        <div className="flex flex-col gap-4 pt-16 md:pt-0 h-auto md:h-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 flex-shrink-0">
          <div className="p-2 md:p-6 bg-black/50 border rounded-lg flex flex-col items-center text-center" style={{ borderColor: `${primaryColor}40` }}>
            <div className="flex flex-col items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
              <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: primaryColor }} />
              <span className="text-[11px] md:text-sm font-medium leading-tight" style={{ color: primaryColor }}>Total Fees</span>
            </div>
            <div className="text-sm md:text-2xl font-bold text-white leading-tight">{formatNumber(feesData.totalFees)}</div>
            <p className="text-[9px] md:text-xs text-white/60 leading-tight">{timeframe}</p>
          </div>

          <div className="p-2 md:p-6 bg-black/50 border rounded-lg flex flex-col items-center text-center" style={{ borderColor: `${primaryColor}40` }}>
            <div className="flex flex-col items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
              <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/80" />
              <span className="text-[11px] md:text-sm font-medium leading-tight text-white/80">Avg Daily</span>
            </div>
            <div className="text-sm md:text-2xl font-bold text-white leading-tight">{formatNumber(feesData.avgDailyFees)}</div>
            <p className="text-[9px] md:text-xs text-white/60 leading-tight">Per Day</p>
          </div>

          <div className="p-2 md:p-6 bg-black/50 border rounded-lg flex flex-col items-center text-center" style={{ borderColor: `${primaryColor}40` }}>
            <div className="flex flex-col items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
              <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/80" />
              <span className="text-[11px] md:text-sm font-medium leading-tight text-white/80">Peak Day</span>
            </div>
            <div className="text-sm md:text-2xl font-bold text-white leading-tight">
              {formatNumber(Math.max(...feesData.dailyFees.map(d => d.fees)))}
            </div>
            <p className="text-[9px] md:text-xs text-white/60 leading-tight">Highest</p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 flex-1 md:min-h-0 md:grid-rows-2">
            {/* Daily Fees Bar Chart */}
            <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5" style={{ color: primaryColor }} />
              Daily Fees Collected
            </CardTitle>
            <CardDescription className="text-white/60">Bar Chart Showing Fees Collected Per Day</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 md:min-h-0">
            <ChartContainer config={chartConfig} className="w-full h-[250px] md:h-full">
              <BarChart data={chartData}>
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
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                    return `$${value}`;
                  }}
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
                <Bar dataKey="fees" fill="var(--color-fees)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

            {/* Cumulative Fees Area Chart */}
            <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <LineChartIcon className="h-5 w-5" style={{ color: primaryColor }} />
              Cumulative Fees Growth
            </CardTitle>
            <CardDescription className="text-white/60">Total Accumulated Fees Over Time</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 md:min-h-0">
            <ChartContainer config={chartConfig} className="w-full h-[250px] md:h-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-cumulative)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-cumulative)" stopOpacity={0.1} />
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
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                    return `$${value}`;
                  }}
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
                  dataKey="cumulative"
                  stroke="var(--color-cumulative)"
                  fill="url(#fillCumulative)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

            {/* Daily Fees Trend Line Chart */}
            <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5" style={{ color: primaryColor }} />
              Daily Fees Trend
            </CardTitle>
            <CardDescription className="text-white/60">Day-by-Day Fee Collection Pattern</CardDescription>
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
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                    return `$${value}`;
                  }}
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
                  dataKey="fees"
                  stroke="var(--color-fees)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

            {/* 7-Day Moving Average Chart */}
            <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5" style={{ color: primaryColor }} />
              7-Day Moving Average
            </CardTitle>
            <CardDescription className="text-white/60">Smoothed Fee Collection Trend</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 md:min-h-0">
            <ChartContainer config={chartConfig} className="w-full h-[250px] md:h-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillMovingAverage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-movingAverage)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--color-movingAverage)" stopOpacity={0.05} />
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
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                    return `$${value}`;
                  }}
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
                  dataKey="movingAverage"
                  stroke="var(--color-movingAverage)"
                  fill="url(#fillMovingAverage)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
