'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface TokenLoadingLogoProps {
  svgUrl?: string; // URL to SVG file in storage (for backwards compatibility)
  svgContent?: string | null; // Pre-loaded SVG content (preferred method)
  color: string;
  isLoading?: boolean; // External loading state
}

export function TokenLoadingLogo({ svgUrl, svgContent: externalSvgContent, color, isLoading: externalIsLoading = false }: TokenLoadingLogoProps) {
  const [internalSvgContent, setInternalSvgContent] = useState<string>('');
  const [internalIsLoading, setInternalIsLoading] = useState<boolean>(true);

  // Use external SVG content if provided, otherwise fetch from URL
  const svgContent = externalSvgContent || internalSvgContent;
  const isLoading = externalIsLoading || internalIsLoading;

  // Debug: Log component state
  console.log('[TokenLoadingLogo] Render state:', {
    hasExternalContent: !!externalSvgContent,
    hasInternalContent: !!internalSvgContent,
    externalIsLoading,
    internalIsLoading,
    finalIsLoading: isLoading,
    hasSvgContent: !!svgContent
  });

  // Fetch SVG from URL only if not provided externally
  useEffect(() => {
    // If SVG content is already provided, no need to fetch
    if (externalSvgContent !== undefined) {
      setInternalIsLoading(false);
      return;
    }

    if (!svgUrl) {
      setInternalIsLoading(false);
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
        setInternalSvgContent(text);
      } catch (error) {
        console.error('Error fetching SVG:', error);
      } finally {
        setInternalIsLoading(false);
      }
    };

    fetchSvg();
  }, [svgUrl, externalSvgContent]);

  // Show fallback spinner while loading or if SVG fetch failed
  if (isLoading || !svgContent) {
    console.log('[TokenLoadingLogo] Showing fallback spinner');
    return (
      <motion.div
        className="flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          width: '240px',
          height: '240px',
        }}
      >
        <svg
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '80px',
            height: '80px',
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
