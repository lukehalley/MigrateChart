'use client';

import { useEffect } from 'react';

/**
 * Custom hook to dynamically update the favicon
 * @param iconUrl - URL of the icon to use as favicon
 */
export function useFavicon(iconUrl: string | null | undefined) {
  useEffect(() => {
    if (!iconUrl) return;

    // Get or create favicon link elements
    const updateFavicon = (rel: string, sizes?: string) => {
      const selector = sizes
        ? `link[rel="${rel}"][sizes="${sizes}"]`
        : `link[rel="${rel}"]`;

      let link = document.querySelector(selector) as HTMLLinkElement;

      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        if (sizes) link.sizes.value = sizes;
        document.head.appendChild(link);
      }

      link.href = iconUrl;
    };

    // Update all favicon variants
    updateFavicon('icon');
    updateFavicon('shortcut icon');
    updateFavicon('apple-touch-icon');

  }, [iconUrl]);
}
