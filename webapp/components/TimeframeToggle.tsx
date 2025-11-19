'use client';

import { motion } from 'framer-motion';
import { Timeframe } from '@/lib/types';

interface TimeframeToggleProps {
  currentTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  primaryColor: string;
  secondaryColor?: string;
}

const TIMEFRAMES: Timeframe[] = ['1H', '4H', '8H', '1D', 'MAX'];

export default function TimeframeToggle({ currentTimeframe, onTimeframeChange, primaryColor, secondaryColor = '#000000' }: TimeframeToggleProps) {
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {TIMEFRAMES.map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => onTimeframeChange(timeframe)}
          className={`
            relative flex-1 min-w-[50px] px-2 py-1 text-[10px] font-bold rounded transition-colors duration-200
            ${currentTimeframe === timeframe
              ? ''
              : 'text-white hover:text-white hover:bg-gray-800/50 border border-gray-700/40'
            }
          `}
          style={currentTimeframe === timeframe ? { color: secondaryColor } : undefined}
        >
          {currentTimeframe === timeframe && (
            <motion.div
              layoutId="timeframeIndicator"
              className="absolute inset-0 rounded"
              style={{ backgroundColor: primaryColor }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{timeframe}</span>
        </button>
      ))}
    </div>
  );
}
