'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function DonationBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [showCopied, setShowCopied] = useState(false);
  const solanaAddress = 'G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb';

  const handleCopy = () => {
    navigator.clipboard.writeText(solanaAddress);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#0A1F12]/95 via-black/95 to-[#0A1F12]/95 border-b border-[#52C97D]/30 backdrop-blur-sm py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Message */}
          <div className="flex items-center gap-3 min-w-0 my-2">
            <span className="text-white/70 text-xs sm:text-sm whitespace-nowrap">
              Buy Me A Coffee (Solana Network)
            </span>
            <span className="hidden sm:inline text-[#52C97D]/50">•</span>

            {/* Address - clickable to copy */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 min-w-0 group"
              title="Click to copy address"
            >
              <span className="text-[#52C97D] text-xs sm:text-sm font-mono truncate">
                {solanaAddress}
              </span>

              {/* Copy icon */}
              {showCopied ? (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#52C97D] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#52C97D]/60 group-hover:text-[#52C97D] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>

          {/* Right: Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0 p-1 my-2"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
