'use client';

interface ChartControlsProps {
  displayMode: 'price' | 'marketCap';
  onDisplayModeChange: (mode: 'price' | 'marketCap') => void;
  showVolume: boolean;
  onVolumeToggle: () => void;
  showMigrationLines: boolean;
  onMigrationLinesToggle: () => void;
}

export default function ChartControls({
  displayMode,
  onDisplayModeChange,
  showVolume,
  onVolumeToggle,
  showMigrationLines,
  onMigrationLinesToggle,
}: ChartControlsProps) {
  return (
    <div className="stat-card" style={{ padding: '24px 16px' }}>
      <p style={{ marginBottom: '20px' }} className="text-white text-[11px] font-medium text-center tracking-wider">CHART OPTIONS</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Display Mode Section */}
        <div>
          <label style={{ marginBottom: '10px' }} className="text-white/70 text-[10px] font-medium block tracking-wide">
            Y-AXIS DISPLAY
          </label>
          <div className="grid grid-cols-2 gap-2 bg-black/60 p-1 rounded-lg border border-[#52C97D]/30">
            <button
              onClick={() => onDisplayModeChange('price')}
              className={`py-2.5 text-xs font-bold tracking-wider transition-all rounded-md ${
                displayMode === 'price'
                  ? 'bg-[#52C97D] text-black shadow-[0_0_8px_rgba(82,201,125,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              PRICE
            </button>
            <button
              onClick={() => onDisplayModeChange('marketCap')}
              className={`py-2.5 text-xs font-bold tracking-wider transition-all rounded-md ${
                displayMode === 'marketCap'
                  ? 'bg-[#52C97D] text-black shadow-[0_0_8px_rgba(82,201,125,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              MKT CAP
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ margin: '0' }} className="border-t border-[#52C97D]/20"></div>

        {/* Volume Bars Toggle */}
        <div style={{ paddingLeft: '4px', paddingRight: '4px' }}>
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2.5">
              <svg className="w-3.5 h-3.5 text-[#52C97D]/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <label className="text-white text-[11px] font-medium group-hover:text-[#52C97D] transition-colors cursor-pointer">
                Volume Bars
              </label>
            </div>
            <button
              onClick={onVolumeToggle}
              className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-all duration-300 ${
                showVolume
                  ? 'bg-[#52C97D] shadow-[0_0_6px_rgba(82,201,125,0.4)]'
                  : 'bg-gray-700/80 hover:bg-gray-600/80'
              }`}
              aria-label={showVolume ? 'Hide volume bars' : 'Show volume bars'}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
                  showVolume
                    ? 'translate-x-[22px]'
                    : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Migration Events Toggle */}
        <div style={{ paddingLeft: '4px', paddingRight: '4px' }}>
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2.5">
              <svg className="w-3.5 h-3.5 text-[#52C97D]/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <label className="text-white text-[11px] font-medium group-hover:text-[#52C97D] transition-colors cursor-pointer">
                Migration Events
              </label>
            </div>
            <button
              onClick={onMigrationLinesToggle}
              className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-all duration-300 ${
                showMigrationLines
                  ? 'bg-[#52C97D] shadow-[0_0_6px_rgba(82,201,125,0.4)]'
                  : 'bg-gray-700/80 hover:bg-gray-600/80'
              }`}
              aria-label={showMigrationLines ? 'Hide migration lines' : 'Show migration lines'}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
                  showMigrationLines
                    ? 'translate-x-[22px]'
                    : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
