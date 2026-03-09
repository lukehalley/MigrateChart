'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface MigrationCountdownProps {
  migrationEndDate: string;
  migrationStartDate?: string | null;
  projectName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  migrateFunUrl?: string | null;
  isLight?: boolean;
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function MigrationCountdown({
  migrationEndDate,
  migrationStartDate,
  projectName,
  primaryColor,
  secondaryColor,
  logoUrl,
  migrateFunUrl,
  isLight = false,
}: MigrationCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const endTime = new Date(migrationEndDate).getTime();
    const startTime = migrationStartDate ? new Date(migrationStartDate).getTime() : endTime - 7 * 24 * 60 * 60 * 1000;
    const totalDuration = endTime - startTime;

    function update() {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const elapsed = now - startTime;

      setProgress(Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)));

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [migrationEndDate, migrationStartDate]);

  if (dismissed) return null;

  const isComplete = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`relative border-b-2 border-[var(--primary-color)]/50 backdrop-blur-sm overflow-hidden ${isLight ? 'bg-gradient-to-r from-gray-50 via-[var(--primary-color)]/10 to-gray-50' : 'bg-gradient-to-r from-black via-[var(--primary-darker)]/30 to-black'}`}
        style={{ boxShadow: `0 4px 20px rgba(var(--primary-rgb), 0.25)` }}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary-color)]/20 to-transparent opacity-50"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: hexToRgba(primaryColor, 0.15) }}>
          <motion.div
            className="h-full"
            style={{ backgroundColor: primaryColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="relative flex items-center justify-center gap-4 py-3 px-4 sm:px-6">
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all hover:bg-white/10"
            style={{ color: hexToRgba(primaryColor, 0.6) }}
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo */}
          {logoUrl && (
            <img
              src={logoUrl}
              alt={projectName}
              className="w-8 h-8 rounded-full border hidden sm:block"
              style={{ borderColor: hexToRgba(primaryColor, 0.4) }}
            />
          )}

          {/* Migration label */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }}
            />
            <span className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {projectName} Migration {isComplete ? 'Complete' : 'In Progress'}
            </span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px hidden sm:block" style={{ backgroundColor: hexToRgba(primaryColor, 0.3) }} />

          {/* Countdown */}
          {!isComplete && (
            <div className="flex items-center gap-1.5">
              {[
                { value: timeLeft.days, label: 'D' },
                { value: timeLeft.hours, label: 'H' },
                { value: timeLeft.minutes, label: 'M' },
                { value: timeLeft.seconds, label: 'S' },
              ].map(({ value, label }, i) => (
                <React.Fragment key={label}>
                  <div
                    className="flex items-baseline gap-0.5 px-2 py-1 rounded border"
                    style={{
                      backgroundColor: hexToRgba(primaryColor, 0.08),
                      borderColor: hexToRgba(primaryColor, 0.25),
                    }}
                  >
                    <span
                      className="text-sm font-mono font-bold tabular-nums"
                      style={{ color: primaryColor }}
                    >
                      {String(value).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-white/40">{label}</span>
                  </div>
                  {i < 3 && <span className="text-white/20 text-xs">:</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-6 w-px hidden sm:block" style={{ backgroundColor: hexToRgba(primaryColor, 0.3) }} />

          {/* Progress */}
          <span className="text-xs text-white/50 hidden sm:block">
            {progress.toFixed(1)}% Complete
          </span>

          {/* Migrate button */}
          {migrateFunUrl && !isComplete && (
            <>
              <div className="h-6 w-px hidden lg:block" style={{ backgroundColor: hexToRgba(primaryColor, 0.3) }} />
              <a
                href={migrateFunUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all hover:scale-105"
                style={{
                  backgroundColor: primaryColor,
                  color: secondaryColor,
                }}
              >
                Migrate Now
              </a>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
