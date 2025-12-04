import React from 'react';
import { motion } from 'framer-motion';

type BurnsTimeframe = '1D' | '7D' | '30D' | '90D' | 'ALL';

interface BurnsTimeframeToggleProps {
  currentTimeframe: BurnsTimeframe;
  onTimeframeChange: (timeframe: BurnsTimeframe) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function BurnsTimeframeToggle({
  currentTimeframe,
  onTimeframeChange,
  primaryColor = '#52C97D',
  secondaryColor = '#000000',
}: BurnsTimeframeToggleProps) {
  const topTimeframes: BurnsTimeframe[] = ['1D', '7D', '30D'];
  const bottomTimeframes: BurnsTimeframe[] = ['90D', 'ALL'];

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
                  ? ''
                  : 'text-white hover:text-white hover:bg-gray-800/50 border border-gray-700/40'
              }
            `}
            style={currentTimeframe === tf ? { color: secondaryColor } : undefined}
          >
            {currentTimeframe === tf && (
              <motion.div
                layoutId="burnsTimeframeIndicator"
                className="absolute inset-0 rounded"
                style={{ backgroundColor: primaryColor }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tf}</span>
          </button>
        ))}
      </div>

      {/* Bottom row - 2 buttons */}
      <div className="flex gap-1 justify-center">
        {bottomTimeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`
              relative flex-1 min-w-[50px] px-2 py-1 text-[10px] font-bold rounded transition-colors duration-200
              ${
                currentTimeframe === tf
                  ? ''
                  : 'text-white hover:text-white hover:bg-gray-800/50 border border-gray-700/40'
              }
            `}
            style={currentTimeframe === tf ? { color: secondaryColor } : undefined}
          >
            {currentTimeframe === tf && (
              <motion.div
                layoutId="burnsTimeframeIndicator"
                className="absolute inset-0 rounded"
                style={{ backgroundColor: primaryColor }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tf}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
