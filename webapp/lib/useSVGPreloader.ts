import { useState, useEffect } from 'react';

/**
 * Custom hook to preload SVG content from a URL
 * Returns the SVG content and loading state
 */
export function useSVGPreloader(svgUrl: string | undefined) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!svgUrl) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const preloadSVG = async () => {
      try {
        console.log('[SVG PRELOADER] Starting fetch:', svgUrl);
        setIsLoading(true);
        setError(null);

        const response = await fetch(svgUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        console.log('[SVG PRELOADER] Fetch complete, content length:', text.length);

        if (!isCancelled) {
          setSvgContent(text);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to preload SVG:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!isCancelled) {
          console.log('[SVG PRELOADER] Loading complete, setting isLoading=false');
          setIsLoading(false);
        }
      }
    };

    preloadSVG();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true;
    };
  }, [svgUrl]);

  return { svgContent, isLoading, error };
}
