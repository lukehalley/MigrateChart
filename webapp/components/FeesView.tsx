'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp, DollarSign, Activity, Calendar, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
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
}

export function FeesView({ projectSlug, primaryColor, timeframe, onTimeframeChange }: FeesViewProps) {

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
    <div className="w-full h-full p-4 md:p-6 relative flex flex-col">
      {/* Stats Grid - Top Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-neutral-900 border border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4" style={{ color: primaryColor }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatNumber(feesData.totalFees)}</div>
            <p className="text-xs text-white/60">
              {timeframe} Timeframe
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Avg Daily Fees</CardTitle>
            <Activity className="h-4 w-4" style={{ color: primaryColor }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatNumber(feesData.avgDailyFees)}</div>
            <p className="text-xs text-white/60">
              Per Day Average
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Days</CardTitle>
            <Calendar className="h-4 w-4" style={{ color: primaryColor }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{feesData.dailyFees.length}</div>
            <p className="text-xs text-white/60">
              Days With Fee Data
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Peak Day</CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: primaryColor }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatNumber(Math.max(...feesData.dailyFees.map(d => d.fees)))}
            </div>
            <p className="text-xs text-white/60">
              Highest Single Day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="flex-1 grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Daily Fees Bar Chart */}
            <Card className="bg-neutral-900 border border-neutral-800 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-5 w-5" style={{ color: primaryColor }} />
              Daily Fees Collected
            </CardTitle>
            <CardDescription className="text-white/60">Bar Chart Showing Fees Collected Per Day</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="w-full h-full aspect-auto">
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
            <Card className="bg-neutral-900 border border-neutral-800 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <LineChartIcon className="h-5 w-5" style={{ color: primaryColor }} />
              Cumulative Fees Growth
            </CardTitle>
            <CardDescription className="text-white/60">Total Accumulated Fees Over Time</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="w-full h-full aspect-auto">
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
            <Card className="bg-neutral-900 border border-neutral-800 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5" style={{ color: primaryColor }} />
              Daily Fees Trend
            </CardTitle>
            <CardDescription className="text-white/60">Day-by-Day Fee Collection Pattern</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="w-full h-full aspect-auto">
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
            <Card className="bg-neutral-900 border border-neutral-800 flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5" style={{ color: primaryColor }} />
              Cumulative Fees Trend
            </CardTitle>
            <CardDescription className="text-white/60">Total Accumulated Fees Over Time</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ChartContainer config={chartConfig} className="w-full h-full aspect-auto">
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
  );
}
