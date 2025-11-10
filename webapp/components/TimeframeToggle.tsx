'use client';

import { Timeframe } from '@/lib/types';

interface TimeframeToggleProps {
  currentTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const TIMEFRAMES: Timeframe[] = ['1H', '4H', '8H', '1D', 'MAX'];

export default function TimeframeToggle({ currentTimeframe, onTimeframeChange }: TimeframeToggleProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {TIMEFRAMES.map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => onTimeframeChange(timeframe)}
          className={`
            flex-1 min-w-[60px] px-3 py-2 text-xs font-semibold transition-all duration-200 rounded
            ${currentTimeframe === timeframe
              ? 'bg-[#52C97D] text-black'
              : 'text-white hover:text-white hover:bg-gray-800/50 border border-gray-700/40'
            }
          `}
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
}
