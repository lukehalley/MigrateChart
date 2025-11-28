'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface TokenLoadingLogoProps {
  svgUrl?: string; // URL to SVG file in storage
  color: string;
  isLoading?: boolean; // External loading state
  slug?: string; // Project slug for size customization
}

export function TokenLoadingLogo({ svgUrl, color, isLoading = false, slug }: TokenLoadingLogoProps) {
  // Debug: Log component state
  console.log('[TokenLoadingLogo] Render state:', {
    hasSvgUrl: !!svgUrl,
    isLoading,
  });

  // Show fallback spinner only if no SVG URL
  // Don't check isLoading here - if we have an svgUrl, show the branded logo
  if (!svgUrl) {
    console.log('[TokenLoadingLogo] Showing fallback spinner - no svgUrl');
    return (
      <motion.div
        className="flex items-center justify-center w-72 h-72 md:w-[32rem] md:h-[32rem]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <svg
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
          className="w-20 h-20 md:w-32 md:h-32"
          style={{
            filter: `drop-shadow(0 0 12px ${color}66)`,
          }}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray="31.4 31.4"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </motion.div>
    );
  }

  console.log('[TokenLoadingLogo] Showing custom logo animation');
  console.log('[TokenLoadingLogo] SVG URL:', svgUrl);

  return (
    <div className="flex items-center justify-center px-4">
      <div className="relative w-48 h-48 md:w-64 md:h-64">
        {/* Token logo SVG */}
        <motion.div
          className="w-full h-full"
          style={{
            filter: `drop-shadow(0 0 12px ${color}66)`,
          }}
          // No initial prop - prevents animation reset on remount
          // Start from mid-cycle values for smooth continuous animation
          animate={{
            opacity: [0.5, 0.7, 1, 0.7, 0.5],
            scale: [0.95, 1, 1, 1, 0.95],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'loop',
          }}
        >
          <img
            src={svgUrl}
            alt="Token Logo"
            className="w-full h-full object-contain"
            style={{
              display: 'block',
            }}
          />
        </motion.div>

        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 blur-2xl -z-10"
          // No initial prop - prevents animation reset on remount
          // Start from mid-cycle values for smooth continuous animation
          animate={{
            opacity: [0.2, 0.3, 0.5, 0.3, 0.2],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'loop',
          }}
          style={{
            background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          }}
        />
      </div>
    </div>
  );
}
