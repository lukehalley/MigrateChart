'use client';

import { motion } from 'motion/react';

export function ZeraLoadingLogo() {
  return (
    <div className="flex items-center justify-center px-4">
      <motion.div
        className="relative"
        style={{ width: '240px', height: '240px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.8,
          ease: 'easeInOut',
        }}
      >
        {/* ZERA Z logo */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 82 83"
          className="w-full h-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.6, 1, 0.6],
            scale: [0.8, 1, 1, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.5, 1],
          }}
        >
          <path
            d="M -0.5,-0.5 C 26.8333,-0.5 54.1667,-0.5 81.5,-0.5C 81.5,13.5 81.5,27.5 81.5,41.5C 68.4957,41.3334 55.4957,41.5001 42.5,42C 48.7563,48.762 55.423,54.9287 62.5,60.5C 68.6446,61.4902 74.9779,61.8235 81.5,61.5C 81.5,68.5 81.5,75.5 81.5,82.5C 54.1667,82.5 26.8333,82.5 -0.5,82.5C -0.5,68.5 -0.5,54.5 -0.5,40.5C 12.8375,40.6666 26.1708,40.4999 39.5,40C 35.2978,35.6298 30.9645,31.4632 26.5,27.5C 25.8333,26.1667 24.8333,25.1667 23.5,24.5C 22.7101,23.2058 21.7101,22.0391 20.5,21C 13.5079,20.5004 6.50793,20.3337 -0.5,20.5C -0.5,13.5 -0.5,6.5 -0.5,-0.5 Z"
            fill="#52C97D"
          />
        </motion.svg>

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
            background: 'radial-gradient(circle at center, #52C97D 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </div>
  );
}
