'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Users, TrendingUp, Percent } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';
import { HoldersResponse } from '@/app/api/holders/[slug]/route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { HoldersChartSkeleton } from '@/components/HoldersChartSkeleton';

type HolderTimeframe = '1D' | '7D' | '30D' | '90D' | 'ALL';

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
    return num.toLocaleString();
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!holdersData?.snapshots || holdersData.snapshots.length === 0) return [];

    return holdersData.snapshots.map((snapshot) => {
      const date = new Date(snapshot.timestamp * 1000);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        dateTime: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dateTimeWithTime: `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
        timestamp: snapshot.timestamp,
        holders: snapshot.holder_count,
      };
    });
  }, [holdersData]);

  // Calculate change data for the second and third charts
  const changeData = useMemo(() => {
    if (!chartData || chartData.length < 2) return [];

    return chartData.map((point, idx) => {
      if (idx === 0) {
        return { ...point, change: 0, percentChange: 0 };
      }
      const change = point.holders - chartData[idx - 1].holders;
      const percentChange = chartData[idx - 1].holders > 0
        ? (change / chartData[idx - 1].holders) * 100
        : 0;
      return { ...point, change, percentChange };
    });
  }, [chartData]);

  // Calculate dynamic domain padding based on timeframe
  const domainPadding = useMemo(() => {
    const dataPointCount = chartData.length;

    // For timeframes with fewer data points, use slightly more padding for visual breathing room
    // For timeframes with many data points, use minimal padding to show more detail
    if (dataPointCount <= 24) { // 1D with hourly data
      return { holder: 1.03, change: 1.05, percent: 1.05 }; // Minimal padding
    } else if (dataPointCount <= 168) { // 7D
      return { holder: 1.025, change: 1.04, percent: 1.04 };
    } else if (dataPointCount <= 720) { // 30D
      return { holder: 1.02, change: 1.03, percent: 1.03 };
    } else if (dataPointCount <= 2160) { // 90D
      return { holder: 1.015, change: 1.025, percent: 1.025 };
    } else { // ALL
      return { holder: 1.01, change: 1.02, percent: 1.02 }; // Very tight for overview
    }
  }, [chartData]);

  // Get chart config with project color
  const chartConfig = useMemo(() =>
    getChartConfig(primaryColor),
    [primaryColor]
  );

  if (holdersLoading || !holdersData) {
    return <HoldersChartSkeleton />;
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
        <div className="grid gap-4 grid-cols-1 pt-16 md:pt-0 h-auto md:h-full md:grid-rows-[1fr_1fr]">
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
                    dataKey="dateTime"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                  />
                  <YAxis
                    domain={['dataMin', (dataMax: number) => dataMax * domainPadding.holder]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="bg-neutral-900 border-neutral-800"
                        labelFormatter={(value, payload) => payload?.[0]?.payload?.dateTimeWithTime || value}
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

          {/* Bottom Row - Daily Change and Percentage Change Side by Side */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* Daily Holder Change Bar Chart */}
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
                  <BarChart data={changeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-white/10" />
                    <XAxis
                      dataKey="dateTime"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                    />
                    <YAxis
                      domain={[(dataMin: number) => dataMin * domainPadding.change, (dataMax: number) => dataMax * domainPadding.change]}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => {
                        const num = Number(value);
                        return num >= 0 ? `+${num.toLocaleString()}` : num.toLocaleString();
                      }}
                    />
                    <ReferenceLine y={0} stroke="var(--color-change)" strokeOpacity={0.3} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="bg-neutral-900 border-neutral-800"
                          labelFormatter={(value, payload) => payload?.[0]?.payload?.dateTimeWithTime || value}
                          formatter={(value) => {
                            const num = Number(value);
                            return num >= 0 ? `+${formatNumber(num)}` : formatNumber(num);
                          }}
                        />
                      }
                    />
                    <Bar
                      dataKey="change"
                      fill="var(--color-change)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Percentage Holder Change Line Chart */}
            <Card className="bg-neutral-900 border border-neutral-800 flex flex-col md:min-h-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Percent className="h-5 w-5" style={{ color: primaryColor }} />
                  Percentage Holder Change
                </CardTitle>
                <CardDescription className="text-white/60">
                  Day-to-Day Holder Growth Rate (%)
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0 md:min-h-0">
                <ChartContainer config={chartConfig} className="w-full h-[250px] md:h-full">
                  <LineChart data={changeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-white/10" />
                    <XAxis
                      dataKey="dateTime"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                    />
                    <YAxis
                      domain={[(dataMin: number) => dataMin * domainPadding.percent, (dataMax: number) => dataMax * domainPadding.percent]}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => {
                        const num = Number(value);
                        return num >= 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
                      }}
                    />
                    <ReferenceLine y={0} stroke="var(--color-change)" strokeOpacity={0.3} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="bg-neutral-900 border-neutral-800"
                          labelFormatter={(value, payload) => payload?.[0]?.payload?.dateTimeWithTime || value}
                          formatter={(value) => {
                            const num = Number(value);
                            return num >= 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
                          }}
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="percentChange"
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
    </div>
  );
}
