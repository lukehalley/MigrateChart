'use client';

import { Timeframe } from '@/lib/types';

interface TimeframeToggleProps {
  currentTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const TIMEFRAMES: Timeframe[] = ['1H', '4H', '1D', '1W'];

export default function TimeframeToggle({ currentTimeframe, onTimeframeChange }: TimeframeToggleProps) {
  return (
    <div className="flex gap-2 justify-between">
      {TIMEFRAMES.map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => onTimeframeChange(timeframe)}
          className={`
            flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all duration-200
            ${currentTimeframe === timeframe
              ? 'bg-[#52C97D] text-black shadow-lg'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-gray-700/40'
            }
          `}
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
}
