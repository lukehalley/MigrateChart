'use client';

import { TokenLoadingLogo } from '@/components/TokenLoadingLogo';

export default function LoadingTestPage() {
  // Use the actual storage URL for ZERA logo
  const loaderUrl = 'https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-assets/zera/zera-mark-only-green.svg';

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
      <h1 className="text-white text-2xl font-bold mb-4">Token Loading Animation Test</h1>

      <TokenLoadingLogo svgUrl={loaderUrl} color="#52C97D" slug="zera" />

      <div className="text-white/60 text-sm text-center max-w-md mt-8">
        <p>This loading animation pulses with dynamic colors.</p>
        <p className="mt-2">The animation runs continuously while data is loading.</p>
      </div>
    </div>
  );
}
