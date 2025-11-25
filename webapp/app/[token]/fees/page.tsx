'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ArrowLeft, TrendingUp, DollarSign, Activity, Calendar, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { TokenLoadingLogo } from '@/components/TokenLoadingLogo';
import { FeesChartSkeleton } from '@/components/FeesChartSkeleton';
import { TokenContextProvider, useTokenContext } from '@/lib/TokenContext';
import { FeesResponse } from '@/app/api/fees/[slug]/route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

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

function FeesPageContent() {
  const { currentProject, isLoading: projectLoading, error: projectError } = useTokenContext();
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<FeesTimeframe>('30D');

  useEffect(() => {
    if (currentProject) {
      document.title = `${currentProject.name} - Fees Analytics`;
    }
  }, [currentProject]);

  const { data: feesData, error: feesError, isLoading: feesLoading } = useSWR<FeesResponse>(
    currentProject ? `/api/fees/${currentProject.slug}?timeframe=${timeframe}` : null,
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

  // Prepare chart data with cumulative - must be before early returns
  const chartData = React.useMemo(() => {
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
  const chartConfig = React.useMemo(() =>
    getChartConfig(currentProject?.primaryColor || '#52C97D'),
    [currentProject?.primaryColor]
  );

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  if (projectLoading || !currentProject) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <TokenLoadingLogo
          svgUrl={currentProject?.loaderUrl}
          color={currentProject?.primaryColor || '#52C97D'}
        />
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
        <p>Error loading project</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-[var(--primary-color)]/20 sticky top-0 z-50 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="flex h-14 items-center px-4 lg:px-6">
          <button
            onClick={() => router.push(`/${currentProject.slug}`)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 h-9 w-9"
            style={{
              color: currentProject.primaryColor,
              borderColor: currentProject.primaryColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${currentProject.primaryColor}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="ml-4">
            <h1 className="text-lg font-semibold flex items-center gap-2 text-white">
              <DollarSign className="h-5 w-5" style={{ color: currentProject.primaryColor }} />
              Fees Analytics
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {feesLoading || !feesData ? (
        <FeesChartSkeleton />
      ) : (
        <div className="p-4 lg:p-6 max-w-[100vw]">
          {/* Timeframe Selection */}
          <div className="flex justify-end gap-2 mb-6">
            {(['7D', '30D', '90D', 'ALL'] as FeesTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                  timeframe === tf
                    ? ''
                    : 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800'
                }`}
                style={
                  timeframe === tf
                    ? {
                        backgroundColor: currentProject.primaryColor,
                        borderColor: currentProject.primaryColor,
                        color: currentProject.secondaryColor || '#000000',
                      }
                    : undefined
                }
              >
                {tf}
              </button>
            ))}
          </div>

          <>
            {/* Stats Grid - Top Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card className="bg-neutral-900 border border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Fees</CardTitle>
                  <DollarSign className="h-4 w-4" style={{ color: currentProject.primaryColor }} />
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
                  <Activity className="h-4 w-4" style={{ color: currentProject.primaryColor }} />
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
                  <Calendar className="h-4 w-4" style={{ color: currentProject.primaryColor }} />
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
                  <TrendingUp className="h-4 w-4" style={{ color: currentProject.primaryColor }} />
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
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Daily Fees Bar Chart */}
              <Card className="bg-neutral-900 border border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart3 className="h-5 w-5" style={{ color: currentProject.primaryColor }} />
                    Daily Fees Collected
                  </CardTitle>
                  <CardDescription className="text-white/60">Bar Chart Showing Fees Collected Per Day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
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
                        domain={[0, (dataMax: number) => dataMax + 50]}
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
              <Card className="bg-neutral-900 border border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <LineChartIcon className="h-5 w-5" style={{ color: currentProject.primaryColor }} />
                    Cumulative Fees Growth
                  </CardTitle>
                  <CardDescription className="text-white/60">Total Accumulated Fees Over Time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
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
                        domain={[0, (dataMax: number) => dataMax + 50]}
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
              <Card className="bg-neutral-900 border border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Activity className="h-5 w-5" style={{ color: currentProject.primaryColor }} />
                    Daily Fees Trend
                  </CardTitle>
                  <CardDescription className="text-white/60">Day-by-Day Fee Collection Pattern</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                        domain={[0, (dataMax: number) => dataMax + 50]}
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
              <Card className="bg-neutral-900 border border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5" style={{ color: currentProject.primaryColor }} />
                    Cumulative Fees Trend
                  </CardTitle>
                  <CardDescription className="text-white/60">Total Accumulated Fees Over Time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                        domain={[0, (dataMax: number) => dataMax + 50]}
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

            {/* Footer Info */}
            <div className="mt-8 text-center text-sm text-white/60">
              <p>
                Fees Are Calculated Based On Pool Configurations And Migration Timestamps.
                Only Pools With Active Fee Collection Are Included.
              </p>
            </div>
          </>
        </div>
      )}
    </div>
  );
}

export default function FeesPage() {
  return (
    <TokenContextProvider>
      <FeesPageContent />
    </TokenContextProvider>
  );
}
