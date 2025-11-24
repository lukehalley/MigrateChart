'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Flame, TrendingDown, Activity, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TokenLoadingLogo } from '@/components/TokenLoadingLogo';
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
  timeframe?: '7D' | '30D' | '90D' | 'ALL';
  onTimeframeChange?: (timeframe: '7D' | '30D' | '90D' | 'ALL') => void;
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
    return (
      <div className="w-full h-full flex items-center justify-center backdrop-blur-xl">
        <TokenLoadingLogo
          svgUrl={currentProject?.loaderUrl}
          color={currentProject?.primaryColor || primaryColor}
          isLoading={burnsLoading}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* Mobile and Tablet: Settings Button */}
      {onOpenMobileMenu && (
        <div className="lg:hidden absolute top-3 left-3 z-30">
          <button
            onClick={onOpenMobileMenu}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-black/60 border rounded-lg backdrop-blur-sm hover:bg-black/80 transition-colors"
            style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Settings
          </button>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-black/50 border" style={{ borderColor: `${primaryColor}40` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: primaryColor }}>
                <Flame className="w-4 h-4" />
                Total Burned Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(burnsData.stats.totalBurned)}</div>
              <p className="text-xs text-white/60 mt-1">ZERA Tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border" style={{ borderColor: `${primaryColor}40` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/80">
                <TrendingDown className="w-4 h-4" />
                Current Supply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(burnsData.stats.currentSupply)}</div>
              <p className="text-xs text-white/60 mt-1">ZERA Tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border" style={{ borderColor: `${primaryColor}40` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-white/80">
                <Activity className="w-4 h-4" />
                Burn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {burnsData.stats.burnPercentage >= 0.01
                  ? `${burnsData.stats.burnPercentage.toFixed(2)}%`
                  : burnsData.stats.burnPercentage >= 0.0001
                  ? `${burnsData.stats.burnPercentage.toFixed(4)}%`
                  : `${burnsData.stats.burnPercentage.toFixed(6)}%`
                }
              </div>
              <p className="text-xs text-white/60 mt-1">Of Initial Supply</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart - Individual Burns */}
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
                      <TableHead className="text-white/70">
                        <button
                          onClick={() => handleSort('amount')}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          Amount
                          {sortField === 'amount' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-50" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-white/70">From</TableHead>
                      <TableHead className="text-white/70">
                        <button
                          onClick={() => handleSort('timestamp')}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          Time
                          {sortField === 'timestamp' ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-50" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-white/70 text-right">Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBurns.map((burn, index) => (
                      <TableRow
                        key={`${burn.signature}-${index}`}
                        className="hover:bg-black/30 transition-colors"
                        style={{ borderColor: `${primaryColor}20` }}
                      >
                        <TableCell className="font-medium" style={{ color: primaryColor }}>
                          <div className="flex items-center gap-2">
                            <Flame className="w-3.5 h-3.5 flex-shrink-0" />
                            {formatNumber(burn.amount)} ZERA
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`https://solscan.io/account/${burn.from}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs hover:underline text-white/70 hover:text-white flex items-center gap-1"
                          >
                            {truncateAddress(burn.from)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </TableCell>
                        <TableCell className="text-white/60 text-sm whitespace-nowrap">
                          {new Date(burn.timestamp * 1000).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <a
                            href={`https://solscan.io/tx/${burn.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs hover:underline inline-flex items-center gap-1"
                            style={{ color: `${primaryColor}90` }}
                          >
                            {truncateAddress(burn.signature)}
                            <ExternalLink className="w-3 h-3" />
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
  );
}
