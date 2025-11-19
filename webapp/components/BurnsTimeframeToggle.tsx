import React from 'react';
import { motion } from 'framer-motion';

type BurnsTimeframe = '7D' | '30D' | '90D' | 'ALL';

interface BurnsTimeframeToggleProps {
  currentTimeframe: BurnsTimeframe;
  onTimeframeChange: (timeframe: BurnsTimeframe) => void;
}

export default function BurnsTimeframeToggle({
  currentTimeframe,
  onTimeframeChange,
}: BurnsTimeframeToggleProps) {
  const topTimeframes: BurnsTimeframe[] = ['7D', '30D', '90D'];
  const bottomTimeframe: BurnsTimeframe = 'ALL';

  return (
    <div className="flex flex-col gap-1">
      {/* Top row - 3 buttons */}
      <div className="flex gap-1 justify-center">
        {topTimeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`
              relative flex-1 min-w-[50px] px-2 py-1 text-[10px] font-bold rounded transition-colors duration-200
              ${
                currentTimeframe === tf
                  ? 'text-black'
                  : 'text-white hover:text-white hover:bg-gray-800/50 border border-gray-700/40'
              }
            `}
          >
            {currentTimeframe === tf && (
              <motion.div
                layoutId="burnsTimeframeIndicator"
                className="absolute inset-0 bg-[#52C97D] rounded"
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
              ? 'text-black'
              : 'text-white hover:text-white hover:bg-gray-800/50 border border-gray-700/40'
          }
        `}
      >
        {currentTimeframe === bottomTimeframe && (
          <motion.div
            layoutId="burnsTimeframeIndicator"
            className="absolute inset-0 bg-[#52C97D] rounded"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10">{bottomTimeframe}</span>
      </button>
    </div>
  );
}
