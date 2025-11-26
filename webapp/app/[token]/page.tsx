'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Copy, Check, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Chart from '@/components/Chart';
import { FeesView } from '@/components/FeesView';
import { HoldersView } from '@/components/HoldersView';
import { BurnsView } from '@/components/BurnsView';
import TimeframeToggle from '@/components/TimeframeToggle';
import FeesTimeframeToggle from '@/components/FeesTimeframeToggle';
import HoldersTimeframeToggle from '@/components/HoldersTimeframeToggle';
import BurnsTimeframeToggle from '@/components/BurnsTimeframeToggle';
import ChartControls from '@/components/ChartControls';
import TokenStats from '@/components/TokenStats';
import { TokenLoadingLogo } from '@/components/TokenLoadingLogo';
import { TokenSwitcher } from '@/components/TokenSwitcher';
import { TokenContextProvider, useTokenContext } from '@/lib/TokenContext';
import { useTheme } from '@/lib/useTheme';
import { fetchAllPoolsData, fetchTokenStats, fetchWalletBalance, fetchTokenBalance } from '@/lib/api';
import { PoolData, Timeframe, ProjectConfig } from '@/lib/types';
import { SafeStorage } from '@/lib/localStorage';

function HomeContent() {
  const { currentProject, isLoading: projectLoading, isSwitching, error: projectError } = useTokenContext();

  // Debug: Log loading states
  console.log('[PAGE] Loading states:', {
    projectLoading,
    isSwitching,
    loaderUrl: currentProject?.loaderUrl,
    projectName: currentProject?.name
  });

  const themeStyles = useTheme(currentProject?.primaryColor || 'var(--primary-color)');
  const primaryColor = currentProject?.primaryColor || '#52C97D';
  const secondaryColor = currentProject?.secondaryColor || '#000000';

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get parameters from URL or use defaults
  const urlChartTimeframe = searchParams.get('chartTimeframe') as Timeframe | null;
  const urlView = searchParams.get('view') as 'chart' | 'fees' | 'holders' | 'burns' | null;
  const urlFeesTimeframe = searchParams.get('feesTimeframe') as '7D' | '30D' | '90D' | 'ALL' | null;
  const urlHoldersTimeframe = searchParams.get('holdersTimeframe') as '1D' | '7D' | '30D' | '90D' | 'ALL' | null;
  const urlBurnsTimeframe = searchParams.get('burnsTimeframe') as '7D' | '30D' | '90D' | 'ALL' | null;

  const validTimeframes: Timeframe[] = ['1H', '4H', '8H', '1D', 'MAX'];
  const validFeesTimeframes = ['7D', '30D', '90D', 'ALL'];
  const validHoldersTimeframes = ['1D', '7D', '30D', '90D', 'ALL'];
  const validBurnsTimeframes = ['7D', '30D', '90D', 'ALL'];

  const initialTimeframe = urlChartTimeframe && validTimeframes.includes(urlChartTimeframe) ? urlChartTimeframe : '1D';
  const initialViewMode = urlView && ['chart', 'fees', 'holders', 'burns'].includes(urlView) ? urlView : 'chart';
  const initialFeesTimeframe = urlFeesTimeframe && validFeesTimeframes.includes(urlFeesTimeframe) ? urlFeesTimeframe : 'ALL';
  const initialHoldersTimeframe = urlHoldersTimeframe && validHoldersTimeframes.includes(urlHoldersTimeframe) ? urlHoldersTimeframe : '30D';
  const initialBurnsTimeframe = urlBurnsTimeframe && validBurnsTimeframes.includes(urlBurnsTimeframe) ? urlBurnsTimeframe : 'ALL';

  const [timeframe, setTimeframeState] = useState<Timeframe>(initialTimeframe);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [mobileMenuTab, setMobileMenuTab] = useState<'settings' | 'about'>('settings');
  const [viewMode, setViewModeState] = useState<'chart' | 'fees' | 'holders' | 'burns'>(initialViewMode);
  const [feesTimeframe, setFeesTimeframeState] = useState<'7D' | '30D' | '90D' | 'ALL'>(initialFeesTimeframe);
  const [holdersTimeframe, setHoldersTimeframeState] = useState<'1D' | '7D' | '30D' | '90D' | 'ALL'>(initialHoldersTimeframe);
  const [burnsTimeframe, setBurnsTimeframeState] = useState<'7D' | '30D' | '90D' | 'ALL'>(initialBurnsTimeframe);

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
  const [isLogScale, setIsLogScale] = useState<boolean>(false);
  const [isAutoScale, setIsAutoScale] = useState<boolean>(true);

  // Goal state management - initialize with defaults
  const [tokenGoal, setTokenGoal] = useState<number>(5000);
  const [solGoal, setSolGoal] = useState<number>(10);

  // Sidebar collapse state - initialize with default
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Popover state management
  const [isTimeframePopoverOpen, setIsTimeframePopoverOpen] = useState(false);
  const [isDisplayModePopoverOpen, setIsDisplayModePopoverOpen] = useState(false);
  const [isChartOptionsPopoverOpen, setIsChartOptionsPopoverOpen] = useState(false);

  // Helper function to format goal numbers
  const formatGoalNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
    }
    return num.toString();
  };

  // Helper function to format fee numbers
  const formatFeesNumber = (num: number): string => {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };


  // Sync state with URL params when they change
  useEffect(() => {
    const urlChartTimeframe = searchParams.get('chartTimeframe') as Timeframe | null;
    const urlView = searchParams.get('view') as 'chart' | 'fees' | 'holders' | 'burns' | null;
    const urlFeesTimeframe = searchParams.get('feesTimeframe') as '7D' | '30D' | '90D' | 'ALL' | null;
    const urlHoldersTimeframe = searchParams.get('holdersTimeframe') as '1D' | '7D' | '30D' | '90D' | 'ALL' | null;
    const urlBurnsTimeframe = searchParams.get('burnsTimeframe') as '7D' | '30D' | '90D' | 'ALL' | null;

    if (urlChartTimeframe && validTimeframes.includes(urlChartTimeframe)) {
      setTimeframeState(urlChartTimeframe);
    }
    if (urlView && ['chart', 'fees', 'holders', 'burns'].includes(urlView)) {
      setViewModeState(urlView);
    }
    if (urlFeesTimeframe && validFeesTimeframes.includes(urlFeesTimeframe)) {
      setFeesTimeframeState(urlFeesTimeframe);
    }
    if (urlHoldersTimeframe && validHoldersTimeframes.includes(urlHoldersTimeframe)) {
      setHoldersTimeframeState(urlHoldersTimeframe);
    }
    if (urlBurnsTimeframe && validBurnsTimeframes.includes(urlBurnsTimeframe)) {
      setBurnsTimeframeState(urlBurnsTimeframe);
    }
  }, [searchParams]);

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

    const savedLogScale = SafeStorage.getItem('chartLogScale');
    if (savedLogScale !== null) {
      setIsLogScale(savedLogScale === 'true');
    }

    const savedAutoScale = SafeStorage.getItem('chartAutoScale');
    if (savedAutoScale !== null) {
      setIsAutoScale(savedAutoScale !== 'false');
    }

    // Load sidebar collapse state
    const savedSidebarCollapsed = SafeStorage.getItem('sidebarCollapsed');
    if (savedSidebarCollapsed !== null) {
      setIsSidebarCollapsed(savedSidebarCollapsed === 'true');
    }

    // Load saved goals
    const savedTokenGoal = SafeStorage.getItem('tokenGoal');
    if (savedTokenGoal !== null) {
      setTokenGoal(parseFloat(savedTokenGoal));
    }

    const savedSolGoal = SafeStorage.getItem('solGoal');
    if (savedSolGoal !== null) {
      setSolGoal(parseFloat(savedSolGoal));
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

  const handleLogScaleToggle = () => {
    const newLogScale = !isLogScale;
    setIsLogScale(newLogScale);
    SafeStorage.setItem('chartLogScale', String(newLogScale));
  };

  const handleAutoScaleToggle = () => {
    const newAutoScale = !isAutoScale;
    setIsAutoScale(newAutoScale);
    SafeStorage.setItem('chartAutoScale', String(newAutoScale));
  };

  const handleSidebarToggle = () => {
    const newCollapsed = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsed);
    SafeStorage.setItem('sidebarCollapsed', String(newCollapsed));
  };

  // Update URL when timeframe changes
  const setTimeframe = (newTimeframe: Timeframe) => {
    setTimeframeState(newTimeframe);
    const params = new URLSearchParams(searchParams.toString());
    params.set('chartTimeframe', newTimeframe);
    const tokenSlug = currentProject?.slug || 'zera';
    router.push(`/${tokenSlug}?${params.toString()}`, { scroll: false });
  };

  // Update URL when view mode changes
  const setViewMode = (newViewMode: 'chart' | 'fees' | 'holders' | 'burns') => {
    setViewModeState(newViewMode);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newViewMode);

    // Remove chartTimeframe when not in chart view
    if (newViewMode === 'fees') {
      params.delete('chartTimeframe');
      params.delete('holdersTimeframe');
      params.delete('burnsTimeframe');
      params.set('feesTimeframe', feesTimeframe);
    } else if (newViewMode === 'holders') {
      params.delete('chartTimeframe');
      params.delete('feesTimeframe');
      params.delete('burnsTimeframe');
      params.set('holdersTimeframe', holdersTimeframe);
    } else if (newViewMode === 'burns') {
      params.delete('chartTimeframe');
      params.delete('feesTimeframe');
      params.delete('holdersTimeframe');
      params.set('burnsTimeframe', burnsTimeframe);
    } else if (newViewMode === 'chart') {
      params.set('chartTimeframe', timeframe);
      params.delete('feesTimeframe');
      params.delete('holdersTimeframe');
      params.delete('burnsTimeframe');
    }

    const tokenSlug = currentProject?.slug || 'zera';
    router.push(`/${tokenSlug}?${params.toString()}`, { scroll: false });
  };

  // Update URL when fees timeframe changes
  const setFeesTimeframe = (newFeesTimeframe: '7D' | '30D' | '90D' | 'ALL') => {
    setFeesTimeframeState(newFeesTimeframe);
    const params = new URLSearchParams(searchParams.toString());
    params.set('feesTimeframe', newFeesTimeframe);
    const tokenSlug = currentProject?.slug || 'zera';
    router.push(`/${tokenSlug}?${params.toString()}`, { scroll: false });
  };

  // Update URL when holders timeframe changes
  const setHoldersTimeframe = (newHoldersTimeframe: '1D' | '7D' | '30D' | '90D' | 'ALL') => {
    setHoldersTimeframeState(newHoldersTimeframe);
    const params = new URLSearchParams(searchParams.toString());
    params.set('holdersTimeframe', newHoldersTimeframe);
    const tokenSlug = currentProject?.slug || 'zera';
    router.push(`/${tokenSlug}?${params.toString()}`, { scroll: false });
  };

  // Update URL when burns timeframe changes
  const setBurnsTimeframe = (newBurnsTimeframe: '7D' | '30D' | '90D' | 'ALL') => {
    setBurnsTimeframeState(newBurnsTimeframe);
    const params = new URLSearchParams(searchParams.toString());
    params.set('burnsTimeframe', newBurnsTimeframe);
    const tokenSlug = currentProject?.slug || 'zera';
    router.push(`/${tokenSlug}?${params.toString()}`, { scroll: false });
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

  // Handle copy address - use project's donation address
  const solanaAddress = currentProject?.donationAddress || '';
  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!solanaAddress) return;
    navigator.clipboard.writeText(solanaAddress);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);

    // Get button position for confetti origin
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Cute confetti burst in brand colors
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { x, y },
      colors: [currentProject?.primaryColor || '#52C97D', '#FFFFFF'],
      startVelocity: 30,
      decay: 0.88,
      scalar: 0.8,
      gravity: 0.8, // Lighter gravity for more outward spread
    });
  };

  // Get the current pool address (last pool in the chain)
  const currentPoolAddress = currentProject?.pools?.[currentProject.pools.length - 1]?.poolAddress;

  // Fetch data with SWR for automatic revalidation
  // Optimized intervals for live updates while respecting rate limits
  const { data: poolsData, error, isLoading } = useSWR<PoolData[]>(
    currentProject ? `/api/pools/${currentProject.slug}/${timeframe}` : null,
    () => currentProject ? fetchAllPoolsData(currentProject, timeframe) : Promise.resolve([]),
    {
      // More frequent updates for shorter timeframes
      refreshInterval: timeframe === '1H' ? 60000   // 1 minute for 1H
                     : timeframe === '4H' ? 180000  // 3 minutes for 4H
                     : timeframe === '8H' ? 240000  // 4 minutes for 8H
                     : timeframe === '1D' ? 300000  // 5 minutes for 1D
                     : 600000,                      // 10 minutes for MAX
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

  // Fetch token stats for the current pool
  // More frequent updates for price/stats which change rapidly
  const { data: tokenStats, isLoading: isStatsLoading } = useSWR(
    currentProject && currentPoolAddress ? `token-stats-${currentProject.slug}` : null,
    () => currentProject && currentPoolAddress ? fetchTokenStats(currentProject, currentPoolAddress) : Promise.resolve(null),
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

  // Fetch wallet balance for donation goal (only if address is available)
  const { data: walletBalance = 0 } = useSWR(
    solanaAddress ? `wallet-balance-${solanaAddress}` : null,
    () => solanaAddress ? fetchWalletBalance(solanaAddress) : Promise.resolve(0),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryInterval: 15000,
      errorRetryCount: 3,
    }
  );

  // Fetch token balance for donation goal (only if address is available)
  // Use the current token address
  const currentTokenAddress = currentProject?.pools?.[currentProject.pools.length - 1]?.tokenAddress;
  const { data: tokenBalance = 0 } = useSWR(
    solanaAddress && currentTokenAddress ? `token-balance-${solanaAddress}-${currentTokenAddress}` : null,
    () => (solanaAddress && currentTokenAddress) ? fetchTokenBalance(solanaAddress, currentTokenAddress) : Promise.resolve(0),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryInterval: 15000,
      errorRetryCount: 3,
    }
  );

  // Fetch fees data for sidebar display (only when in fees view)
  const { data: feesData } = useSWR(
    viewMode === 'fees' && currentProject ? `/api/fees/${currentProject.slug}?timeframe=${feesTimeframe}` : null,
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

  // Helper function to format price for title
  const formatPriceForTitle = (price: number): string => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };

  // Update document title when project changes or price updates
  useEffect(() => {
    if (currentProject && tokenStats) {
      const priceStr = formatPriceForTitle(tokenStats.price);
      document.title = `${currentProject.name} | ${priceStr}`;
    } else if (currentProject) {
      document.title = `${currentProject.name}`;
    }
  }, [currentProject, tokenStats]);

  // Stable loading state to prevent flash during transitions
  const [showLoader, setShowLoader] = useState(true); // Start with true to show loader immediately
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const loaderStartTimeRef = useRef<number | null>(null);
  const switchStartTimeRef = useRef<number | null>(null); // Track when switch started
  const switchingFromProjectRef = useRef<ProjectConfig | null>(null); // Store the project we're switching FROM
  const MINIMUM_LOADER_DURATION = 800; // Minimum time to show loader (ms)

  // Dedicated effect for handling token switching loader
  useEffect(() => {
    if (isSwitching) {
      // Token switch started - capture current project and record time
      switchingFromProjectRef.current = currentProject;
      switchStartTimeRef.current = Date.now();
      loaderStartTimeRef.current = Date.now();
      setShowLoader(true);
      console.log('[PAGE] Token switch detected - capturing project and forcing loader to show');
    } else if (switchStartTimeRef.current !== null) {
      // Token switch completed - ensure minimum display time before hiding
      const elapsed = Date.now() - switchStartTimeRef.current;
      const remaining = MINIMUM_LOADER_DURATION - elapsed;

      console.log(`[PAGE] Token switch complete. Elapsed: ${elapsed}ms, Remaining: ${remaining}ms`);

      if (remaining > 0) {
        // Still need to wait - schedule hide after remaining time
        const timer = setTimeout(() => {
          console.log('[PAGE] Minimum duration elapsed - clearing switch refs');
          switchStartTimeRef.current = null;
          switchingFromProjectRef.current = null;
          loaderStartTimeRef.current = null;
          // Let the main loading effect handle hiding the loader
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        // Minimum duration already passed
        console.log('[PAGE] Minimum duration already elapsed - clearing switch refs');
        switchStartTimeRef.current = null;
        switchingFromProjectRef.current = null;
        loaderStartTimeRef.current = null;
      }
    }
  }, [isSwitching, currentProject]);

  useEffect(() => {
    // On initial load, keep loader visible until we have ALL data
    if (!hasInitiallyLoaded) {
      // Record start time on first render
      if (!loaderStartTimeRef.current) {
        loaderStartTimeRef.current = Date.now();
      }

      // Debug: Log readiness status
      console.log('[PAGE] Initial load readiness:', {
        hasProject: !!currentProject,
        hasPoolsData: !!poolsData,
        hasTokenStats: !!tokenStats,
        isLoading,
        projectLoading,
        isStatsLoading,
        isSwitching
      });

      // Hide loader when we have all data (project, pools, stats) AND not switching
      if (currentProject && poolsData && tokenStats && !isLoading && !projectLoading && !isStatsLoading && !isSwitching) {
        console.log('[PAGE] All data ready! Hiding loader...');
        const hideLoader = () => {
          console.log('[PAGE] Loader hidden, initial load complete');
          setHasInitiallyLoaded(true);
          setShowLoader(false);
          loaderStartTimeRef.current = null;
        };

        const elapsed = Date.now() - (loaderStartTimeRef.current || 0);
        const remaining = MINIMUM_LOADER_DURATION - elapsed;

        if (remaining > 0) {
          // Wait for remaining time to ensure smooth animation
          const timer = setTimeout(hideLoader, remaining);
          return () => clearTimeout(timer);
        } else {
          hideLoader();
        }
      }
    } else {
      // After initial load, show loader during switching or when loading data
      const shouldShowLoader = isLoading || projectLoading || isSwitching;

      if (shouldShowLoader && !showLoader) {
        // Starting to show loader - record start time (if not already set by switch effect)
        if (!loaderStartTimeRef.current) {
          loaderStartTimeRef.current = Date.now();
        }
        setShowLoader(true);
        console.log('[PAGE] Showing loader for data update');
      } else if (!shouldShowLoader && showLoader) {
        // Data is ready and not switching
        // IMPORTANT: Don't hide if we're still in the minimum switch duration window
        if (switchStartTimeRef.current !== null) {
          console.log('[PAGE] Data ready but still in switch minimum duration - keeping loader visible');
          return; // Keep showing loader until switch duration completes
        }

        // Hide loader with minimum duration check (for non-switch loading)
        if (loaderStartTimeRef.current) {
          const elapsed = Date.now() - loaderStartTimeRef.current;
          const remaining = MINIMUM_LOADER_DURATION - elapsed;

          if (remaining > 0) {
            console.log(`[PAGE] Waiting ${remaining}ms more before hiding loader (minimum duration)`);
            const timer = setTimeout(() => {
              setShowLoader(false);
              loaderStartTimeRef.current = null;
              console.log('[PAGE] Loader hidden after data update');
            }, remaining);
            return () => clearTimeout(timer);
          }
        }

        // Hide immediately if no timing constraints
        setShowLoader(false);
        loaderStartTimeRef.current = null;
        console.log('[PAGE] Loader hidden after data update');
      }
    }
  }, [isLoading, projectLoading, isStatsLoading, isSwitching, hasInitiallyLoaded, currentProject, poolsData, tokenStats, showLoader]);

  // Auto-scale goals when met
  useEffect(() => {
    if (tokenBalance >= tokenGoal && tokenBalance > 0) {
      const newGoal = tokenGoal * 2;
      setTokenGoal(newGoal);
      SafeStorage.setItem('tokenGoal', String(newGoal));
    }
  }, [tokenBalance, tokenGoal]);

  useEffect(() => {
    if (walletBalance >= solGoal && walletBalance > 0) {
      const newGoal = solGoal * 2;
      setSolGoal(newGoal);
      SafeStorage.setItem('solGoal', String(newGoal));
    }
  }, [walletBalance, solGoal]);

  // Calculate timeframe-specific stats from chart data
  const timeframeStats = React.useMemo(() => {
    if (!poolsData || poolsData.length === 0 || !tokenStats) return null;

    // For MAX timeframe, use the all-time values directly from tokenStats
    if (timeframe === 'MAX') {
      // Get all pool data for MAX timeframe price calculation
      const allData = poolsData.flatMap(p => p.data).sort((a, b) => a.time - b.time);
      if (allData.length === 0) return tokenStats;

      const startingPrice = allData[0].close;
      const currentPrice = tokenStats.price;
      const priceChangePercent = startingPrice !== 0 ? ((currentPrice - startingPrice) / startingPrice) * 100 : 0;

      return {
        ...tokenStats,
        volume24h: tokenStats.allTimeVolume || tokenStats.volume24h,
        priceChange24h: priceChangePercent,
        fees24h: tokenStats.allTimeFees || tokenStats.fees24h,
      };
    }

    // Get the most recent pool data (last pool in chain)
    const currentPoolData = poolsData[poolsData.length - 1];
    if (!currentPoolData || currentPoolData.data.length === 0) return tokenStats;

    const data = currentPoolData.data;
    const now = Math.floor(Date.now() / 1000);

    // Get the current pool config to check fee rate and migration start time
    const currentPool = currentProject?.pools[currentProject.pools.length - 1];
    const feeRate = currentPool?.feeRate || 0;

    // Find when this pool started collecting fees (its migration start date)
    const poolStartMigration = currentProject?.migrations.find(m => m.toPoolId === currentPool?.id);
    const feeStartTimestamp = poolStartMigration?.migrationTimestamp || 0;

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

    // Sort data by time ascending
    const sortedData = [...data].sort((a, b) => a.time - b.time);

    // Find the candle closest to but not after the startTime for the starting price
    // This gives us the price at the beginning of the timeframe
    let startingPrice = sortedData[0].close;
    for (let i = 0; i < sortedData.length; i++) {
      if (sortedData[i].time <= startTime) {
        startingPrice = sortedData[i].close;
      } else {
        break;
      }
    }

    // Filter data for volume/fees calculation - only candles within the timeframe
    const timeframeData = sortedData.filter(d => d.time > startTime);

    if (timeframeData.length === 0) return tokenStats;

    // Calculate volume for timeframe (only candles after startTime)
    const volumeForTimeframe = timeframeData.reduce((sum, d) => sum + (d.volume || 0), 0);

    // Calculate price change for timeframe
    // Use the live current price instead of the last candle's close for accuracy
    const currentPrice = tokenStats.price;
    const priceChangePercent = startingPrice !== 0 ? ((currentPrice - startingPrice) / startingPrice) * 100 : 0;

    // Calculate fees ONLY from the timestamp when this pool started collecting fees
    // AND only if the pool has a fee_rate > 0
    let feesForTimeframe = 0;
    if (feeRate > 0 && feeStartTimestamp > 0) {
      const feeEligibleData = timeframeData.filter(d => d.time >= feeStartTimestamp);
      const volumeForFees = feeEligibleData.reduce((sum, d) => sum + (d.volume || 0), 0);
      feesForTimeframe = volumeForFees * feeRate;
    }

    return {
      ...tokenStats,
      volume24h: volumeForTimeframe,
      priceChange24h: priceChangePercent,
      fees24h: feesForTimeframe,
    };
  }, [poolsData, tokenStats, timeframe]);

  // Show project error state (only show error, not loading - let the UI render with loading in chart area)
  if (projectError) {
    return (
      <main className="w-screen h-screen overflow-hidden flex items-center justify-center bg-black">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">Error Loading Project</p>
          <p>{projectError}</p>
        </div>
      </main>
    );
  }

  // If project is still loading, don't block the UI - render with loading state in chart area
  if (!currentProject) {
    return null;
  }

  return (
    <main className="w-screen h-screen overflow-hidden grid grid-rows-[auto_1fr]" style={themeStyles}>
      {/* Donation Banner */}
      <motion.div
        className="relative bg-gradient-to-r from-black via-[var(--primary-darker)]/30 to-black border-b-2 border-[var(--primary-color)]/50 backdrop-blur-sm"
        style={{ boxShadow: `0 4px 20px rgba(var(--primary-rgb), 0.25)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
        onTouchStart={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary-color)]/20 to-transparent opacity-50"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentProject.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
            className="w-full relative px-3 sm:px-6"
          >
          {/* Desktop: 3-column layout (≥ 1024px) */}
          <div className="hidden lg:flex items-center justify-center gap-4 py-5">
            {/* Logo - Far Left */}
            <div className="absolute left-6 flex items-center justify-center">
              <svg
                className="w-12 h-12"
                style={{
                  color: primaryColor,
                  filter: `drop-shadow(0 0 8px ${hexToRgba(primaryColor, 0.6)}) drop-shadow(0 0 4px ${hexToRgba(primaryColor, 0.4)})`
                }}
                viewBox="57 135 388 232"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Migrate Chart"
              >
                <path fill="currentColor" d="M135.423309,290.383972 C135.222244,292.157013 134.849457,293.929749 134.846222,295.703156 C134.806274,317.680511 134.820129,339.657990 134.820129,361.635437 C134.820129,363.432007 134.820129,365.228577 134.820129,367.319092 C108.857216,367.319092 83.287056,367.319092 57.352207,367.319092 C57.352207,341.704376 57.352207,316.037659 57.352207,289.918823 C83.140572,289.918823 108.899254,289.918823 135.063660,290.174957 C135.469360,290.431091 135.423309,290.383972 135.423309,290.383972z"/>
                <path fill="currentColor" d="M290.364258,290.336945 C290.217560,292.805908 289.947449,295.274719 289.943604,297.743896 C289.910065,319.238007 289.924225,340.732239 289.924225,362.226410 C289.924225,363.852112 289.924225,365.477844 289.924225,367.357361 C263.907196,367.357361 238.310226,367.357361 211.965073,367.357361 C211.965073,341.967926 211.965073,316.566803 211.812134,290.761261 C211.659195,290.356812 211.589157,290.420380 211.589157,290.420380 C213.204071,290.267975 214.818726,289.985748 216.433914,289.982635 C240.827682,289.935608 265.221497,289.925293 290.014832,290.152710 C290.414307,290.399109 290.364258,290.336945 290.364258,290.336945z"/>
                <path fill="currentColor" d="M445.290466,169.000153 C445.290466,183.634445 445.290466,197.768707 445.290466,212.257187 C419.463715,212.257187 393.941895,212.257187 368.161346,212.257187 C368.161346,186.667191 368.161346,161.109375 368.161346,135.257370 C393.655151,135.257370 419.195465,135.257370 445.290466,135.257370 C445.290466,146.339661 445.290466,157.419907 445.290466,169.000153z"/>
                <path fill="currentColor" d="M135.497192,290.448730 C135.251816,289.392853 134.742188,288.319763 134.740173,287.245728 C134.695267,263.252930 134.703552,239.260025 134.718506,215.267151 C134.719009,214.463577 134.893936,213.660110 135.013840,212.631134 C160.586761,212.631134 186.014481,212.631134 212.069183,212.631134 C212.069183,238.286774 212.069183,263.867767 211.829163,289.934570 C211.589157,290.420380 211.659195,290.356812 211.677277,290.329926 C186.528381,290.218719 161.361404,290.134399 135.808868,290.217041 C135.423309,290.383972 135.469360,290.431091 135.497192,290.448730z"/>
                <path fill="currentColor" d="M290.446106,290.423218 C290.253357,289.345978 289.834564,288.244904 289.832825,287.143219 C289.795258,263.321381 289.801147,239.499527 289.815552,215.677673 C289.816132,214.720184 289.982727,213.762787 290.090454,212.607132 C315.730774,212.607132 341.153046,212.607132 366.859802,212.607132 C366.859802,238.324921 366.859802,263.892670 366.859802,290.047455 C341.672607,290.047455 316.414978,290.047455 290.760803,290.192200 C290.364258,290.336945 290.414307,290.399109 290.446106,290.423218z"/>
                <path fill="currentColor" d="M445.290466,302.007385 C445.290466,323.963470 445.290466,345.421448 445.290466,367.245850 C419.480499,367.245850 393.966675,367.245850 368.177490,367.245850 C368.177490,341.667480 368.177490,316.112549 368.177490,290.260376 C393.644684,290.260376 419.183838,290.260376 445.290466,290.260376 C445.290466,293.993011 445.290466,297.751160 445.290466,302.007385z"/>
              </svg>
            </div>

            {/* Column 1: Address Bar + Copy Button */}
            <div className="flex items-center justify-center gap-2">
              <motion.div
                className="flex items-center gap-2 bg-black/60 px-4 py-[11px] rounded-lg border border-[var(--primary-color)]/40 overflow-hidden flex-shrink min-w-0 h-[48px]"
                whileHover={{ borderColor: hexToRgba(primaryColor, 0.7) }}
              >
                <code className="text-[var(--primary-color)] text-sm font-mono select-all truncate">
                  {solanaAddress}
                </code>
              </motion.div>

              <motion.button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 px-4 py-[11px] bg-[var(--primary-color)] font-bold text-sm rounded-lg shadow-lg w-[100px] flex-shrink-0 h-[48px]"
                style={{ color: secondaryColor }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 0 20px ${hexToRgba(primaryColor, 0.5)}`
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
                      <span>Copied!</span>
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
                      <span>Copy</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-[var(--primary-color)]/30"></div>

            {/* Column 2: Donate Message */}
            <div className="flex items-center justify-center gap-2">
              <motion.div
                className="flex items-center justify-center"
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Heart className="w-6 h-6 text-[var(--primary-color)] fill-[var(--primary-color)]" />
              </motion.div>
              <div className="flex flex-col gap-0.5 items-center justify-center">
                <p className="text-white font-bold text-base leading-tight">
                  Support This Free Tool
                </p>
                <p className="text-white/70 text-xs leading-tight">
                  Donate via Solana Network
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-[var(--primary-color)]/30"></div>

            {/* Column 3: Donate Goal - Stacked Progress Bars */}
            <div className="flex items-center justify-center">
              <div className="flex flex-col gap-1 bg-black/60 px-4 py-2 rounded-lg border border-[var(--primary-color)]/30">
                {/* Token Balance */}
                <div className="flex items-center gap-2">
                  <div className="relative w-28 h-1.5 bg-black/60 rounded-full overflow-hidden border border-[var(--primary-color)]/30">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--primary-color)] to-[#3FAA66] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((tokenBalance / tokenGoal) * 100, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: 'linear'
                      }}
                    />
                  </div>
                  <span className="text-[var(--primary-color)] text-xs font-bold whitespace-nowrap">{tokenBalance.toFixed(0)} / {formatGoalNumber(tokenGoal)} {currentProject.pools[currentProject.pools.length - 1]?.tokenSymbol}</span>
                </div>

                {/* SOL Balance */}
                <div className="flex items-center gap-2">
                  <div className="relative w-28 h-1.5 bg-black/60 rounded-full overflow-hidden border border-[var(--primary-color)]/30">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--primary-color)] to-[#3FAA66] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((walletBalance / solGoal) * 100, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: 'linear'
                      }}
                    />
                  </div>
                  <span className="text-[var(--primary-color)] text-xs font-bold whitespace-nowrap">{walletBalance.toFixed(2)} / {formatGoalNumber(solGoal)} SOL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile and Tablet: Stacked layout (< 1024px) */}
          <div className="flex lg:hidden flex-col items-center gap-2 py-3 w-full relative">
            {/* Logo and Call to Action Row */}
            <div className="flex items-center justify-between w-full px-3">
              {/* Logo - Far Left */}
              <div className="flex-shrink-0">
                <svg
                  className="w-10 h-10"
                  style={{
                    color: primaryColor,
                    filter: `drop-shadow(0 0 8px ${hexToRgba(primaryColor, 0.6)}) drop-shadow(0 0 4px ${hexToRgba(primaryColor, 0.4)})`
                  }}
                  viewBox="57 135 388 232"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Migrate Chart"
                >
                  <path fill="currentColor" d="M135.423309,290.383972 C135.222244,292.157013 134.849457,293.929749 134.846222,295.703156 C134.806274,317.680511 134.820129,339.657990 134.820129,361.635437 C134.820129,363.432007 134.820129,365.228577 134.820129,367.319092 C108.857216,367.319092 83.287056,367.319092 57.352207,367.319092 C57.352207,341.704376 57.352207,316.037659 57.352207,289.918823 C83.140572,289.918823 108.899254,289.918823 135.063660,290.174957 C135.469360,290.431091 135.423309,290.383972 135.423309,290.383972z"/>
                  <path fill="currentColor" d="M290.364258,290.336945 C290.217560,292.805908 289.947449,295.274719 289.943604,297.743896 C289.910065,319.238007 289.924225,340.732239 289.924225,362.226410 C289.924225,363.852112 289.924225,365.477844 289.924225,367.357361 C263.907196,367.357361 238.310226,367.357361 211.965073,367.357361 C211.965073,341.967926 211.965073,316.566803 211.812134,290.761261 C211.659195,290.356812 211.589157,290.420380 211.589157,290.420380 C213.204071,290.267975 214.818726,289.985748 216.433914,289.982635 C240.827682,289.935608 265.221497,289.925293 290.014832,290.152710 C290.414307,290.399109 290.364258,290.336945 290.364258,290.336945z"/>
                  <path fill="currentColor" d="M445.290466,169.000153 C445.290466,183.634445 445.290466,197.768707 445.290466,212.257187 C419.463715,212.257187 393.941895,212.257187 368.161346,212.257187 C368.161346,186.667191 368.161346,161.109375 368.161346,135.257370 C393.655151,135.257370 419.195465,135.257370 445.290466,135.257370 C445.290466,146.339661 445.290466,157.419907 445.290466,169.000153z"/>
                  <path fill="currentColor" d="M135.497192,290.448730 C135.251816,289.392853 134.742188,288.319763 134.740173,287.245728 C134.695267,263.252930 134.703552,239.260025 134.718506,215.267151 C134.719009,214.463577 134.893936,213.660110 135.013840,212.631134 C160.586761,212.631134 186.014481,212.631134 212.069183,212.631134 C212.069183,238.286774 212.069183,263.867767 211.829163,289.934570 C211.589157,290.420380 211.659195,290.356812 211.677277,290.329926 C186.528381,290.218719 161.361404,290.134399 135.808868,290.217041 C135.423309,290.383972 135.469360,290.431091 135.497192,290.448730z"/>
                  <path fill="currentColor" d="M290.446106,290.423218 C290.253357,289.345978 289.834564,288.244904 289.832825,287.143219 C289.795258,263.321381 289.801147,239.499527 289.815552,215.677673 C289.816132,214.720184 289.982727,213.762787 290.090454,212.607132 C315.730774,212.607132 341.153046,212.607132 366.859802,212.607132 C366.859802,238.324921 366.859802,263.892670 366.859802,290.047455 C341.672607,290.047455 316.414978,290.047455 290.760803,290.192200 C290.364258,290.336945 290.414307,290.399109 290.446106,290.423218z"/>
                  <path fill="currentColor" d="M445.290466,302.007385 C445.290466,323.963470 445.290466,345.421448 445.290466,367.245850 C419.480499,367.245850 393.966675,367.245850 368.177490,367.245850 C368.177490,341.667480 368.177490,316.112549 368.177490,290.260376 C393.644684,290.260376 419.183838,290.260376 445.290466,290.260376 C445.290466,293.993011 445.290466,297.751160 445.290466,302.007385z"/>
                </svg>
              </div>

              {/* Menu Button - Far Right */}
              <motion.button
                onClick={() => setShowMobileMenu(true)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-black/60 border-2 rounded-lg backdrop-blur-sm hover:bg-black/80 transition-all"
                style={{ borderColor: `${primaryColor}40` }}
                whileHover={{
                  borderColor: hexToRgba(primaryColor, 0.7),
                  boxShadow: `0 0 12px ${hexToRgba(primaryColor, 0.3)}`
                }}
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>

              {/* Call to Action - Centered */}
              <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
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
                  <Heart className="w-4 h-4 text-[var(--primary-color)] fill-[var(--primary-color)]" />
                </motion.div>
                <div className="text-center">
                  <p className="text-white font-bold text-xs leading-tight">
                    Support This Free Tool
                  </p>
                  <p className="text-white/70 text-[10px] leading-tight">
                    Donate via Solana Network
                  </p>
                </div>
              </div>
            </div>

            {/* Donation Goal Progress Bars - Stacked */}
            <div className="w-full px-2">
              {/* ZERA Token Balance */}
              <div className="mb-2">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-white/70 text-[10px] font-medium">{currentProject.pools[currentProject.pools.length - 1]?.tokenSymbol} Tokens</span>
                  <span className="text-[var(--primary-color)] text-[10px] font-bold">{tokenBalance.toFixed(0)} / {formatGoalNumber(tokenGoal)}</span>
                </div>
                <div className="relative h-1.5 bg-black/60 rounded-full overflow-hidden border border-[var(--primary-color)]/30">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--primary-color)] to-[#3FAA66] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((tokenBalance / tokenGoal) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: 'linear'
                    }}
                  />
                </div>
              </div>

              {/* SOL Balance */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-white/70 text-[10px] font-medium">Solana (SOL)</span>
                  <span className="text-[var(--primary-color)] text-[10px] font-bold">{walletBalance.toFixed(2)} / {formatGoalNumber(solGoal)}</span>
                </div>
                <div className="relative h-1.5 bg-black/60 rounded-full overflow-hidden border border-[var(--primary-color)]/30">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--primary-color)] to-[#3FAA66] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((walletBalance / solGoal) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: 'linear'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Address and Copy Button */}
            <div className="flex items-center justify-center gap-1.5 w-full px-2">
              <motion.div
                className="flex items-center justify-center gap-2 bg-black/60 px-2.5 py-1.5 rounded-lg border border-[var(--primary-color)]/40 overflow-hidden flex-1 min-w-0"
                whileHover={{ borderColor: hexToRgba(primaryColor, 0.7) }}
              >
                <code className="text-[var(--primary-color)] text-[10px] font-mono select-all truncate text-center">
                  {solanaAddress}
                </code>
              </motion.div>

              <motion.button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 p-2 bg-[var(--primary-color)] font-bold text-xs rounded-lg shadow-lg"
                style={{ color: secondaryColor }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 0 20px ${hexToRgba(primaryColor, 0.5)}`
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
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Copy className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Mobile and Tablet View (< 1024px) */}
      <div className="lg:hidden w-full h-full relative overflow-hidden">
        {/* Mobile Popup Menu */}
        {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 ${isMenuClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onClick={closeMobileMenu}
          />

          {/* Popup Content */}
          <div className={`lg:hidden fixed inset-0 z-50 ${isMenuClosing ? 'animate-fade-out' : 'animate-fade-in'} flex items-center justify-center py-6 px-4 pointer-events-none`}>
            <div className="flex flex-col pointer-events-auto w-full max-w-[340px] md:max-w-[640px] max-h-[calc(100vh-4rem)] relative">
              {/* Close X Button - Top Right */}
              <button
                onClick={closeMobileMenu}
                className="absolute -top-3 -right-3 z-[60] w-10 h-10 rounded-full flex items-center justify-center bg-black border-2 border-[var(--primary-color)] transition-all backdrop-blur-sm"
                style={{
                  boxShadow: `0 0 12px ${hexToRgba(primaryColor, 0.3)}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 16px ${hexToRgba(primaryColor, 0.5)}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 12px ${hexToRgba(primaryColor, 0.3)}`;
                }}
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {/* Tab Navigation */}
              <div className="w-full bg-gradient-to-r from-black via-[var(--primary-darker)]/20 to-black border-[3px] border-[var(--primary-color)]/60 border-b-0 flex flex-shrink-0">
                <button
                  onClick={() => setMobileMenuTab('settings')}
                  className={`flex-1 py-3 text-sm font-bold transition-all ${
                    mobileMenuTab === 'settings'
                      ? 'text-[var(--primary-color)] bg-black/50'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  SETTINGS
                </button>
                <button
                  onClick={() => setMobileMenuTab('about')}
                  className={`flex-1 py-3 text-sm font-bold transition-all ${
                    mobileMenuTab === 'about'
                      ? 'text-[var(--primary-color)] bg-black/50'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  ABOUT
                </button>
              </div>

              {/* Tab Content */}
              <div className="w-full flex-1 overflow-y-auto bg-gradient-to-b from-black to-black border-[3px] border-[var(--primary-color)]/60 py-3 px-2.5" style={{ WebkitOverflowScrolling: 'touch' }}>
                {mobileMenuTab === 'settings' && (
                  <>
              {/* Main Info Card */}
              <div className="info-card-small">
                <div className="flex items-center gap-3 mb-4">
                  <TokenSwitcher />
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-1.5 h-1.5 bg-[var(--primary-color)] rounded-full animate-pulse"></div>
                    <span className="text-[var(--primary-color)] text-[8px] font-bold">LIVE</span>
                  </div>
                </div>
                <p className="text-white text-[10px] text-center mb-2">Complete Price History</p>

                <div className="flex items-center justify-center gap-2 text-[10px] pt-3 pb-2 mt-2 flex-wrap">
                  {currentProject.pools.map((pool, idx) => {
                    // First pool: show token symbol (e.g., "M0N3Y")
                    // Other pools: show DEX name capitalized (e.g., "Raydium")
                    const displayName = idx === 0
                      ? pool.tokenSymbol
                      : pool.dexType.charAt(0).toUpperCase() + pool.dexType.slice(1).replace('_', ' ');

                    return (
                      <React.Fragment key={pool.id}>
                        {idx > 0 && <span className="text-white">→</span>}
                        <span
                          className={idx === currentProject.pools.length - 1 ? 'text-[var(--primary-color)] font-bold' : 'text-white font-medium'}
                        >
                          {displayName}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* DEX Screener Link */}
                <div style={{ marginTop: '16px', paddingTop: '16px', paddingBottom: '4px' }} className="border-t border-[var(--primary-color)]/20">
                  <a
                    href={`https://dexscreener.com/solana/${currentPoolAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-[10px] text-white/70 hover:text-[var(--primary-color)] transition-colors group"
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

              {/* View Mode Switch */}
              <div className="info-card-small">
                <div className="py-1.5 px-1.5">
                  <p className="text-white text-[10px] mb-1 text-center">View Mode</p>
                  <div className="relative bg-black/50 border border-white/20 rounded-lg p-1">
                    {/* Burns button hidden - always show Chart full width, Holders and Fees split second row */}
                    <div className="flex flex-col gap-1">
                      {/* First row: Chart (full width) */}
                      <button
                        onClick={() => {
                          setViewMode('chart');
                          closeMobileMenu();
                        }}
                        className={`relative w-full py-2 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1 z-10 transition-colors duration-200 ${
                          viewMode === 'chart'
                            ? ''
                            : 'text-white/70 hover:text-white'
                        }`}
                        style={viewMode === 'chart' ? { color: secondaryColor } : undefined}
                      >
                        {viewMode === 'chart' && (
                          <motion.div
                            layoutId="viewModeIndicator"
                            className="absolute inset-0 bg-[var(--primary-color)] rounded-md"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                          <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18 9l-5 5-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="relative z-10">Chart</span>
                      </button>
                      {/* Second row: Holders and Fees */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setViewMode('holders');
                            closeMobileMenu();
                          }}
                          className={`relative flex-1 py-2 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1 z-10 transition-colors duration-200 ${
                            viewMode === 'holders'
                              ? ''
                              : 'text-white/70 hover:text-white'
                          }`}
                          style={viewMode === 'holders' ? { color: secondaryColor } : undefined}
                        >
                          {viewMode === 'holders' && (
                            <motion.div
                              layoutId="viewModeIndicator"
                              className="absolute inset-0 bg-[var(--primary-color)] rounded-md"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="relative z-10">Holders</span>
                        </button>
                        <button
                          onClick={() => {
                            setViewMode('fees');
                            closeMobileMenu();
                          }}
                          className={`relative flex-1 py-2 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1 z-10 transition-colors duration-200 ${
                            viewMode === 'fees'
                              ? ''
                              : 'text-white/70 hover:text-white'
                          }`}
                          style={viewMode === 'fees' ? { color: secondaryColor } : undefined}
                        >
                          {viewMode === 'fees' && (
                            <motion.div
                              layoutId="viewModeIndicator"
                              className="absolute inset-0 bg-[var(--primary-color)] rounded-md"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="relative z-10">Fees</span>
                        </button>
                      </div>
                    </div>
                  </div>
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
                  {viewMode === 'chart' ? (
                    <TimeframeToggle
                      currentTimeframe={timeframe}
                      onTimeframeChange={(newTimeframe) => {
                        setTimeframe(newTimeframe);
                        closeMobileMenu();
                      }}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                    />
                  ) : viewMode === 'fees' ? (
                    <FeesTimeframeToggle
                      currentTimeframe={feesTimeframe}
                      onTimeframeChange={(newTimeframe) => {
                        setFeesTimeframe(newTimeframe);
                        closeMobileMenu();
                      }}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                    />
                  ) : viewMode === 'holders' ? (
                    <HoldersTimeframeToggle
                      currentTimeframe={holdersTimeframe}
                      onTimeframeChange={(newTimeframe) => {
                        setHoldersTimeframe(newTimeframe);
                        closeMobileMenu();
                      }}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                    />
                  ) : (
                    <BurnsTimeframeToggle
                      currentTimeframe={burnsTimeframe}
                      onTimeframeChange={(newTimeframe) => {
                        setBurnsTimeframe(newTimeframe);
                        closeMobileMenu();
                      }}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                    />
                  )}
                </div>
              </div>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center py-2">
                <div className="dashed-divider w-24"></div>
              </div>

              {/* Stats Section */}
              <div>
                <TokenStats
                  stats={timeframeStats || null}
                  isLoading={isStatsLoading}
                  timeframe={timeframe}
                  displayMode={displayMode}
                  avgDailyFees={viewMode === 'fees' && feesData ? feesData.avgDailyFees : undefined}
                />
              </div>

              {viewMode === 'chart' && (
                <>
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
                        isLogScale={isLogScale}
                        onLogScaleToggle={handleLogScaleToggle}
                        isAutoScale={isAutoScale}
                        onAutoScaleToggle={handleAutoScaleToggle}
                        onResetPosition={handleResetChartPosition}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                      />
                    </div>
                  </div>
                </>
              )}

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
                  className="flex items-center justify-center gap-2 py-4 bg-black/85 hover:bg-[var(--primary-color)]/15 transition-all cursor-pointer backdrop-blur-xl"
                  style={{ boxShadow: `0 0 12px ${hexToRgba(primaryColor, 0.3)}, 0 0 24px ${hexToRgba(primaryColor, 0.15)}` }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="var(--primary-color)"/>
                  </svg>
                  <p className="text-[var(--primary-color)] text-base font-bold tracking-wider">@Trenchooooor</p>
                </a>
              </div>
                  </>
                )}

                {mobileMenuTab === 'about' && (
                  <div style={{ padding: '0 20px' }}>
                    {/* What You're Viewing */}
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ marginBottom: '8px' }} className="text-[var(--primary-color)] text-base font-bold tracking-wider uppercase">What You're Viewing</h3>
                      <p style={{ paddingLeft: '8px', lineHeight: '1.6', margin: 0 }} className="text-white/90 text-sm">
                        The complete price history of the {currentProject.name} token from its launch through all pool migrations.
                      </p>
                    </div>

                    {/* Divider */}
                    <div style={{ margin: '16px 0' }} className="border-t-2 border-[var(--primary-color)]/30"></div>

                    {/* Token Journey */}
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ marginBottom: '12px' }} className="text-[var(--primary-color)] text-base font-bold tracking-wider uppercase">Token Journey</h3>
                      <div style={{ padding: '16px 20px', marginBottom: '8px' }} className="flex items-center justify-center gap-4 bg-black/50 border-2 border-[var(--primary-color)]/40 rounded-lg flex-wrap">
                        {currentProject.pools.map((pool, idx) => (
                          <React.Fragment key={pool.id}>
                            {idx > 0 && (
                              <svg className="w-5 h-5 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            )}
                            <span className={idx === currentProject.pools.length - 1 ? 'text-[var(--primary-color)] text-sm font-bold' : 'text-white text-sm font-medium'}>
                              {pool.poolName}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                      <p style={{ paddingLeft: '8px', lineHeight: '1.6', margin: 0 }} className="text-white/70 text-xs">
                        {currentProject.name} has migrated through {currentProject.migrations.length} pool{currentProject.migrations.length > 1 ? 's' : ''}, with complete price history tracked across all transitions.
                      </p>
                    </div>

                    {/* Divider */}
                    <div style={{ margin: '16px 0' }} className="border-t-2 border-[var(--primary-color)]/30"></div>

                    {/* How To Use */}
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ marginBottom: '12px' }} className="text-[var(--primary-color)] text-base font-bold tracking-wider uppercase">Chart Controls</h3>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs">Timeframes: 1H, 4H, 8H, 1D, or MAX</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs">Zoom with mouse wheel or pinch gesture</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs">Pan by dragging or swiping</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs">Drawing tools: horizontal lines, trend lines, freehand</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs">Press ESC to cancel trend line drawing</span>
                        </div>
                        <div style={{ padding: '12px 16px' }} className="flex items-start gap-3 bg-black/50 border-2 border-[var(--primary-color)]/30 rounded-lg hover:border-[var(--primary-color)]/50 transition-all">
                          <svg style={{ marginTop: '2px' }} className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span style={{ lineHeight: '1.5', margin: 0 }} className="text-white text-xs">Green vertical lines mark pool migrations</span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ margin: '16px 0' }} className="border-t-2 border-[var(--primary-color)]/30"></div>

                    {/* Data Sources */}
                    <div style={{ padding: '12px 16px' }} className="text-center bg-black/60 border-2 border-[var(--primary-color)]/40 rounded-lg">
                      <p style={{ margin: 0 }} className="text-white/60 text-xs">
                        <span className="text-[var(--primary-color)] font-bold">Data sources:</span> Jupiter API, DexScreener, GeckoTerminal
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

          <AnimatePresence>
            {showLoader && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                className="flex items-center justify-center h-full backdrop-blur-xl"
              >
                <TokenLoadingLogo
                  key={switchingFromProjectRef.current?.slug || currentProject?.slug}
                  svgUrl={switchingFromProjectRef.current?.loaderUrl || currentProject?.loaderUrl}
                  isLoading={projectLoading || isSwitching}
                  color={switchingFromProjectRef.current?.primaryColor || currentProject?.primaryColor || '#52C97D'}
                />
              </motion.div>
            )}

            {!showLoader && !error && poolsData && tokenStats && (
              <AnimatePresence mode="wait">
                {viewMode === 'chart' ? (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                    className="w-full h-full"
                  >
                    <Chart
                      poolsData={poolsData}
                      timeframe={timeframe}
                      displayMode={displayMode}
                      showVolume={showVolume}
                      showMigrationLines={showMigrationLines}
                      migrations={currentProject.migrations}
                      primaryColor={currentProject.primaryColor}
                      secondaryColor={currentProject.secondaryColor}
                      isLogScale={isLogScale}
                      onLogScaleToggle={handleLogScaleToggle}
                      isAutoScale={isAutoScale}
                      onAutoScaleToggle={handleAutoScaleToggle}
                      onResetPosition={handleResetChartPosition}
                      showMobileMenu={showMobileMenu}
                      onOpenMobileMenu={() => setShowMobileMenu(true)}
                    />
                  </motion.div>
                ) : viewMode === 'fees' ? (
                  <motion.div
                    key="fees"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                    className="w-full h-full"
                  >
                    <FeesView
                      projectSlug={currentProject.slug}
                      primaryColor={currentProject.primaryColor}
                      timeframe={feesTimeframe}
                      onTimeframeChange={setFeesTimeframe}
                      onOpenMobileMenu={() => setShowMobileMenu(true)}
                    />
                  </motion.div>
                ) : viewMode === 'holders' ? (
                  <motion.div
                    key="holders"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                    className="w-full h-full"
                  >
                    <HoldersView
                      projectSlug={currentProject.slug}
                      primaryColor={currentProject.primaryColor}
                      timeframe={holdersTimeframe}
                      onTimeframeChange={setHoldersTimeframe}
                      onOpenMobileMenu={() => setShowMobileMenu(true)}
                    />
                  </motion.div>
                ) : viewMode === 'burns' ? (
                  <motion.div
                    key="burns"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                    className="w-full h-full"
                  >
                    <BurnsView
                      projectSlug={currentProject.slug}
                      primaryColor={currentProject.primaryColor}
                      timeframe={burnsTimeframe}
                      onTimeframeChange={setBurnsTimeframe}
                      onOpenMobileMenu={() => setShowMobileMenu(true)}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop View - Absolute Layout (≥ 1024px) */}
      <div className="hidden lg:block w-full h-full overflow-hidden min-h-0 relative">
        {/* Left Section - Chart */}
        <motion.div
          className="absolute top-0 left-0 bottom-0 h-full overflow-hidden"
          initial={false}
          animate={{
            right: isSidebarCollapsed ? '80px' : '250px'
          }}
          transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-red">Error loading chart data</div>
            </div>
          )}

          <AnimatePresence>
            {showLoader && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                className="flex items-center justify-center h-full backdrop-blur-xl"
              >
                <TokenLoadingLogo
                  key={switchingFromProjectRef.current?.slug || currentProject?.slug}
                  svgUrl={switchingFromProjectRef.current?.loaderUrl || currentProject?.loaderUrl}
                  isLoading={projectLoading || isSwitching}
                  color={switchingFromProjectRef.current?.primaryColor || currentProject?.primaryColor || '#52C97D'}
                />
              </motion.div>
            )}

            {!showLoader && !error && poolsData && tokenStats && (
              <AnimatePresence mode="wait">
                {viewMode === 'chart' ? (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                    className="w-full h-full"
                  >
                    <Chart
                      poolsData={poolsData}
                      timeframe={timeframe}
                      displayMode={displayMode}
                      showVolume={showVolume}
                      showMigrationLines={showMigrationLines}
                      migrations={currentProject.migrations}
                      primaryColor={currentProject.primaryColor}
                      secondaryColor={currentProject.secondaryColor}
                      isLogScale={isLogScale}
                      onLogScaleToggle={handleLogScaleToggle}
                      isAutoScale={isAutoScale}
                      onAutoScaleToggle={handleAutoScaleToggle}
                      onResetPosition={handleResetChartPosition}
                      showMobileMenu={showMobileMenu}
                      onOpenMobileMenu={() => setShowMobileMenu(true)}
                    />
                  </motion.div>
                ) : viewMode === 'fees' ? (
                  <motion.div
                    key="fees"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                    className="w-full h-full"
                  >
                    <FeesView
                      projectSlug={currentProject.slug}
                      primaryColor={currentProject.primaryColor}
                      timeframe={feesTimeframe}
                      onTimeframeChange={setFeesTimeframe}
                      onOpenMobileMenu={() => setShowMobileMenu(true)}
                    />
                  </motion.div>
                ) : viewMode === 'holders' ? (
                  <motion.div
                    key="holders"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                    className="w-full h-full"
                  >
                    <HoldersView
                      projectSlug={currentProject.slug}
                      primaryColor={currentProject.primaryColor}
                      timeframe={holdersTimeframe}
                      onTimeframeChange={setHoldersTimeframe}
                      onOpenMobileMenu={() => setShowMobileMenu(true)}
                    />
                  </motion.div>
                ) : viewMode === 'burns' ? (
                  <motion.div
                    key="burns"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                    className="w-full h-full"
                  >
                    <BurnsView
                      projectSlug={currentProject.slug}
                      primaryColor={currentProject.primaryColor}
                      timeframe={burnsTimeframe}
                      onTimeframeChange={setBurnsTimeframe}
                      onOpenMobileMenu={() => setShowMobileMenu(true)}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Unified Sidebar - Animates width */}
        <motion.div
          className="absolute top-0 right-0 h-full flex flex-col bg-black border-l border-[var(--primary-color)]/20 z-40"
          style={{
            boxShadow: isSidebarCollapsed ? `-4px 0 8px ${hexToRgba(primaryColor, 0.15)}` : `-8px 0 8px ${hexToRgba(primaryColor, 0.2)}`,
            background: isSidebarCollapsed ? '#000000' : 'linear-gradient(to bottom, #000000 0%, #000000 50%, #000000 100%)',
            overflow: 'visible'
          }}
          initial={false}
          animate={{
            width: isSidebarCollapsed ? '80px' : '250px'
          }}
          transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {/* Toggle Tab - Always present */}
          <motion.button
            onClick={handleSidebarToggle}
            className="absolute top-1/2 -translate-y-1/2 h-24 rounded-l-lg flex items-center justify-center shadow-lg z-50"
            style={{
              backgroundColor: `${primaryColor}80`,
            }}
            initial={{ width: 8, left: -8 }}
            animate={{ width: 8, left: -8 }}
            whileHover={{
              width: 32,
              left: -32,
              backgroundColor: primaryColor,
              boxShadow: `0 0 20px ${primaryColor}99`,
              transition: { duration: 0.2, ease: 'easeOut' }
            }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 2 }}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronLeft className="w-5 h-5" style={{ color: secondaryColor }} />
            ) : (
              <ChevronRight className="w-5 h-5" style={{ color: secondaryColor }} />
            )}
          </motion.button>

          {/* Conditional Content with AnimatePresence - overflow hidden to prevent content reflow */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {isSidebarCollapsed ? (
                // Collapsed: Show compact controls
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-3 py-3"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentProject.slug}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                      className="flex flex-col items-center gap-3 w-full"
                    >
                  {/* Logo */}
                  <div className="w-12 h-12 flex items-center justify-center">
                    {currentProject?.logoUrl ? (
                      <img
                        src={currentProject.logoUrl}
                        alt={currentProject.name}
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                  </div>

                  {/* Live Indicator */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-1.5 h-1.5 bg-[var(--primary-color)] rounded-full animate-pulse"></div>
                    <span className="text-[var(--primary-color)] text-[7px] font-bold">LIVE</span>
                  </div>

                  {/* Divider */}
                  <div className="w-8 h-px bg-[var(--primary-color)]/30"></div>

                  {/* View Mode Icons - Vertical Stack */}
                  <div className="flex flex-col gap-2">
                    {/* Chart View */}
                    <button
                      onClick={() => setViewMode('chart')}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        viewMode === 'chart'
                          ? 'bg-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                          : 'bg-black/50 border border-[var(--primary-color)]/30 hover:bg-[var(--primary-color)]/20'
                      }`}
                      title="Chart View"
                      style={viewMode === 'chart' ? { color: secondaryColor } : undefined}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={viewMode === 'chart' ? '' : 'text-[var(--primary-color)]'} style={viewMode === 'chart' ? { color: secondaryColor } : undefined}>
                        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18 9l-5 5-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* Fees View */}
                    <button
                      onClick={() => setViewMode('fees')}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        viewMode === 'fees'
                          ? 'bg-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                          : 'bg-black/50 border border-[var(--primary-color)]/30 hover:bg-[var(--primary-color)]/20'
                      }`}
                      title="Fees View"
                      style={viewMode === 'fees' ? { color: secondaryColor } : undefined}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={viewMode === 'fees' ? '' : 'text-[var(--primary-color)]'} style={viewMode === 'fees' ? { color: secondaryColor } : undefined}>
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* Holders View */}
                    <button
                      onClick={() => setViewMode('holders')}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        viewMode === 'holders'
                          ? 'bg-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                          : 'bg-black/50 border border-[var(--primary-color)]/30 hover:bg-[var(--primary-color)]/20'
                      }`}
                      title="Holders View"
                      style={viewMode === 'holders' ? { color: secondaryColor } : undefined}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={viewMode === 'holders' ? '' : 'text-[var(--primary-color)]'} style={viewMode === 'holders' ? { color: secondaryColor } : undefined}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="w-8 h-px bg-[var(--primary-color)]/30"></div>

                  {/* Timeframe Selector Popover */}
                  <Popover open={isTimeframePopoverOpen} onOpenChange={setIsTimeframePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer">
                        <span className="text-white/50 text-[7px] font-medium">TIME</span>
                        <div className="px-2 py-1 bg-[var(--primary-color)]/20 border border-[var(--primary-color)]/50 rounded hover:bg-[var(--primary-color)]/30 transition-colors">
                          <span className="text-[var(--primary-color)] text-xs font-bold">
                            {viewMode === 'chart' ? timeframe : viewMode === 'fees' ? feesTimeframe : viewMode === 'holders' ? holdersTimeframe : burnsTimeframe}
                          </span>
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="left"
                      align="center"
                      sideOffset={12}
                      className="w-auto p-2 bg-gradient-to-b from-black to-black border-2"
                      style={{
                        borderColor: `${primaryColor}99`,
                        boxShadow: `0 0 20px ${primaryColor}4D`
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold mb-1 text-center" style={{ color: primaryColor }}>Timeframe</p>
                        {viewMode === 'chart' ? (
                          <>
                            {(['1H', '4H', '8H', '1D', 'MAX'] as const).map((tf) => (
                              <button
                                key={tf}
                                onClick={() => {
                                  setTimeframe(tf);
                                  setIsTimeframePopoverOpen(false);
                                }}
                                className="px-3 py-2 text-xs font-bold rounded transition-all flex items-center justify-center"
                                style={
                                  timeframe === tf
                                    ? { backgroundColor: primaryColor, color: '#000' }
                                    : { color: primaryColor, backgroundColor: 'transparent' }
                                }
                                onMouseEnter={(e) => {
                                  if (timeframe !== tf) {
                                    e.currentTarget.style.backgroundColor = `${primaryColor}33`;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (timeframe !== tf) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }
                                }}
                              >
                                {tf}
                              </button>
                            ))}
                          </>
                        ) : viewMode === 'fees' ? (
                          <>
                            {(['7D', '30D', '90D', 'ALL'] as const).map((tf) => (
                              <button
                                key={tf}
                                onClick={() => {
                                  setFeesTimeframe(tf);
                                  setIsTimeframePopoverOpen(false);
                                }}
                                className="px-3 py-2 text-xs font-bold rounded transition-all flex items-center justify-center"
                                style={
                                  feesTimeframe === tf
                                    ? { backgroundColor: primaryColor, color: '#000' }
                                    : { color: primaryColor, backgroundColor: 'transparent' }
                                }
                                onMouseEnter={(e) => {
                                  if (feesTimeframe !== tf) {
                                    e.currentTarget.style.backgroundColor = `${primaryColor}33`;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (feesTimeframe !== tf) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }
                                }}
                              >
                                {tf}
                              </button>
                            ))}
                          </>
                        ) : viewMode === 'holders' ? (
                          <>
                            {(['1D', '7D', '30D', '90D', 'ALL'] as const).map((tf) => (
                              <button
                                key={tf}
                                onClick={() => {
                                  setHoldersTimeframe(tf);
                                  setIsTimeframePopoverOpen(false);
                                }}
                                className="px-3 py-2 text-xs font-bold rounded transition-all flex items-center justify-center"
                                style={
                                  holdersTimeframe === tf
                                    ? { backgroundColor: primaryColor, color: '#000' }
                                    : { color: primaryColor, backgroundColor: 'transparent' }
                                }
                                onMouseEnter={(e) => {
                                  if (holdersTimeframe !== tf) {
                                    e.currentTarget.style.backgroundColor = `${primaryColor}33`;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (holdersTimeframe !== tf) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }
                                }}
                              >
                                {tf}
                              </button>
                            ))}
                          </>
                        ) : (
                          <>
                            {(['7D', '30D', '90D', 'ALL'] as const).map((tf) => (
                              <button
                                key={tf}
                                onClick={() => {
                                  setBurnsTimeframe(tf);
                                  setIsTimeframePopoverOpen(false);
                                }}
                                className="px-3 py-2 text-xs font-bold rounded transition-all flex items-center justify-center"
                                style={
                                  burnsTimeframe === tf
                                    ? { backgroundColor: primaryColor, color: '#000' }
                                    : { color: primaryColor, backgroundColor: 'transparent' }
                                }
                                onMouseEnter={(e) => {
                                  if (burnsTimeframe !== tf) {
                                    e.currentTarget.style.backgroundColor = `${primaryColor}33`;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (burnsTimeframe !== tf) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }
                                }}
                              >
                                {tf}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Chart-specific controls */}
                  {viewMode === 'chart' && (
                    <>
                      {/* Divider */}
                      <div className="w-8 h-px bg-[var(--primary-color)]/30"></div>

                      {/* Display Mode Toggle */}
                      <Popover open={isDisplayModePopoverOpen} onOpenChange={setIsDisplayModePopoverOpen}>
                        <PopoverTrigger asChild>
                          <button
                            className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center transition-all"
                            style={{
                              borderWidth: '1px',
                              borderColor: `${primaryColor}4D`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `${primaryColor}33`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                            }}
                            title="Display Mode"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: primaryColor }}>
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          side="left"
                          align="center"
                          sideOffset={12}
                          className="w-auto p-2 bg-gradient-to-b from-black to-black border-2"
                          style={{
                            borderColor: `${primaryColor}99`,
                            boxShadow: `0 0 20px ${primaryColor}4D`
                          }}
                        >
                          <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-bold mb-1 text-center" style={{ color: primaryColor }}>Display</p>
                            <button
                              onClick={() => {
                                handleDisplayModeChange('price');
                                setIsDisplayModePopoverOpen(false);
                              }}
                              className="px-3 py-2 text-xs font-bold rounded transition-all flex items-center justify-center"
                              style={
                                displayMode === 'price'
                                  ? { backgroundColor: primaryColor, color: '#000' }
                                  : { color: primaryColor, backgroundColor: 'transparent' }
                              }
                              onMouseEnter={(e) => {
                                if (displayMode !== 'price') {
                                  e.currentTarget.style.backgroundColor = `${primaryColor}33`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (displayMode !== 'price') {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              Price
                            </button>
                            <button
                              onClick={() => {
                                handleDisplayModeChange('marketCap');
                                setIsDisplayModePopoverOpen(false);
                              }}
                              className="px-3 py-2 text-xs font-bold rounded transition-all flex items-center justify-center"
                              style={
                                displayMode === 'marketCap'
                                  ? { backgroundColor: primaryColor, color: '#000' }
                                  : { color: primaryColor, backgroundColor: 'transparent' }
                              }
                              onMouseEnter={(e) => {
                                if (displayMode !== 'marketCap') {
                                  e.currentTarget.style.backgroundColor = `${primaryColor}33`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (displayMode !== 'marketCap') {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              Market Cap
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Toggles Popover */}
                      <Popover open={isChartOptionsPopoverOpen} onOpenChange={setIsChartOptionsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <button
                            className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center transition-all"
                            style={{
                              borderWidth: '1px',
                              borderColor: `${primaryColor}4D`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `${primaryColor}33`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                            }}
                            title="Chart Options"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: primaryColor }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke="currentColor"/>
                            </svg>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          side="left"
                          align="center"
                          sideOffset={12}
                          className="w-48 p-2 bg-gradient-to-b from-black to-black border-2"
                          style={{
                            borderColor: `${primaryColor}99`,
                            boxShadow: `0 0 20px ${primaryColor}4D`
                          }}
                        >
                          <div className="flex flex-col gap-1.5">
                            <p className="text-[10px] font-bold mb-0.5 text-center" style={{ color: primaryColor }}>Options</p>

                            {/* Volume Toggle */}
                            <button
                              onClick={handleVolumeToggle}
                              className="flex items-center justify-between px-2 py-1.5 rounded transition-colors"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${primaryColor}1A`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <span className="text-xs font-medium" style={{ color: primaryColor }}>Volume</span>
                              <div
                                className="w-10 h-5 rounded-full transition-colors"
                                style={{ backgroundColor: showVolume ? primaryColor : '#4b5563' }}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${showVolume ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                              </div>
                            </button>

                            {/* Migration Lines Toggle */}
                            <button
                              onClick={handleMigrationLinesToggle}
                              className="flex items-center justify-between px-2 py-1.5 rounded transition-colors"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${primaryColor}1A`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <span className="text-xs font-medium" style={{ color: primaryColor }}>Migration Lines</span>
                              <div
                                className="w-10 h-5 rounded-full transition-colors"
                                style={{ backgroundColor: showMigrationLines ? primaryColor : '#4b5563' }}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${showMigrationLines ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                              </div>
                            </button>

                            {/* Log Scale Toggle */}
                            <button
                              onClick={handleLogScaleToggle}
                              className="flex items-center justify-between px-2 py-1.5 rounded transition-colors"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${primaryColor}1A`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <span className="text-xs font-medium" style={{ color: primaryColor }}>Log Scale</span>
                              <div
                                className="w-10 h-5 rounded-full transition-colors"
                                style={{ backgroundColor: isLogScale ? primaryColor : '#4b5563' }}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${isLogScale ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                              </div>
                            </button>

                            {/* Auto Scale Toggle */}
                            <button
                              onClick={handleAutoScaleToggle}
                              className="flex items-center justify-between px-2 py-1.5 rounded transition-colors"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${primaryColor}1A`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <span className="text-xs font-medium" style={{ color: primaryColor }}>Auto Scale</span>
                              <div
                                className="w-10 h-5 rounded-full transition-colors"
                                style={{ backgroundColor: isAutoScale ? primaryColor : '#4b5563' }}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${isAutoScale ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                              </div>
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </>
                  )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              ) : (
                // Expanded: Show full content
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col min-h-0"
                >

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2 space-y-0 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProject.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
              >
            {/* Main Info Block */}
            <div className="stat-card-highlight">
              <div className="flex items-center gap-2.5 mb-2">
                <TokenSwitcher />
                <div className="flex items-center gap-1 ml-auto">
                  <div className="w-1.5 h-1.5 bg-[var(--primary-color)] rounded-full animate-pulse"></div>
                  <span className="text-[var(--primary-color)] text-[8px] font-bold">LIVE</span>
                </div>
              </div>
              <p className="text-white text-[9px] text-center mb-2">Complete Price History</p>

              <div className="flex items-center justify-center gap-1.5 text-[9px] pt-1.5 pb-1.5 mt-1.5 flex-wrap">
                {currentProject.pools.map((pool, idx) => {
                  // First pool: show token symbol, other pools: show DEX name
                  const displayName = idx === 0
                    ? pool.tokenSymbol
                    : pool.dexType.charAt(0).toUpperCase() + pool.dexType.slice(1).replace('_', ' ');

                  return (
                    <React.Fragment key={pool.id}>
                      {idx > 0 && <span className="text-white">→</span>}
                      <span
                        className={idx === currentProject.pools.length - 1 ? 'text-[var(--primary-color)] font-bold' : 'text-white font-medium'}
                      >
                        {displayName}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* DEX Screener Link */}
              <div style={{ marginTop: '12px', paddingTop: '12px', paddingBottom: '4px' }} className="border-t border-[var(--primary-color)]/20">
                <a
                  href={`https://dexscreener.com/solana/${currentPoolAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-[9px] text-white/70 hover:text-[var(--primary-color)] transition-colors group"
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

            {/* View Mode Switch */}
            <div className="stat-card">
              <p className="text-white text-[10px] font-medium mb-1 text-center">View Mode</p>
              <div className="relative bg-black/50 border border-white/20 rounded-lg p-0.5">
                {/* Burns button hidden - always show Chart full width, Holders and Fees split second row */}
                <div className="flex flex-col gap-0.5">
                  {/* First row: Chart (full width) */}
                  <button
                    onClick={() => setViewMode('chart')}
                    className={`relative w-full py-1.5 px-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-0.5 z-10 transition-colors duration-200 ${
                      viewMode === 'chart'
                        ? ''
                        : 'text-white/70 hover:text-white'
                    }`}
                    style={viewMode === 'chart' ? { color: secondaryColor } : undefined}
                  >
                    {viewMode === 'chart' && (
                      <motion.div
                        layoutId="viewModeIndicatorDesktop"
                        className="absolute inset-0 bg-[var(--primary-color)] rounded-md"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 flex-shrink-0">
                      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 9l-5 5-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="relative z-10">Chart</span>
                  </button>
                  {/* Second row: Holders and Fees */}
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => setViewMode('holders')}
                      className={`relative flex-1 py-1.5 px-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-0.5 z-10 transition-colors duration-200 ${
                        viewMode === 'holders'
                          ? ''
                          : 'text-white/70 hover:text-white'
                      }`}
                      style={viewMode === 'holders' ? { color: secondaryColor } : undefined}
                    >
                      {viewMode === 'holders' && (
                        <motion.div
                          layoutId="viewModeIndicatorDesktop"
                          className="absolute inset-0 bg-[var(--primary-color)] rounded-md"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 flex-shrink-0">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="relative z-10">Holders</span>
                    </button>
                    <button
                      onClick={() => setViewMode('fees')}
                      className={`relative flex-1 py-1.5 px-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-0.5 z-10 transition-colors duration-200 ${
                        viewMode === 'fees'
                          ? ''
                          : 'text-white/70 hover:text-white'
                      }`}
                      style={viewMode === 'fees' ? { color: secondaryColor } : undefined}
                    >
                      {viewMode === 'fees' && (
                        <motion.div
                          layoutId="viewModeIndicatorDesktop"
                          className="absolute inset-0 bg-[var(--primary-color)] rounded-md"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 flex-shrink-0">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="relative z-10">Fees</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Divider */}
            <div className="dashed-divider"></div>

            {/* Timeframe Toggle */}
            <div className="stat-card">
              <p className="text-white text-[10px] font-medium mb-1 text-center">Timeframe</p>
              {viewMode === 'chart' ? (
                <TimeframeToggle
                  currentTimeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              ) : viewMode === 'fees' ? (
                <FeesTimeframeToggle
                  currentTimeframe={feesTimeframe}
                  onTimeframeChange={setFeesTimeframe}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              ) : viewMode === 'holders' ? (
                <HoldersTimeframeToggle
                  currentTimeframe={holdersTimeframe}
                  onTimeframeChange={setHoldersTimeframe}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              ) : (
                <BurnsTimeframeToggle
                  currentTimeframe={burnsTimeframe}
                  onTimeframeChange={setBurnsTimeframe}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              )}
            </div>

            {/* Decorative Divider */}
            <div className="dashed-divider"></div>

            {/* Stats Section */}
            <TokenStats
              stats={timeframeStats || null}
              isLoading={isStatsLoading}
              timeframe={timeframe}
              displayMode={displayMode}
              avgDailyFees={viewMode === 'fees' && feesData ? feesData.avgDailyFees : undefined}
            />

            {viewMode === 'chart' && (
              <>
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
                  isLogScale={isLogScale}
                  onLogScaleToggle={handleLogScaleToggle}
                  isAutoScale={isAutoScale}
                  onAutoScaleToggle={handleAutoScaleToggle}
                  onResetPosition={handleResetChartPosition}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />

                {/* Extra spacing before sticky button */}
                <div className="h-1"></div>
              </>
            )}
              </motion.div>
            </AnimatePresence>
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
              className="flex items-center justify-center gap-2 py-3 bg-black/85 hover:bg-[var(--primary-color)]/15 transition-all cursor-pointer backdrop-blur-xl w-full"
              style={{ boxShadow: `0 0 12px ${hexToRgba(primaryColor, 0.3)}, 0 0 24px ${hexToRgba(primaryColor, 0.15)}` }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="var(--primary-color)"/>
              </svg>
              <p className="text-[var(--primary-color)] text-base font-bold tracking-wider">@Trenchooooor</p>
            </a>
          </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <TokenContextProvider>
        <HomeContent />
      </TokenContextProvider>
    </Suspense>
  );
}
