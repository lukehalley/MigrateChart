'use client';

import { Timeframe } from '@/lib/types';

interface TimeframeToggleProps {
  currentTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const TIMEFRAMES: Timeframe[] = ['1H', '4H', '8H', '1D', 'MAX'];

export default function TimeframeToggle({ currentTimeframe, onTimeframeChange }: TimeframeToggleProps) {
  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {TIMEFRAMES.map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => onTimeframeChange(timeframe)}
          className={`
            flex-1 min-w-[50px] px-2 py-1 text-[10px] font-bold transition-all duration-200 rounded
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
