'use client';

import { useMemo } from 'react';

/**
 * Generates CSS variables for theming based on a primary color
 * Returns an object that can be spread into a style prop
 */
export function useTheme(primaryColor: string) {
  return useMemo(() => {
    // Parse hex color to RGB
    const hex = primaryColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Generate variations
    const lighten = (amount: number) => {
      const newR = Math.min(255, r + amount);
      const newG = Math.min(255, g + amount);
      const newB = Math.min(255, b + amount);
      return `rgb(${newR}, ${newG}, ${newB})`;
    };

    const darken = (amount: number) => {
      const newR = Math.max(0, r - amount);
      const newG = Math.max(0, g - amount);
      const newB = Math.max(0, b - amount);
      return `rgb(${newR}, ${newG}, ${newB})`;
    };

    const alpha = (opacity: number) => {
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    return {
      '--primary-color': primaryColor,
      '--primary-rgb': `${r}, ${g}, ${b}`,
      '--primary-glow': alpha(0.2),
      '--primary-light': lighten(30),
      '--primary-lighter': lighten(60),
      '--primary-lightest': lighten(90),
      '--primary-dark': darken(20),
      '--primary-darker': darken(40),
      '--primary-darkest': darken(60),
      '--primary-10': alpha(0.1),
      '--primary-20': alpha(0.2),
      '--primary-25': alpha(0.25),
      '--primary-30': alpha(0.3),
      '--primary-40': alpha(0.4),
      '--primary-50': alpha(0.5),
      '--primary-60': alpha(0.6),
    } as React.CSSProperties;
  }, [primaryColor]);
}
