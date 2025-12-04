'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, AreaChart, Area } from 'recharts';
import { Flame, TrendingDown, Activity, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BurnsChartSkeleton } from '@/components/BurnsChartSkeleton';
import { useTokenContext } from '@/lib/TokenContext';
import BurnsTimeframeToggle from '@/components/BurnsTimeframeToggle';

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
  timeframe?: '1D' | '7D' | '30D' | '90D' | 'ALL';
  onTimeframeChange?: (timeframe: '1D' | '7D' | '30D' | '90D' | 'ALL') => void;
  onOpenMobileMenu?: () => void;
}

export function BurnsView({ projectSlug, primaryColor, timeframe = 'ALL', onTimeframeChange, onOpenMobileMenu }: BurnsViewProps) {
  const { currentProject } = useTokenContext();

  // Sort state
  type SortField = 'amount' | 'timestamp';
  type SortDirection = 'asc' | 'desc';
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const { data: burnsData, error: burnsError, isLoading: burnsLoading } = useSWR<BurnsResponse>(
    `/api/burns/${projectSlug}?timeframe=${timeframe}`,
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

  // Calculate cumulative burn data
  const cumulativeChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    let cumulative = 0;
    return chartData.map((day) => {
      cumulative += day.amount;
      return {
        date: day.date,
        cumulative,
        fullDate: day.fullDate,
      };
    });
  }, [chartData]);

  // Determine if we should use logarithmic scale based on data variance
  const useLogScale = useMemo(() => {
    if (!chartData || chartData.length === 0) return false;

    const amounts = chartData.map(d => d.amount).filter(a => a > 0);
    if (amounts.length === 0) return false;

    const max = Math.max(...amounts);
    const min = Math.min(...amounts);

    // Use log scale if variance is high (max is 100x or more than min)
    // and there are no zero values
    const hasZeros = chartData.some(d => d.amount === 0);
    const variance = max / (min || 1);

    return !hasZeros && variance > 100;
  }, [chartData]);

  const chartConfig = useMemo(() => getChartConfig(primaryColor), [primaryColor]);

  // Sorted burns for table
  const sortedBurns = useMemo(() => {
    if (!burnsData?.recentBurns) return [];

    const burns = [...burnsData.recentBurns];

    burns.sort((a, b) => {
      let compareValue = 0;

      if (sortField === 'amount') {
        compareValue = a.amount - b.amount;
      } else if (sortField === 'timestamp') {
        compareValue = a.timestamp - b.timestamp;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return burns;
  }, [burnsData?.recentBurns, sortField, sortDirection]);

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

  if (burnsLoading || !burnsData) {
    return <BurnsChartSkeleton />;
  }

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex flex-col gap-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 flex-shrink-0">
          <div className="p-2 md:p-6 bg-black/50 border rounded-lg flex flex-col items-center text-center" style={{ borderColor: `${primaryColor}40` }}>
            <div className="flex flex-col items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
              <Flame className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: primaryColor }} />
              <span className="text-[11px] md:text-sm font-medium leading-tight" style={{ color: primaryColor }}>Total Burned</span>
            </div>
            <div className="text-sm md:text-2xl font-bold text-white leading-tight">{formatNumber(burnsData.stats.totalBurned)}</div>
            <p className="text-[9px] md:text-xs text-white/60 leading-tight">ZERA</p>
          </div>

          <div className="p-2 md:p-6 bg-black/50 border rounded-lg flex flex-col items-center text-center" style={{ borderColor: `${primaryColor}40` }}>
            <div className="flex flex-col items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
              <TrendingDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/80" />
              <span className="text-[11px] md:text-sm font-medium leading-tight text-white/80">Current Supply</span>
            </div>
            <div className="text-sm md:text-2xl font-bold text-white leading-tight">{formatNumber(burnsData.stats.currentSupply)}</div>
            <p className="text-[9px] md:text-xs text-white/60 leading-tight">ZERA</p>
          </div>

          <div className="p-2 md:p-6 bg-black/50 border rounded-lg flex flex-col items-center text-center" style={{ borderColor: `${primaryColor}40` }}>
            <div className="flex flex-col items-center gap-0.5 md:gap-1 mb-1 md:mb-2">
              <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/80" />
              <span className="text-[11px] md:text-sm font-medium leading-tight text-white/80">Burn Rate</span>
            </div>
            <div className="text-sm md:text-2xl font-bold text-white leading-tight">
              {burnsData.stats.burnPercentage >= 0.01
                ? `${burnsData.stats.burnPercentage.toFixed(2)}%`
                : burnsData.stats.burnPercentage >= 0.0001
                ? `${burnsData.stats.burnPercentage.toFixed(4)}%`
                : `${burnsData.stats.burnPercentage >= 0.000001 ? burnsData.stats.burnPercentage.toFixed(6) : burnsData.stats.burnPercentage.toExponential(2)}%`
              }
            </div>
            <p className="text-[9px] md:text-xs text-white/60 leading-tight">Of Initial Supply</p>
          </div>
        </div>

        {/* Charts Grid - Daily and Cumulative Burns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart - Daily Burns */}
          <Card className="bg-black/50 border" style={{ borderColor: `${primaryColor}40` }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: primaryColor }}>
                <Flame className="w-5 h-5" />
                Daily Burn History
              </CardTitle>
              <CardDescription>Each Bar Represents Daily Burn Activity</CardDescription>
            </CardHeader>
            <CardContent>
              {burnsData.recentBurns.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <Flame className="w-12 h-12 mx-auto mb-2 opacity-20" style={{ color: primaryColor }} />
                    <p className="text-white/50">No Burn History Yet</p>
                    <p className="text-white/30 text-sm">Burns Will Appear Here Once They Occur</p>
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
                      scale={useLogScale ? 'log' : 'auto'}
                      domain={useLogScale ? ['auto', 'auto'] : [0, (dataMax: number) => dataMax + 50]}
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                      tickFormatter={formatNumber}
                      allowDataOverflow={false}
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

          {/* Chart - Cumulative Burns */}
          <Card className="bg-black/50 border" style={{ borderColor: `${primaryColor}40` }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: primaryColor }}>
                <TrendingDown className="w-5 h-5" />
                Cumulative Burns
              </CardTitle>
              <CardDescription>Total Tokens Burned Over Time</CardDescription>
            </CardHeader>
            <CardContent>
              {burnsData.recentBurns.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-20" style={{ color: primaryColor }} />
                    <p className="text-white/50">No Burn History Yet</p>
                    <p className="text-white/30 text-sm">Cumulative Burns Will Appear Here</p>
                  </div>
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <AreaChart data={cumulativeChartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                    <defs>
                      <linearGradient id="cumulativeBurnGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                              {formatNumber(data.cumulative)} ZERA
                            </p>
                            <p className="text-white/70 text-xs">{data.fullDate}</p>
                            <p className="text-white/50 text-xs mt-1">Total Burned</p>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke={primaryColor}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#cumulativeBurnGradient)"
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Burns Table */}
        <Card className="bg-black/50 border" style={{ borderColor: `${primaryColor}40` }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: primaryColor }}>
              <Flame className="w-5 h-5" />
              Recent Burns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedBurns.length === 0 ? (
              <div className="py-8 text-center">
                <Flame className="w-12 h-12 mx-auto mb-2 opacity-20" style={{ color: primaryColor }} />
                <p className="text-white/50">No Recent Burns</p>
                <p className="text-white/30 text-sm">Burn Transactions Will Appear Here</p>
              </div>
            ) : (
              <div className="rounded-md border" style={{ borderColor: `${primaryColor}30` }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: `${primaryColor}20` }}>
                      <TableHead className="text-white/70 text-xs md:text-sm py-2 w-[20%] md:text-center">
                        <button
                          onClick={() => handleSort('amount')}
                          className="flex items-center justify-center gap-0.5 md:gap-1 hover:text-white transition-colors w-full"
                        >
                          Amount
                          {sortField === 'amount' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                            ) : (
                              <ArrowDown className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 opacity-50" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-white/70 text-xs md:text-sm py-2 w-[25%] md:text-center">From</TableHead>
                      <TableHead className="text-white/70 text-xs md:text-sm py-2 w-[30%] md:text-center">
                        <button
                          onClick={() => handleSort('timestamp')}
                          className="flex items-center justify-center gap-0.5 md:gap-1 hover:text-white transition-colors w-full"
                        >
                          Time
                          {sortField === 'timestamp' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                            ) : (
                              <ArrowDown className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 opacity-50" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-white/70 text-xs md:text-sm py-2 w-[25%] md:text-center">Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBurns.map((burn, index) => (
                      <TableRow
                        key={`${burn.signature}-${index}`}
                        className="hover:bg-black/30 transition-colors"
                        style={{ borderColor: `${primaryColor}20` }}
                      >
                        <TableCell className="font-medium text-xs md:text-sm py-2 md:py-3 text-left md:text-center" style={{ color: primaryColor }}>
                          {formatNumber(burn.amount)} ZERA
                        </TableCell>
                        <TableCell className="py-2 md:py-3 md:text-center">
                          <a
                            href={`https://solscan.io/account/${burn.from}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] md:text-xs hover:underline text-white/70 hover:text-white inline-flex items-center gap-0.5 md:gap-1"
                          >
                            {truncateAddress(burn.from)}
                            <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          </a>
                        </TableCell>
                        <TableCell className="text-white/60 text-[10px] md:text-sm py-2 md:py-3 whitespace-nowrap md:text-center">
                          <span className="md:hidden">{new Date(burn.timestamp * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          <span className="hidden md:inline">{new Date(burn.timestamp * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ', ' + new Date(burn.timestamp * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </TableCell>
                        <TableCell className="text-right md:text-center py-2 md:py-3">
                          <a
                            href={`https://solscan.io/tx/${burn.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] md:text-xs hover:underline inline-flex items-center gap-0.5 md:gap-1"
                            style={{ color: `${primaryColor}90` }}
                          >
                            {truncateAddress(burn.signature)}
                            <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
