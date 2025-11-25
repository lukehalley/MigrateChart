'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Users, TrendingUp, Percent, ArrowUp, ArrowDown } from 'lucide-react';
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

  // Fixed buffer of 50 for all charts
  const domainBuffer = 50;

  // Get chart config with project color
  const chartConfig = useMemo(() =>
    getChartConfig(primaryColor),
    [primaryColor]
  );

  // Calculate total holder change for the timeframe
  const holderChange = useMemo(() => {
    if (!chartData || chartData.length < 2) return 0;
    return chartData[chartData.length - 1].holders - chartData[0].holders;
  }, [chartData]);

  // Get color for holder change indicator
  const getChangeColor = (change: number) => {
    if (change > 0) return primaryColor; // ZERA green
    if (change < 0) return '#C95252'; // Calm red
    return 'rgb(115, 115, 115)'; // neutral-500
  };

  if (holdersLoading || !holdersData) {
    return <HoldersChartSkeleton />;
  }

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* Charts Grid - Scrollable on mobile */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 md:min-h-0 md:overflow-hidden">
        <div className="flex flex-col gap-4 h-auto md:h-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 flex-shrink-0">
          <div className="p-2 md:p-6 bg-black/50 border rounded-lg flex flex-col items-center text-center" style={{ borderColor: `${primaryColor}40` }}>
            <div className="flex flex-col items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: primaryColor }} />
              <span className="text-[11px] md:text-sm font-medium leading-tight" style={{ color: primaryColor }}>Current Holders</span>
            </div>
            <div className="text-sm md:text-2xl font-bold text-white leading-tight">
              {formatNumber(chartData[chartData.length - 1]?.holders || 0)}
            </div>
            <p className="text-[9px] md:text-xs text-white/60 leading-tight">Total</p>
          </div>

          <div className="p-2 md:p-6 bg-black/50 border rounded-lg flex flex-col items-center text-center" style={{ borderColor: `${primaryColor}40` }}>
            <div className="flex flex-col items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
              {holderChange >= 0 ? (
                <ArrowUp className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: primaryColor }} />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: '#C95252' }} />
              )}
              <span className="text-[11px] md:text-sm font-medium leading-tight text-white/80">Change</span>
            </div>
            <div className={`text-sm md:text-2xl font-bold leading-tight`} style={{ color: holderChange >= 0 ? primaryColor : '#C95252' }}>
              {holderChange >= 0 ? '+' : ''}{formatNumber(holderChange)}
            </div>
            <p className="text-[9px] md:text-xs text-white/60 leading-tight">{timeframe}</p>
          </div>

          <div className="p-2 md:p-6 bg-black/50 border rounded-lg flex flex-col items-center text-center" style={{ borderColor: `${primaryColor}40` }}>
            <div className="flex flex-col items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
              {(() => {
                const growthRate = chartData.length >= 2 ? (holderChange / chartData[0].holders) * 100 : 0;
                if (growthRate > 0) return <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: primaryColor }} />;
                if (growthRate < 0) return <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 rotate-180" style={{ color: '#C95252' }} />;
                return <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-500" />;
              })()}
              <span className="text-[11px] md:text-sm font-medium leading-tight text-white/80">Growth Rate</span>
            </div>
            <div className={`text-sm md:text-2xl font-bold leading-tight`} style={{
              color: chartData.length >= 2
                ? (holderChange / chartData[0].holders) * 100 > 0
                  ? primaryColor
                  : (holderChange / chartData[0].holders) * 100 < 0
                  ? '#C95252'
                  : 'rgb(115, 115, 115)'
                : 'rgb(115, 115, 115)'
            }}>
              {chartData.length >= 2 ? (
                `${((holderChange / chartData[0].holders) * 100) > 0 ? '+' : ''}${((holderChange / chartData[0].holders) * 100).toFixed(1)}%`
              ) : '0%'}
            </div>
            <p className="text-[9px] md:text-xs text-white/60 leading-tight">{timeframe}</p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 flex-1 md:min-h-0 md:grid-rows-[1fr_1fr]">
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
            <CardContent className="flex-1 pb-0 md:min-h-0 flex flex-col md:flex-row gap-4">
              {/* Chart - 5/6 width */}
              <div className="flex-1 md:w-5/6 h-[250px] md:h-auto">
                <ChartContainer config={chartConfig} className="w-full h-full">
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
                      domain={[(dataMin: number) => dataMin - domainBuffer, (dataMax: number) => dataMax + domainBuffer]}
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
              </div>

              {/* Period Change - 1/6 width */}
              <div className="md:w-1/6 flex items-center justify-center border-t md:border-t-0 md:border-l border-neutral-800 pt-4 md:pt-0 md:pl-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs text-white/40 font-medium uppercase tracking-wider">Period Change</div>
                  <div
                    className="text-5xl md:text-6xl font-black tabular-nums tracking-tight"
                    style={{
                      color: getChangeColor(holderChange),
                      textShadow: `0 0 20px ${getChangeColor(holderChange)}40`
                    }}
                  >
                    {holderChange > 0 ? '+' : ''}{formatNumber(holderChange)}
                  </div>
                  <div className="text-xs text-white/40 font-medium uppercase tracking-wider">
                    Holders
                  </div>
                </div>
              </div>
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
                      domain={[(dataMin: number) => dataMin - domainBuffer, (dataMax: number) => dataMax + domainBuffer]}
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
                      domain={[(dataMin: number) => dataMin - 50, (dataMax: number) => dataMax + 50]}
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
    </div>
  );
}
