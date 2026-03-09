'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MigrationCountdownProps {
  migrationEndDate: string;
  migrationStartDate?: string | null;
  projectName: string;
  primaryColor: string;
  logoUrl?: string;
  migrateFunUrl?: string | null;
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
  logoUrl,
  migrateFunUrl,
}: MigrationCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);

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

  const isComplete = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-6 p-8 max-w-lg w-full mx-4"
      >
        {/* Logo */}
        {logoUrl && (
          <img
            src={logoUrl}
            alt={projectName}
            className="w-20 h-20 rounded-full border-2"
            style={{ borderColor: hexToRgba(primaryColor, 0.6) }}
          />
        )}

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-1">
            {projectName} Migration
          </h2>
          <p className="text-sm" style={{ color: hexToRgba(primaryColor, 0.8) }}>
            {isComplete ? 'Migration complete - chart coming soon' : 'Migration in progress'}
          </p>
        </div>

        {/* Countdown boxes */}
        {!isComplete && (
          <div className="flex gap-3">
            {[
              { value: timeLeft.days, label: 'DAYS' },
              { value: timeLeft.hours, label: 'HRS' },
              { value: timeLeft.minutes, label: 'MIN' },
              { value: timeLeft.seconds, label: 'SEC' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-lg border px-4 py-3 min-w-[70px]"
                style={{
                  backgroundColor: hexToRgba(primaryColor, 0.08),
                  borderColor: hexToRgba(primaryColor, 0.3),
                }}
              >
                <span
                  className="text-3xl font-mono font-bold tabular-nums"
                  style={{ color: primaryColor }}
                >
                  {String(value).padStart(2, '0')}
                </span>
                <span className="text-[10px] tracking-widest text-white/50 mt-1">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: hexToRgba(primaryColor, 0.15) }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: primaryColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-center text-xs text-white/40 mt-2">
            {progress.toFixed(1)}% complete
          </p>
        </div>

        {/* Migrate button */}
        {migrateFunUrl && !isComplete && (
          <a
            href={migrateFunUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-105"
            style={{
              backgroundColor: primaryColor,
              color: '#000',
            }}
          >
            Migrate on migrate.fun
          </a>
        )}

        {/* Chart will be available text */}
        <p className="text-xs text-white/30 text-center">
          Full migration chart will be available once migration completes
        </p>
      </motion.div>
    </div>
  );
}
