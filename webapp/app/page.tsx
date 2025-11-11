'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Copy, Check } from 'lucide-react';
import Chart from '@/components/Chart';
import TimeframeToggle from '@/components/TimeframeToggle';
import ChartControls from '@/components/ChartControls';
import TokenStats from '@/components/TokenStats';
import { fetchAllPoolsData, fetchTokenStats } from '@/lib/api';
import { PoolData, Timeframe, POOLS } from '@/lib/types';
import { SafeStorage } from '@/lib/localStorage';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get timeframe from URL or default to '1D'
  const urlTimeframe = searchParams.get('timeframe') as Timeframe | null;
  const validTimeframes: Timeframe[] = ['1H', '4H', '8H', '1D', 'MAX'];
  const initialTimeframe = urlTimeframe && validTimeframes.includes(urlTimeframe) ? urlTimeframe : '1D';

  const [timeframe, setTimeframeState] = useState<Timeframe>(initialTimeframe);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [mobileMenuTab, setMobileMenuTab] = useState<'settings' | 'about'>('settings');

  // Reset chart position function
  const handleResetChartPosition = () => {
    if ((window as any).__resetChartPosition) {
      (window as any).__resetChartPosition();
    }
  };

  // Chart display preferences - initialize with defaults to prevent hydration mismatch
  // Then sync with localStorage after mount
  const [displayMode, setDisplayMode] = useState<'price' | 'marketCap'>('price');
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showMigrationLines, setShowMigrationLines] = useState<boolean>(true);

  // Sync with localStorage after component mounts (client-side only)
  useEffect(() => {
    const savedDisplayMode = SafeStorage.getItem('chartDisplayMode') as 'price' | 'marketCap' | null;
    if (savedDisplayMode) {
      setDisplayMode(savedDisplayMode);
    }

    const savedShowVolume = SafeStorage.getItem('chartShowVolume');
    if (savedShowVolume !== null) {
      setShowVolume(savedShowVolume !== 'false');
    }

    const savedShowMigrationLines = SafeStorage.getItem('chartShowMigrationLines');
    if (savedShowMigrationLines !== null) {
      setShowMigrationLines(savedShowMigrationLines !== 'false');
    }
  }, []);

  const handleDisplayModeChange = (mode: 'price' | 'marketCap') => {
    setDisplayMode(mode);
    SafeStorage.setItem('chartDisplayMode', mode);
  };

  const handleVolumeToggle = () => {
    const newShowVolume = !showVolume;
    setShowVolume(newShowVolume);
    SafeStorage.setItem('chartShowVolume', String(newShowVolume));
  };

  const handleMigrationLinesToggle = () => {
    const newShowMigrationLines = !showMigrationLines;
    setShowMigrationLines(newShowMigrationLines);
    SafeStorage.setItem('chartShowMigrationLines', String(newShowMigrationLines));
  };

  // Update URL when timeframe changes
  const setTimeframe = (newTimeframe: Timeframe) => {
    setTimeframeState(newTimeframe);
    const params = new URLSearchParams(searchParams.toString());
    params.set('timeframe', newTimeframe);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle menu close with fade-out animation
  const closeMobileMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setShowMobileMenu(false);
      setIsMenuClosing(false);
      setMobileMenuTab('settings'); // Reset to settings tab
    }, 300); // Match animation duration
  };

  // Handle copy address
  const solanaAddress = 'G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb';
  const handleCopy = () => {
    navigator.clipboard.writeText(solanaAddress);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Fetch data with SWR for automatic revalidation
  // Optimized intervals for live updates while respecting rate limits
  const { data: poolsData, error, isLoading } = useSWR<PoolData[]>(
    `/api/pools/${timeframe}`,
    () => fetchAllPoolsData(timeframe),
    {
      // More frequent updates for shorter timeframes
      refreshInterval: timeframe === '1H' ? 60000   // 1 minute for 1H
                     : timeframe === '4H' ? 180000  // 3 minutes for 4H
                     : timeframe === '8H' ? 240000  // 4 minutes for 8H
                     : timeframe === '1D' ? 300000  // 5 minutes for 1D
                     : 600000,                      // 10 minutes for 1W
      revalidateOnFocus: true, // Refresh when user returns to tab
      revalidateOnReconnect: true, // Refresh when internet reconnects
      dedupingInterval: 30000, // Dedupe requests within 30s
      errorRetryInterval: 10000, // Retry failed requests after 10s
      errorRetryCount: 3, // Max 3 retries
      onError: (err) => {
        console.error('Error fetching pool data:', err);
      },
    }
  );

  // Fetch token stats for the current Meteora pool
  // More frequent updates for price/stats which change rapidly
  const { data: tokenStats, isLoading: isStatsLoading } = useSWR(
    'token-stats',
    () => fetchTokenStats(POOLS.zera_Meteora.address),
    {
      refreshInterval: 30000, // Refresh every 30 seconds for live price updates
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 15000, // Dedupe requests within 15s
      errorRetryInterval: 10000,
      errorRetryCount: 3,
      onError: (err) => {
        console.error('Error fetching token stats:', err);
      },
    }
  );

  // Calculate timeframe-specific stats from chart data
  const timeframeStats = React.useMemo(() => {
    if (!poolsData || poolsData.length === 0 || !tokenStats) return null;

    // Get the most recent pool data (Meteora)
    const currentPoolData = poolsData.find(p => p.pool_name === 'zera_Meteora');
    if (!currentPoolData || currentPoolData.data.length === 0) return tokenStats;

    const data = currentPoolData.data;
    const now = Math.floor(Date.now() / 1000);

    // Meteora migration timestamp - fees only started being collected from this point
    const METEORA_MIGRATION = 1762300800; // November 5, 2025

    // Calculate timeframe duration in seconds
    const timeframeSeconds: Record<Timeframe, number> = {
      '1H': 3600,
      '4H': 4 * 3600,
      '8H': 8 * 3600,
      '1D': 24 * 3600,
      'MAX': now - data[0].time, // From first data point to now
    };

    const duration = timeframeSeconds[timeframe];
    const startTime = now - duration;

    // Filter data for selected timeframe and sort by time ascending
    const timeframeData = data
      .filter(d => d.time >= startTime)
      .sort((a, b) => a.time - b.time);

    if (timeframeData.length === 0) return tokenStats;

    // If we only have one data point, return tokenStats 24h change
    if (timeframeData.length === 1) return tokenStats;

    // Calculate volume for timeframe
    const volumeForTimeframe = timeframeData.reduce((sum, d) => sum + (d.volume || 0), 0);

    // Calculate price change for timeframe
    // Use the first candle's close as the starting price
    const firstPrice = timeframeData[0].close;
    // Use the live current price instead of the last candle's close for accuracy
    const currentPrice = tokenStats.price;
    const priceChangePercent = firstPrice !== 0 ? ((currentPrice - firstPrice) / firstPrice) * 100 : 0;

    // Calculate fees ONLY from Meteora migration date forward (when fees started being collected)
    const meteoraData = timeframeData.filter(d => d.time >= METEORA_MIGRATION);
    const volumeForFees = meteoraData.reduce((sum, d) => sum + (d.volume || 0), 0);
    const feesForTimeframe = volumeForFees * 0.01; // 1% fee

    return {
      ...tokenStats,
      volume24h: volumeForTimeframe,
      priceChange24h: priceChangePercent,
      fees24h: feesForTimeframe,
    };
  }, [poolsData, tokenStats, timeframe]);

  return (
    <main className="w-screen h-screen overflow-hidden grid grid-rows-[auto_1fr]">
      {/* Donation Banner */}
      <motion.div
        className="relative bg-gradient-to-r from-[#0A1F12] via-[#1F6338]/30 to-[#0A1F12] border-b-2 border-[#52C97D]/50 backdrop-blur-sm shadow-[0_4px_20px_rgba(82,201,125,0.25)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#52C97D]/20 to-transparent opacity-50"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        <div className="w-full relative px-3 sm:px-0">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-3 sm:py-4">

            {/* Left: Call to Action with Icon */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-[#52C97D] fill-[#52C97D]" />
              </motion.div>
              <div className="text-center sm:text-left">
                <p className="text-white font-bold text-xs sm:text-base leading-tight">
                  Support This Free Tool
                </p>
                <p className="text-white/70 text-[10px] sm:text-xs leading-tight">
                  Donate via Solana Network
                </p>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-[#52C97D]/30"></div>

            {/* Center: Address with better visibility */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <motion.div
                className="flex items-center gap-2 bg-black/60 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-[#52C97D]/40 overflow-hidden"
                whileHover={{ borderColor: 'rgba(82, 201, 125, 0.7)' }}
              >
                <code className="text-[#52C97D] text-[10px] sm:text-sm font-mono select-all truncate">
                  {solanaAddress}
                </code>
              </motion.div>

              <motion.button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 bg-[#52C97D] text-black font-bold text-xs sm:text-sm rounded-lg shadow-lg sm:w-[100px]"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 20px rgba(82, 201, 125, 0.5)'
                }}
                title="Copy address to clipboard"
              >
                <AnimatePresence mode="wait">
                  {showCopied ? (
                    <motion.div
                      key="check"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Copied!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile View */}
      <div className="md:hidden w-full h-full relative overflow-hidden">
        {/* Mobile Menu Toggle Button - Floating hamburger menu */}
        <button
          onClick={() => showMobileMenu ? closeMobileMenu() : setShowMobileMenu(true)}
          className="absolute top-3 left-3 z-[60] w-11 h-11 flex items-center justify-center bg-[#0A1F12]/90 hover:bg-[#0A1F12] border-2 border-[#52C97D] shadow-[0_0_12px_rgba(82,201,125,0.3)] hover:shadow-[0_0_16px_rgba(82,201,125,0.5)] transition-all backdrop-blur-sm"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5">
            <div className={`w-6 h-0.5 bg-[#52C97D] transition-all duration-300 ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-[#52C97D] transition-all duration-300 ${showMobileMenu ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-[#52C97D] transition-all duration-300 ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </div>
        </button>

        {/* Mobile Popup Menu */}
        {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 ${isMenuClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onClick={closeMobileMenu}
          />

          {/* Popup Content */}
          <div className={`md:hidden fixed inset-0 z-50 ${isMenuClosing ? 'animate-fade-out' : 'animate-fade-in'} overflow-y-auto flex items-center justify-center p-4 pointer-events-none`}>
            <div className="flex flex-col items-center mt-16 pointer-events-auto w-[85vw] max-w-[320px]">
              {/* Tab Navigation */}
              <div className="w-full bg-gradient-to-r from-[#0A1F12] via-[#1F6338]/20 to-[#0A1F12] border-[3px] border-[#52C97D]/60 border-b-0 flex">
                <button
                  onClick={() => setMobileMenuTab('settings')}
                  className={`flex-1 py-3 text-sm font-bold transition-all ${
                    mobileMenuTab === 'settings'
                      ? 'text-[#52C97D] bg-black/50'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  SETTINGS
                </button>
                <button
                  onClick={() => setMobileMenuTab('about')}
                  className={`flex-1 py-3 text-sm font-bold transition-all ${
                    mobileMenuTab === 'about'
                      ? 'text-[#52C97D] bg-black/50'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  ABOUT
                </button>
              </div>

              {/* Tab Content */}
              <div className="w-full max-h-[70vh] overflow-y-auto bg-gradient-to-b from-[#0A1F12] to-black border-[3px] border-[#52C97D]/60 py-3 px-2.5" style={{ WebkitOverflowScrolling: 'touch' }}>
                {mobileMenuTab === 'settings' && (
                  <>
              {/* Main Info Card */}
              <div className="info-card-small">
                <a
                  href="https://zeralabs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity cursor-pointer group"
                >
                  <img
                    src="/circle-logo.avif"
                    alt="ZERA"
                    className="h-8 w-8 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h1 className="text-lg font-bold text-white mb-0 group-hover:text-[#52C97D] transition-colors">ZERA</h1>
                    <p className="text-white text-[10px]">Complete Price History</p>
                  </div>
                </a>

                <div className="flex items-center justify-center gap-2 text-[10px] pt-3 pb-2 mt-2">
                  <span className="text-white font-medium">MON3Y</span>
                  <span className="text-white">→</span>
                  <span className="text-white font-medium">Raydium</span>
                  <span className="text-white">→</span>
                  <span className="text-[#52C97D] font-bold">Meteora</span>
                </div>

                {/* DEX Screener Link */}
                <div style={{ marginTop: '16px', paddingTop: '16px', paddingBottom: '4px' }} className="border-t border-[#52C97D]/20">
                  <a
                    href="https://dexscreener.com/solana/6oUJD1EHNVBNMeTpytmY2NxKWicz5C2JUbByUrHEsjhc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-[10px] text-white/70 hover:text-[#52C97D] transition-colors group"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>View on DEX Screener</span>
                  </a>
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-2">
                <div className="dashed-divider w-24"></div>
              </div>

              {/* Timeframe Toggle Card */}
              <div className="info-card-small">
                <div className="py-1.5 px-1.5">
                  <p className="text-white text-[10px] mb-1 text-center">Timeframe</p>
                  <TimeframeToggle
                    currentTimeframe={timeframe}
                    onTimeframeChange={(newTimeframe) => {
                      setTimeframe(newTimeframe);
                      closeMobileMenu();
                    }}
                  />
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-2">
                <div className="dashed-divider w-24"></div>
              </div>

              {/* Token Stats */}
              <div>
                <TokenStats stats={timeframeStats || null} isLoading={isStatsLoading} timeframe={timeframe} />
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-2">
                <div className="dashed-divider w-24"></div>
              </div>

              {/* Chart Controls Card */}
              <div className="info-card-small">
                <div className="py-2 px-1.5">
                  <ChartControls
                    displayMode={displayMode}
                    onDisplayModeChange={handleDisplayModeChange}
                    showVolume={showVolume}
                    onVolumeToggle={handleVolumeToggle}
                    showMigrationLines={showMigrationLines}
                    onMigrationLinesToggle={handleMigrationLinesToggle}
                    onResetPosition={handleResetChartPosition}
                  />
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-2">
                <div className="dashed-divider w-24"></div>
              </div>

              {/* Follow Section */}
              <div>
                <a
                  href="https://x.com/Trenchooooor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-4 bg-black/85 hover:bg-[#52C97D]/15 transition-all cursor-pointer backdrop-blur-xl"
                  style={{ boxShadow: '0 0 12px rgba(31, 99, 56, 0.3), 0 0 24px rgba(31, 99, 56, 0.15)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#52C97D"/>
                  </svg>
                  <p className="text-[#52C97D] text-base font-bold tracking-wider">@Trenchooooor</p>
                </a>
              </div>
                  </>
                )}

                {mobileMenuTab === 'about' && (
                  <div style={{ padding: '0 20px' }}>
                    {/* What You're Viewing */}
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ marginBottom: '8px' }} className="text-[#52C97D] text-base font-bold tracking-wider uppercase">What You're Viewing</h3>
                      <p style={{ paddingLeft: '8px', lineHeight: '1.6', margin: 0 }} className="text-white/90 text-sm">
                        The complete price history of the ZERA token from its launch on pump.fun through all pool migrations.
                      </p>
                    </div>

                    {/* Divider */}
                    <div style={{ margin: '16px 0' }} className="border-t-2 border-[#52C97D]/30"></div>

                    {/* Token Journey */}
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ marginBottom: '12px' }} className="text-[#52C97D] text-base font-bold tracking-wider uppercase">Token Journey</h3>
                      <div style={{ padding: '16px 20px', marginBottom: '8px' }} className="flex items-center justify-center gap-4 bg-black/50 border-2 border-[#52C97D]/40 rounded-lg">
                        <span className="text-white text-sm font-medium">M0N3Y</span>
                        <svg className="w-5 h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="text-white text-sm font-medium">Raydium</span>
                        <svg className="w-5 h-5 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="text-[#52C97D] text-sm font-bold">Meteora</span>
                      </div>
                      <p style={{ paddingLeft: '8px', lineHeight: '1.6', margin: 0 }} className="text-white/70 text-xs">
                        ZERA started as M0N3Y on pump.fun, then migrated to Raydium, and finally to Meteora (current pool).
                      </p>
                    </div>

                    {/* Divider */}
                    <div style={{ margin: '16px 0' }} className="border-t-2 border-[#52C97D]/30"></div>

                    {/* How To Use */}
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ marginBottom: '12px' }} className="text-[#52C97D] text-base font-bold tracking-wider uppercase">How To Use</h3>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[#52C97D]/30 rounded-lg hover:border-[#52C97D]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[#52C97D] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs">Select timeframes (1H to MAX) from the sidebar</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[#52C97D]/30 rounded-lg hover:border-[#52C97D]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[#52C97D] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs">Zoom: Mouse wheel or pinch on mobile</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[#52C97D]/30 rounded-lg hover:border-[#52C97D]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[#52C97D] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs">Pan: Click and drag or swipe</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[#52C97D]/30 rounded-lg hover:border-[#52C97D]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[#52C97D] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs">Migration events shown as vertical green lines</span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ margin: '16px 0' }} className="border-t-2 border-[#52C97D]/30"></div>

                    {/* Data Sources */}
                    <div style={{ padding: '12px 16px' }} className="text-center bg-black/60 border-2 border-[#52C97D]/40 rounded-lg">
                      <p style={{ margin: 0 }} className="text-white/60 text-xs">
                        <span className="text-[#52C97D] font-bold">Data sources:</span> Jupiter API, DexScreener, GeckoTerminal
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </>
        )}

        {/* Mobile Chart */}
        <div className="w-full h-full">
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-red">Error loading chart data</div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-textMuted">Loading...</div>
            </div>
          )}

          {!isLoading && !error && poolsData && (
            <Chart
              poolsData={poolsData}
              timeframe={timeframe}
              displayMode={displayMode}
              showVolume={showVolume}
              showMigrationLines={showMigrationLines}
              onResetPosition={handleResetChartPosition}
            />
          )}
        </div>
      </div>

      {/* Desktop View - Grid Layout */}
      <div className="hidden md:grid md:grid-cols-[9fr_1fr] w-full h-full overflow-hidden min-h-0">
        {/* Left Section - Chart */}
        <div className="h-full relative overflow-hidden min-h-0">
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-red">Error loading chart data</div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-textMuted">Loading...</div>
            </div>
          )}

          {!isLoading && !error && poolsData && (
            <Chart
              poolsData={poolsData}
              timeframe={timeframe}
              displayMode={displayMode}
              showVolume={showVolume}
              showMigrationLines={showMigrationLines}
              onResetPosition={handleResetChartPosition}
            />
          )}
        </div>

        {/* Right Section - Token Stats Sidebar */}
        <div className="h-full bg-gradient-to-b from-black via-black to-black flex flex-col min-h-0" style={{ boxShadow: '-8px 0 8px rgba(82, 201, 125, 0.2)' }}>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2 space-y-0 min-h-0">
            {/* Main Info Block */}
            <div className="stat-card-highlight">
              <a
                href="https://zeralabs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 mb-2 hover:opacity-80 transition-opacity cursor-pointer group"
              >
                <img
                  src="/circle-logo.avif"
                  alt="ZERA"
                  className="h-7 w-7 group-hover:scale-105 transition-transform"
                />
                <div>
                  <h1 className="text-base font-bold text-white mb-0 group-hover:text-[#52C97D] transition-colors">ZERA</h1>
                  <p className="text-white text-[9px]">Complete Price History</p>
                </div>
              </a>

              <div className="flex items-center justify-center gap-1.5 text-[9px] pt-1.5 pb-1.5 mt-1.5">
                <span className="text-white font-medium">MON3Y</span>
                <span className="text-white">→</span>
                <span className="text-white font-medium">Raydium</span>
                <span className="text-white">→</span>
                <span className="text-[#52C97D] font-bold">Meteora</span>
              </div>

              {/* DEX Screener Link */}
              <div style={{ marginTop: '12px', paddingTop: '12px', paddingBottom: '4px' }} className="border-t border-[#52C97D]/20">
                <a
                  href="https://dexscreener.com/solana/6oUJD1EHNVBNMeTpytmY2NxKWicz5C2JUbByUrHEsjhc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-[9px] text-white/70 hover:text-[#52C97D] transition-colors group"
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>View on DEX Screener</span>
                </a>
              </div>
            </div>

            {/* Decorative Divider */}
            <div className="dashed-divider"></div>

            {/* Timeframe Toggle */}
            <div className="stat-card">
              <p className="text-white text-[10px] font-medium mb-1 text-center">Timeframe</p>
              <TimeframeToggle
                currentTimeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            </div>

            {/* Decorative Divider */}
            <div className="dashed-divider"></div>

            {/* Token Stats */}
            <TokenStats stats={timeframeStats || null} isLoading={isStatsLoading} timeframe={timeframe} />

            {/* Decorative Divider */}
            <div className="dashed-divider"></div>

            {/* Chart Controls */}
            <ChartControls
              displayMode={displayMode}
              onDisplayModeChange={handleDisplayModeChange}
              showVolume={showVolume}
              onVolumeToggle={handleVolumeToggle}
              showMigrationLines={showMigrationLines}
              onMigrationLinesToggle={handleMigrationLinesToggle}
              onResetPosition={handleResetChartPosition}
            />

            {/* Extra spacing before sticky button */}
            <div className="h-1"></div>
          </div>

          {/* Sticky Bottom Section */}
          <div className="flex-shrink-0 bg-black">
            {/* Decorative Divider */}
            <div className="dashed-divider"></div>

            {/* Follow Section */}
            <a
              href="https://x.com/Trenchooooor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 bg-black/85 hover:bg-[#52C97D]/15 transition-all cursor-pointer backdrop-blur-xl w-full"
              style={{ boxShadow: '0 0 12px rgba(31, 99, 56, 0.3), 0 0 24px rgba(31, 99, 56, 0.15)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#52C97D"/>
              </svg>
              <p className="text-[#52C97D] text-base font-bold tracking-wider">@Trenchooooor</p>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-textMuted">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
