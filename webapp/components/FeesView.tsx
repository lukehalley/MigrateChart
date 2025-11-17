'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp, Activity, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
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

  // Prepare chart data with cumulative
  const chartData = useMemo(() => {
    if (!feesData?.dailyFees) return [];

    let cumulative = 0;
    return feesData.dailyFees.map((day) => {
      cumulative += day.fees;
      return {
        date: new Date(day.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: day.timestamp,
        fees: day.fees,
        cumulative,
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

            {/* Cumulative Fees Trend Line Chart */}
            <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5" style={{ color: primaryColor }} />
              Cumulative Fees Trend
            </CardTitle>
            <CardDescription className="text-white/60">Total Accumulated Fees Over Time</CardDescription>
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
                  dataKey="cumulative"
                  stroke="var(--color-cumulative)"
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
