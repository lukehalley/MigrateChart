'use client';

import { useThemeContext } from '@/lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'nav';
}

export function ThemeToggle({ className = '', size = 'md', variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme, isLoading } = useThemeContext();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  // Nav variant matches the nav-link button styling
  if (variant === 'nav') {
    if (isLoading) {
      return (
        <div
          className={`h-[42px] w-[42px] rounded-md bg-white/5 animate-pulse ${className}`}
        />
      );
    }

    return (
      <motion.button
        onClick={toggleTheme}
        className={`
          h-[42px] w-[42px]
          relative
          flex items-center justify-center
          rounded-md
          border
          transition-all duration-300 ease-out
          cursor-pointer
          overflow-hidden
          font-mono text-sm font-medium
          ${theme === 'light'
            ? 'bg-amber-50/80 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
            : 'bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--primary)] hover:bg-[rgba(82,201,125,0.05)] hover:border-[rgba(82,201,125,0.2)]'
          }
          ${className}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <AnimatePresence mode="wait">
          {theme === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10"
            >
              <Sun size={18} strokeWidth={2} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10"
            >
              <Moon size={18} strokeWidth={2} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-white/5 animate-pulse ${className}`}
      />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        relative
        flex items-center justify-center
        rounded-lg
        border border-current/10
        transition-all duration-300 ease-out
        cursor-pointer
        overflow-hidden
        ${theme === 'light'
          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 shadow-sm'
          : 'bg-white/5 text-emerald-400 hover:bg-white/10 hover:border-emerald-500/30'
        }
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Glow effect */}
      <div
        className={`
          absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300
          ${theme === 'light'
            ? 'bg-gradient-to-br from-amber-200/50 to-orange-200/50'
            : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
          }
          group-hover:opacity-100
        `}
      />

      <AnimatePresence mode="wait">
        {theme === 'dark' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10"
          >
            <Sun size={iconSizes[size]} strokeWidth={2} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10"
          >
            <Moon size={iconSizes[size]} strokeWidth={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Compact inline toggle for tight spaces
export function ThemeToggleCompact({ className = '' }: { className?: string }) {
  const { theme, toggleTheme, isLoading } = useThemeContext();

  if (isLoading) {
    return <div className={`w-6 h-6 rounded bg-white/5 animate-pulse ${className}`} />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        w-6 h-6
        flex items-center justify-center
        rounded
        transition-all duration-200
        ${theme === 'light'
          ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-100'
          : 'text-emerald-400 hover:text-emerald-300 hover:bg-white/10'
        }
        ${className}
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
