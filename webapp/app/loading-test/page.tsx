'use client';

import { ZeraLoadingLogo } from '@/components/ZeraLoadingLogo';
import { useState } from 'react';

export default function LoadingTestPage() {
  const [key, setKey] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const handleRestart = () => {
    setShowComplete(false);
    setKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
      <h1 className="text-white text-2xl font-bold mb-4">Zera Loading Animation</h1>

      <ZeraLoadingLogo
        key={key}
        duration={2}
        onComplete={() => {
          setShowComplete(true);
        }}
      />

      {showComplete && (
        <div className="text-[#52C97D] text-xl font-semibold animate-pulse">
          Loading Complete!
        </div>
      )}

      <button
        onClick={handleRestart}
        className="mt-8 px-6 py-3 bg-[#52C97D] text-black font-semibold rounded-lg hover:bg-[#3FAA66] transition-colors"
      >
        Restart Animation
      </button>

      <div className="text-white/60 text-sm text-center max-w-md mt-8">
        <p>This loading animation fills the Zera logo from 0-100% with the brand green color (#52C97D).</p>
        <p className="mt-2">Inspired by the Motion.dev loading fill text example.</p>
      </div>
    </div>
  );
}
