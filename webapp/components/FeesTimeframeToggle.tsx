import React from 'react';
import { motion } from 'framer-motion';

type FeesTimeframe = '1D' | '7D' | '30D' | '90D' | 'ALL';

interface FeesTimeframeToggleProps {
  currentTimeframe: FeesTimeframe;
  onTimeframeChange: (timeframe: FeesTimeframe) => void;
}

export default function FeesTimeframeToggle({
  currentTimeframe,
  onTimeframeChange,
}: FeesTimeframeToggleProps) {
  const topTimeframes: FeesTimeframe[] = ['1D', '7D', '30D', '90D'];
  const bottomTimeframe: FeesTimeframe = 'ALL';

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
                  ? 'text-black'
                  : 'text-white hover:text-white hover:bg-gray-800/50 border border-gray-700/40'
              }
            `}
          >
            {currentTimeframe === tf && (
              <motion.div
                layoutId="feesTimeframeIndicator"
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
            layoutId="feesTimeframeIndicator"
            className="absolute inset-0 bg-[#52C97D] rounded"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10">{bottomTimeframe}</span>
      </button>
    </div>
  );
}
