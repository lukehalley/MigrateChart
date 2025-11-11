'use client';

import { useState } from 'react';
import { Heart, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DonationBanner() {
  const [showCopied, setShowCopied] = useState(false);
  const solanaAddress = 'G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb';

  const handleCopy = () => {
    navigator.clipboard.writeText(solanaAddress);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <motion.div
      className="relative bg-gradient-to-r from-[#0A1F12] via-[#1F6338]/30 to-[#0A1F12] border-b-2 border-[#52C97D]/50 backdrop-blur-sm shadow-[0_4px_20px_rgba(82,201,125,0.25)]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#52C97D]/20 to-transparent opacity-50"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      <div className="w-full relative px-3 sm:px-0">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-3 sm:py-4">

          {/* Left: Call to Action with Icon */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-[#52C97D] fill-[#52C97D]" />
            </motion.div>
            <div className="text-center sm:text-left">
              <p className="text-white font-bold text-xs sm:text-base leading-tight">
                Support This Free Tool
              </p>
              <p className="text-white/70 text-[10px] sm:text-xs leading-tight">
                Donate via Solana Network
              </p>
            </div>
          </div>

          <div className="hidden sm:block h-10 w-px bg-[#52C97D]/30"></div>

          {/* Center: Address with better visibility */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <motion.div
              className="flex items-center gap-2 bg-black/60 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-[#52C97D]/40 flex-1 sm:flex-initial overflow-hidden"
              whileHover={{ borderColor: 'rgba(82, 201, 125, 0.7)' }}
            >
              <code className="text-[#52C97D] text-[10px] sm:text-sm font-mono select-all truncate">
                {solanaAddress}
              </code>
            </motion.div>

            <motion.button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 bg-[#52C97D] text-black font-bold text-xs sm:text-sm rounded-lg shadow-lg sm:w-[100px]"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 20px rgba(82, 201, 125, 0.5)'
              }}
              title="Copy address to clipboard"
            >
              <AnimatePresence mode="wait">
                {showCopied ? (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Copied!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
