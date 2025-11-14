'use client';

import { motion } from 'framer-motion';

interface TokenLoadingLogoProps {
  svg: string;
  color: string;
}

export function TokenLoadingLogo({ svg, color }: TokenLoadingLogoProps) {
  return (
    <div className="flex items-center justify-center px-4">
      <motion.div
        className="relative"
        style={{
          width: '240px',
          height: '240px',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.4,
          ease: 'easeInOut',
        }}
      >
        {/* Token logo SVG */}
        <motion.div
          className="w-full h-full flex items-center justify-center"
          style={{
            filter: `drop-shadow(0 0 12px ${color}66)`,
            color,
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
            WebkitFontSmoothing: 'antialiased',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            willChange: 'transform, opacity',
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
          initial={{ opacity: 0.3, scale: 0.9 }}
          animate={{
            opacity: [0.3, 0.7, 1, 0.7],
            scale: [0.9, 1, 1, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.5, 1],
          }}
        />

        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 blur-2xl -z-10"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.5, 1],
          }}
          style={{
            background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    </div>
  );
}
