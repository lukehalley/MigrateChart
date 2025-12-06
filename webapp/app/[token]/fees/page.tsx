'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, DollarSign, Activity, Calendar, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TokenLoadingLogo } from '@/components/TokenLoadingLogo';
import { TokenContextProvider, useTokenContext } from '@/lib/TokenContext';
import { FeesResponse } from '@/app/api/fees/[slug]/route';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

type FeesTimeframe = '7D' | '30D' | '90D' | 'ALL';

const getChartConfig = (primaryColor: string): ChartConfig => ({
  fees: {
    label: 'Daily Fees',
    color: primaryColor,
  },
  cumulative: {
    label: 'Total Fees',
    color: primaryColor,
  },
});

function FeesPageContent() {
  const { currentProject, isLoading: projectLoading, error: projectError } = useTokenContext();
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<FeesTimeframe>('30D');
  const [chartView, setChartView] = useState<'daily' | 'cumulative'>('daily');

  useEffect(() => {
    if (currentProject) {
      document.title = `${currentProject.name} - Fee Analytics`;
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

  const formatLargeNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(3)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(3)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  if (projectLoading || !currentProject) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <TokenLoadingLogo
          svgUrl={currentProject?.loaderUrl}
          color={currentProject?.primaryColor || '#52C97D'}
          slug={currentProject?.slug}
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

  const primaryColor = currentProject.primaryColor;
  const peakDay = feesData ? Math.max(...feesData.dailyFees.map(d => d.fees)) : 0;

  return (
    <div className="min-h-screen bg-black grid-pattern relative overflow-x-hidden">
      {/* Ambient glow effect */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${primaryColor}20 0%, transparent 50%)`
        }}
      />

      {/* Header with back button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-black/30"
        style={{
          borderBottom: `1px solid ${primaryColor}40`,
          boxShadow: `0 4px 24px -8px ${primaryColor}40`
        }}
      >
        <div className="flex h-16 items-center px-4 lg:px-8 gap-4">
          <motion.button
            onClick={() => router.push(`/${currentProject.slug}`)}
            className="inline-flex items-center justify-center rounded-none h-10 w-10 terminal-card"
            style={{ borderColor: primaryColor }}
            whileHover={{ scale: 1.05, borderColor: primaryColor }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: primaryColor }} />
          </motion.button>

          <div className="flex-1">
            <h1 className="text-2xl  font-bold flex items-center gap-3 tracking-tight" style={{ color: primaryColor }}>
              <Zap className="h-7 w-7" />
              FEE ANALYTICS
            </h1>
            <p className="text-xs  text-white/50 mt-0.5">
              Real-time fee collection metrics
            </p>
          </div>

          {/* Timeframe Pills */}
          <div className="flex gap-2">
            {(['7D', '30D', '90D', 'ALL'] as FeesTimeframe[]).map((tf) => (
              <motion.button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className="px-4 py-2  text-xs font-bold transition-all terminal-card"
                style={{
                  borderColor: timeframe === tf ? primaryColor : `${primaryColor}40`,
                  color: timeframe === tf ? '#000' : primaryColor,
                  backgroundColor: timeframe === tf ? primaryColor : 'transparent',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tf}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="p-4 lg:p-8 max-w-[1800px] mx-auto w-full">
        <AnimatePresence mode="wait">
          {feesLoading || !feesData ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[600px]"
            >
              <TokenLoadingLogo
                svgUrl={currentProject.loaderUrl}
                color={primaryColor}
                slug={currentProject.slug}
              />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Hero Stats - Asymmetric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Fees - Takes 2 columns on large screens */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="md:col-span-2 terminal-card p-8 scan-line"
                  style={{ borderColor: primaryColor }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs  tracking-wider mb-2" style={{ color: `${primaryColor}80` }}>
                        TOTAL COLLECTED
                      </p>
                      <div className="text-5xl  font-bold data-glow mb-2" style={{ color: primaryColor }}>
                        {formatLargeNumber(feesData.totalFees)}
                      </div>
                      <p className="text-xs  text-white/40">
                        {timeframe} PERIOD
                      </p>
                    </div>
                    <DollarSign className="h-12 w-12 opacity-20" style={{ color: primaryColor }} />
                  </div>
                </motion.div>

                {/* Avg Daily - Compact */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="terminal-card p-6"
                  style={{ borderColor: `${primaryColor}60` }}
                >
                  <Activity className="h-6 w-6 mb-3 opacity-60" style={{ color: primaryColor }} />
                  <p className="text-[10px]  tracking-wider mb-2" style={{ color: `${primaryColor}80` }}>
                    AVG DAILY
                  </p>
                  <div className="text-2xl  font-bold" style={{ color: primaryColor }}>
                    {formatNumber(feesData.avgDailyFees)}
                  </div>
                </motion.div>

                {/* Peak Day */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="terminal-card p-6"
                  style={{ borderColor: `${primaryColor}60` }}
                >
                  <TrendingUp className="h-6 w-6 mb-3 opacity-60" style={{ color: primaryColor }} />
                  <p className="text-[10px]  tracking-wider mb-2" style={{ color: `${primaryColor}80` }}>
                    PEAK DAY
                  </p>
                  <div className="text-2xl  font-bold" style={{ color: primaryColor }}>
                    {formatNumber(peakDay)}
                  </div>
                </motion.div>

                {/* Days Active */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="terminal-card p-6"
                  style={{ borderColor: `${primaryColor}60` }}
                >
                  <Calendar className="h-6 w-6 mb-3 opacity-60" style={{ color: primaryColor }} />
                  <p className="text-[10px]  tracking-wider mb-2" style={{ color: `${primaryColor}80` }}>
                    DAYS ACTIVE
                  </p>
                  <div className="text-2xl  font-bold" style={{ color: primaryColor }}>
                    {feesData.dailyFees.length}
                  </div>
                </motion.div>
              </div>

              {/* Chart View Toggle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3"
              >
                {(['daily', 'cumulative'] as const).map((view) => (
                  <motion.button
                    key={view}
                    onClick={() => setChartView(view)}
                    className="px-6 py-3  text-sm font-bold terminal-card transition-all"
                    style={{
                      borderColor: chartView === view ? primaryColor : `${primaryColor}40`,
                      color: chartView === view ? '#000' : primaryColor,
                      backgroundColor: chartView === view ? primaryColor : 'transparent',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {view === 'daily' ? 'DAILY FLOW' : 'CUMULATIVE GROWTH'}
                  </motion.button>
                ))}
              </motion.div>

              {/* Main Chart - Full Width */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="terminal-card p-8 scan-line"
                style={{ borderColor: primaryColor }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl  font-bold tracking-tight mb-1" style={{ color: primaryColor }}>
                      {chartView === 'daily' ? 'DAILY COLLECTION FLOW' : 'CUMULATIVE GROWTH TRAJECTORY'}
                    </h2>
                    <p className="text-xs  text-white/40">
                      {chartView === 'daily'
                        ? 'Fee volume collected per day across all transactions'
                        : 'Total accumulated fees over the selected timeframe'}
                    </p>
                  </div>
                  <Target className="h-8 w-8 opacity-20" style={{ color: primaryColor }} />
                </div>

                <div className="h-[500px] w-full">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartView === 'daily' ? (
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={primaryColor} stopOpacity={0.9} />
                              <stop offset="100%" stopColor={primaryColor} stopOpacity={0.3} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={`${primaryColor}15`}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            stroke={`${primaryColor}60`}
                            tick={{ fill: `${primaryColor}80`, fontSize: 11, fontFamily: 'monospace' }}
                            tickLine={{ stroke: `${primaryColor}40` }}
                            axisLine={{ stroke: `${primaryColor}40` }}
                          />
                          <YAxis
                            stroke={`${primaryColor}60`}
                            tick={{ fill: `${primaryColor}80`, fontSize: 11, fontFamily: 'monospace' }}
                            tickLine={{ stroke: `${primaryColor}40` }}
                            axisLine={{ stroke: `${primaryColor}40` }}
                            tickFormatter={(value) => {
                              if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                              if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                              return `$${value}`;
                            }}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                className="terminal-card  text-xs"
                                style={{ borderColor: primaryColor, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                                labelFormatter={(value) => `${value}`}
                                formatter={(value) => formatNumber(Number(value))}
                              />
                            }
                          />
                          <Bar
                            dataKey="fees"
                            fill="url(#barGradient)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      ) : (
                        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={`${primaryColor}15`}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            stroke={`${primaryColor}60`}
                            tick={{ fill: `${primaryColor}80`, fontSize: 11, fontFamily: 'monospace' }}
                            tickLine={{ stroke: `${primaryColor}40` }}
                            axisLine={{ stroke: `${primaryColor}40` }}
                          />
                          <YAxis
                            stroke={`${primaryColor}60`}
                            tick={{ fill: `${primaryColor}80`, fontSize: 11, fontFamily: 'monospace' }}
                            tickLine={{ stroke: `${primaryColor}40` }}
                            axisLine={{ stroke: `${primaryColor}40` }}
                            tickFormatter={(value) => {
                              if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                              if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                              return `$${value}`;
                            }}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                className="terminal-card  text-xs"
                                style={{ borderColor: primaryColor, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                                labelFormatter={(value) => `${value}`}
                                formatter={(value) => formatNumber(Number(value))}
                              />
                            }
                          />
                          <Area
                            type="monotone"
                            dataKey="cumulative"
                            stroke={primaryColor}
                            fill="url(#areaGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </motion.div>

              {/* Footer Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center terminal-card p-4"
                style={{ borderColor: `${primaryColor}40` }}
              >
                <p className="text-xs  text-white/40 tracking-wider">
                  Fee calculation based on pool configurations and migration timestamps
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
