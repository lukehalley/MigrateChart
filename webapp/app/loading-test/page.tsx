'use client';

import { ZeraLoadingLogo } from '@/components/ZeraLoadingLogo';

export default function LoadingTestPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
      <h1 className="text-white text-2xl font-bold mb-4">Zera Loading Animation</h1>

      <ZeraLoadingLogo />

      <div className="text-white/60 text-sm text-center max-w-md mt-8">
        <p>This loading animation pulses the Zera logo with the brand green color (#52C97D).</p>
        <p className="mt-2">The animation runs continuously while data is loading.</p>
      </div>
    </div>
  );
}
