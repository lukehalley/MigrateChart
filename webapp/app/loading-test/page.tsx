'use client';

import { TokenLoadingLogo } from '@/components/TokenLoadingLogo';

export default function LoadingTestPage() {
  const loaderSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82 83"><path d="M -0.5,-0.5 C 26.8333,-0.5 54.1667,-0.5 81.5,-0.5C 81.5,13.5 81.5,27.5 81.5,41.5C 68.4957,41.3334 55.4957,41.5001 42.5,42C 48.7563,48.762 55.423,54.9287 62.5,60.5C 68.6446,61.4902 74.9779,61.8235 81.5,61.5C 81.5,68.5 81.5,75.5 81.5,82.5C 54.1667,82.5 26.8333,82.5 -0.5,82.5C -0.5,68.5 -0.5,54.5 -0.5,40.5C 12.8375,40.6666 26.1708,40.4999 39.5,40C 35.2978,35.6298 30.9645,31.4632 26.5,27.5C 25.8333,26.1667 24.8333,25.1667 23.5,24.5C 22.7101,23.2058 21.7101,22.0391 20.5,21C 13.5079,20.5004 6.50793,20.3337 -0.5,20.5C -0.5,13.5 -0.5,6.5 -0.5,-0.5 Z" fill="currentColor"/></svg>';

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
      <h1 className="text-white text-2xl font-bold mb-4">Token Loading Animation Test</h1>

      <TokenLoadingLogo svg={loaderSvg} color="#52C97D" />

      <div className="text-white/60 text-sm text-center max-w-md mt-8">
        <p>This loading animation pulses with dynamic colors.</p>
        <p className="mt-2">The animation runs continuously while data is loading.</p>
      </div>
    </div>
  );
}
