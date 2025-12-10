'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTokenContext } from '@/lib/TokenContext';
import { fetchWalletBalance, fetchTokenBalance } from '@/lib/api';
import { SafeStorage } from '@/lib/localStorage';
import useSWR from 'swr';

const POPUP_DELAY = 10000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
// Use obfuscated key to avoid ad blocker detection
const LAST_SHOWN_KEY = 'app_pls'; // "popup last shown" - avoid trigger words
const COOKIE_NAME = 'app_pls';

// Cookie utilities (ad blockers don't typically block cookies)
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number): void => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

// Get last shown timestamp from either localStorage or cookie
const getLastShownTime = (): number | null => {
  // Try localStorage first
  const localStorageValue = SafeStorage.getItem(LAST_SHOWN_KEY);
  if (localStorageValue) {
    return parseInt(localStorageValue, 10);
  }

  // Fallback to cookie
  const cookieValue = getCookie(COOKIE_NAME);
  if (cookieValue) {
    return parseInt(cookieValue, 10);
  }

  return null;
};

// Set last shown timestamp in both localStorage and cookie
const setLastShownTime = (timestamp: number): void => {
  const timestampStr = timestamp.toString();
  // Try localStorage
  SafeStorage.setItem(LAST_SHOWN_KEY, timestampStr);
  // Always set cookie as fallback
  setCookie(COOKIE_NAME, timestampStr, 1); // 1 day expiry
};

