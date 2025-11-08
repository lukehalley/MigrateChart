'use client';

import { useEffect, useState } from 'react';

interface LastUpdatedProps {
  timestamp?: number;
  isLoading?: boolean;
}

export default function LastUpdated({ timestamp, isLoading }: LastUpdatedProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!timestamp) return;

    const updateTimeAgo = () => {
      const now = Date.now();
      const diff = now - timestamp;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);

      if (seconds < 10) {
        setTimeAgo('just now');
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(minutes / 60);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-[10px] text-white/40">
        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>Updating...</span>
      </div>
    );
  }

  if (!timestamp) return null;

  return (
    <div className="flex items-center gap-2 text-[10px] text-white/40">
      <div className="w-1.5 h-1.5 bg-[#52C97D] rounded-full"></div>
      <span>Updated {timeAgo}</span>
    </div>
  );
}
