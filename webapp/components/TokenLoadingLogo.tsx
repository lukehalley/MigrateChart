'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface TokenLoadingLogoProps {
  svgUrl?: string; // URL to SVG file in storage
  color: string;
}

export function TokenLoadingLogo({ svgUrl, color }: TokenLoadingLogoProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch SVG from URL
  useEffect(() => {
    if (!svgUrl) {
      setIsLoading(false);
      return;
    }

    // Fetch SVG content from URL
    const fetchSvg = async () => {
      try {
        const response = await fetch(svgUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        setSvgContent(text);
      } catch (error) {
        console.error('Error fetching SVG:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSvg();
  }, [svgUrl]);

  // Show nothing while loading
  if (isLoading || !svgContent) {
    return null;
  }

  return (
    <div className="flex items-center justify-center px-4">
      <div
        className="relative"
        style={{
          width: '240px',
          height: '240px',
        }}
      >
        {/* Token logo SVG */}
        <motion.div
          className="w-full h-full"
          style={{
            filter: `drop-shadow(0 0 12px ${color}66)`,
            color,
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
          <div
            className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
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