export function DonationPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const { currentProject } = useTokenContext();

  // Goal state - load from localStorage
  const [tokenGoal, setTokenGoal] = useState<number>(5000);
  const [solGoal, setSolGoal] = useState<number>(10);

  const primaryColor = currentProject?.primaryColor || '#52C97D';
  const secondaryColor = currentProject?.secondaryColor || '#000000';
  const solanaAddress = currentProject?.donationAddress || '';
  const currentTokenAddress = currentProject?.pools?.[currentProject.pools.length - 1]?.tokenAddress;
  const tokenSymbol = currentProject?.pools?.[currentProject.pools.length - 1]?.tokenSymbol || 'TOKEN';

  // Helper to format goal numbers
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

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Load goals from localStorage
  useEffect(() => {
    const savedTokenGoal = SafeStorage.getItem('tokenGoal');
    if (savedTokenGoal !== null) {
      setTokenGoal(parseFloat(savedTokenGoal));
    }

    const savedSolGoal = SafeStorage.getItem('solGoal');
    if (savedSolGoal !== null) {
      setSolGoal(parseFloat(savedSolGoal));
    }
  }, []);

  // Fetch wallet balance
  const { data: walletBalance = 0 } = useSWR(
    solanaAddress && currentProject?.slug ? `wallet-balance-${currentProject.slug}-${solanaAddress}` : null,
    () => solanaAddress ? fetchWalletBalance(solanaAddress) : Promise.resolve(0),
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  // Fetch token balance
  const { data: tokenBalance = 0 } = useSWR(
    solanaAddress && currentTokenAddress && currentProject?.slug ? `token-balance-${currentProject.slug}-${solanaAddress}-${currentTokenAddress}` : null,
    () => (solanaAddress && currentTokenAddress) ? fetchTokenBalance(solanaAddress, currentTokenAddress) : Promise.resolve(0),
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    // Check if popup was shown within the last 24 hours
    const lastShownTime = getLastShownTime();

    if (lastShownTime) {
      const timeSinceLastShown = Date.now() - lastShownTime;

      // If less than 24 hours have passed, don't show the popup
      if (timeSinceLastShown < ONE_DAY_MS) {
        return;
      }
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Save the current timestamp to both localStorage and cookie
      setLastShownTime(Date.now());
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, []);

  // Don't render until project is loaded
  if (!currentProject) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!solanaAddress) return;
    navigator.clipboard.writeText(solanaAddress);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);

    // Get button position for confetti origin
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Confetti burst in brand colors
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { x, y },
      colors: [primaryColor, '#FFFFFF'],
      startVelocity: 35,
      decay: 0.9,
      scalar: 0.9,
      gravity: 1,
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            className="fixed inset-0 z-[200] bg-black/70"
            onClick={handleClose}
          />

          {/* Popup Container */}
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 sm:p-6 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-full max-w-[90vw] sm:max-w-2xl md:max-w-3xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glowing border effect */}
              <div className="absolute -inset-[3px] bg-gradient-to-r from-[var(--primary-color)] via-[var(--primary-color)]/60 to-[var(--primary-color)] opacity-80 blur-xl animate-pulse" style={{ '--primary-color': primaryColor } as any} />

              {/* Main card */}
              <div className="relative bg-gradient-to-b from-black to-black border-[3px] overflow-hidden rounded-lg" style={{ borderColor: `${primaryColor}99` }}>
                {/* Animated background grid */}
                <div className="absolute inset-0 grid-pattern opacity-20" />

                {/* Animated gradient overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-30"
                  style={{ '--primary-color': primaryColor } as any}
                  animate={{
                    background: [
                      `linear-gradient(90deg, transparent 0%, ${hexToRgba(primaryColor, 0.2)} 50%, transparent 100%)`,
                      `linear-gradient(90deg, transparent 0%, ${hexToRgba(primaryColor, 0.2)} 50%, transparent 100%)`,
                    ],
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />

                {/* Scan line effect */}
                <motion.div
                  className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent to-transparent opacity-40"
                  style={{
                    backgroundImage: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`
                  }}
                  animate={{
                    y: ['0%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-10 p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 group"
                  style={{
                    borderColor: `${primaryColor}40`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${primaryColor}99`;
                    e.currentTarget.style.boxShadow = `0 0 12px ${hexToRgba(primaryColor, 0.3)}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${primaryColor}40`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-white transition-colors" style={{ color: `${primaryColor}CC` }} />
                </button>

                {/* Content */}
                <div className="relative px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-12">
                  {/* Header with Icon */}
                  <motion.div
                    className="flex flex-col items-center mb-6 sm:mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <motion.div
                      className="mb-3 sm:mb-4"
                      animate={isVisible ? {
                        scale: [1, 1.15, 1],
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: isVisible ? Infinity : 0,
                        ease: 'easeInOut'
                      }}
                    >
                      <Heart className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 fill-current" style={{ color: primaryColor }} />
                    </motion.div>

                    <h2
                      className="text-xl sm:text-2xl md:text-4xl font-bold text-white text-center mb-2 sm:mb-3 px-2"
                      style={{
                        textShadow: `0 0 20px ${hexToRgba(primaryColor, 0.3)}`
                      }}
                    >
                      Enjoying the Tool?
                    </h2>

                    <p className="text-white/70 text-center text-xs sm:text-sm md:text-base leading-relaxed max-w-xl px-2">
                      Your support helps us build more features and improve the platform.
                      <br />
                      <span className="font-semibold" style={{ color: primaryColor }}>Every contribution matters.</span>
                    </p>
                  </motion.div>

                  {/* Divider */}
                  <motion.div
                    className="w-full h-[2px] mb-5 sm:mb-6 md:mb-8 bg-gradient-to-r from-transparent to-transparent"
                    style={{
                      backgroundImage: `linear-gradient(90deg, transparent, ${primaryColor}66, transparent)`
                    }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  />

                  {/* Donation Section */}
                  <motion.div
                    className="space-y-4 sm:space-y-5 md:space-y-6"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {/* CTA Text */}
                    <div className="text-center px-2">
                      <p className="text-white font-bold text-sm sm:text-base md:text-lg mb-1">
                        Donate via Solana Network
                      </p>
                      <p className="text-white/60 text-xs sm:text-xs md:text-sm">
                        Send SOL or {tokenSymbol} tokens to support development
                      </p>
                    </div>

                    {/* Wallet Address + Copy Button */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
                      <motion.div
                        className="flex-1 flex items-center justify-center gap-2 bg-black/70 px-3 py-3 sm:px-4 sm:py-4 rounded-lg border-2 overflow-hidden min-w-0"
                        style={{
                          borderColor: `${primaryColor}66`,
                          boxShadow: `0 0 12px ${hexToRgba(primaryColor, 0.2)}`
                        }}
                        whileHover={{
                          borderColor: `${primaryColor}99`,
                          boxShadow: `0 0 16px ${hexToRgba(primaryColor, 0.3)}`
                        }}
                      >
                        <code className="text-[10px] sm:text-xs md:text-sm font-mono select-all truncate text-center" style={{ color: primaryColor }}>
                          {solanaAddress}
                        </code>
                      </motion.div>

                      <motion.button
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-4 font-bold text-xs sm:text-sm md:text-base rounded-lg shadow-lg transition-all"
                        style={{
                          backgroundColor: primaryColor,
                          color: secondaryColor,
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: `0 0 24px ${hexToRgba(primaryColor, 0.6)}`
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <AnimatePresence mode="wait">
                          {showCopied ? (
                            <motion.div
                              key="check"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-1.5 sm:gap-2"
                            >
                              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Copied!</span>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-1.5 sm:gap-2"
                            >
                              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Copy</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-3 sm:space-y-4 bg-black/60 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-5 rounded-lg border-2" style={{ borderColor: `${primaryColor}40` }}>
                      <div className="text-center mb-3 sm:mb-4">
                        <p className="text-white/80 text-xs sm:text-xs md:text-sm font-medium">
                          Current Donation Progress
                        </p>
                      </div>

                      {/* Token Balance */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                          <span className="text-white/70 text-[11px] sm:text-xs md:text-sm font-medium">{tokenSymbol} Tokens</span>
                          <span className="text-xs sm:text-sm md:text-base font-bold" style={{ color: primaryColor }}>
                            {tokenBalance.toFixed(0)} / {formatGoalNumber(tokenGoal)}
                          </span>
                        </div>
                        <div className="relative h-2.5 sm:h-3 md:h-4 bg-black/60 rounded-full overflow-hidden border" style={{ borderColor: `${primaryColor}40` }}>
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${primaryColor}, ${hexToRgba(primaryColor, 0.7)})`
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((tokenBalance / tokenGoal) * 100, 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                          />
                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ['-100%', '200%'],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              repeatDelay: 1.5,
                              ease: 'linear'
                            }}
                          />
                        </div>
                      </div>

                      {/* SOL Balance */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                          <span className="text-white/70 text-[11px] sm:text-xs md:text-sm font-medium">Solana (SOL)</span>
                          <span className="text-xs sm:text-sm md:text-base font-bold" style={{ color: primaryColor }}>
                            {walletBalance.toFixed(2)} / {formatGoalNumber(solGoal)}
                          </span>
                        </div>
                        <div className="relative h-2.5 sm:h-3 md:h-4 bg-black/60 rounded-full overflow-hidden border" style={{ borderColor: `${primaryColor}40` }}>
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${primaryColor}, ${hexToRgba(primaryColor, 0.7)})`
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((walletBalance / solGoal) * 100, 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.7 }}
                          />
                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ['-100%', '200%'],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              repeatDelay: 1.5,
                              ease: 'linear'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Maybe Later Button */}
                    <button
                      onClick={handleClose}
                      className="w-full px-4 py-2.5 sm:px-6 sm:py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs sm:text-sm md:text-base rounded-lg border transition-all duration-200"
                      style={{
                        borderColor: `${primaryColor}30`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${primaryColor}66`;
                        e.currentTarget.style.boxShadow = `0 0 12px ${hexToRgba(primaryColor, 0.2)}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = `${primaryColor}30`;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Maybe Later
                    </button>
                  </motion.div>
                </div>

                {/* Bottom glow accent */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent opacity-60" style={{ backgroundImage: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }} />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
