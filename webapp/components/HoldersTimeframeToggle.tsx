'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useThemeContext } from '@/lib/ThemeContext';

type HoldersTimeframe = '1D' | '7D' | '30D' | '90D' | 'ALL';

interface HoldersTimeframeToggleProps {
  currentTimeframe: HoldersTimeframe;
  onTimeframeChange: (timeframe: HoldersTimeframe) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function HoldersTimeframeToggle({
  currentTimeframe,
  onTimeframeChange,
  primaryColor = '#52C97D',
  secondaryColor = '#000000',
}: HoldersTimeframeToggleProps) {
  const { theme } = useThemeContext();
  const isLight = theme === 'light';
  const topTimeframes: HoldersTimeframe[] = ['1D', '7D', '30D', '90D'];
  const bottomTimeframe: HoldersTimeframe = 'ALL';

  return (
    <div className="flex flex-col gap-1">
      {/* Top row - 4 buttons */}
      <div className="flex gap-1 justify-center">
        {topTimeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`
              relative flex-1 min-w-[50px] px-2 py-1 text-[10px] font-bold rounded transition-colors duration-200
              ${
                currentTimeframe === tf
                  ? ''
                  : isLight
                    ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/50 border border-gray-300/60'
                    : 'text-white hover:text-white hover:bg-gray-800/50 border border-gray-700/40'
              }
            `}
            style={currentTimeframe === tf ? { color: secondaryColor } : undefined}
          >
            {currentTimeframe === tf && (
              <motion.div
                layoutId="holdersTimeframeIndicator"
                className="absolute inset-0 rounded"
                style={{ backgroundColor: primaryColor }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tf}</span>
          </button>
        ))}
      </div>

      {/* Bottom row - 1 button */}
      <button
        onClick={() => onTimeframeChange(bottomTimeframe)}
        className={`
          relative w-full px-2 py-1 text-[10px] font-bold rounded transition-colors duration-200
          ${
            currentTimeframe === bottomTimeframe
              ? ''
              : isLight
                ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/50 border border-gray-300/60'
                : 'text-white hover:text-white hover:bg-gray-800/50 border border-gray-700/40'
          }
        `}
        style={currentTimeframe === bottomTimeframe ? { color: secondaryColor } : undefined}
      >
        {currentTimeframe === bottomTimeframe && (
          <motion.div
            layoutId="holdersTimeframeIndicator"
            className="absolute inset-0 rounded"
            style={{ backgroundColor: primaryColor }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10">{bottomTimeframe}</span>
      </button>
    </div>
  );
}
