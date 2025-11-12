'use client';

interface ChartControlsProps {
  displayMode: 'price' | 'marketCap';
  onDisplayModeChange: (mode: 'price' | 'marketCap') => void;
  showVolume: boolean;
  onVolumeToggle: () => void;
  showMigrationLines: boolean;
  onMigrationLinesToggle: () => void;
  isLogScale: boolean;
  onLogScaleToggle: () => void;
  isAutoScale: boolean;
  onAutoScaleToggle: () => void;
  onResetPosition?: () => void;
}

export default function ChartControls({
  displayMode,
  onDisplayModeChange,
  showVolume,
  onVolumeToggle,
  showMigrationLines,
  onMigrationLinesToggle,
  isLogScale,
  onLogScaleToggle,
  isAutoScale,
  onAutoScaleToggle,
  onResetPosition,
}: ChartControlsProps) {
  return (
    <div className="stat-card" style={{ padding: '10px 8px' }}>
      <p style={{ marginBottom: '8px' }} className="text-white text-[10px] font-medium text-center tracking-wider">CHART OPTIONS</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Display Mode Section */}
        <div>
          <label style={{ marginBottom: '6px' }} className="text-white/70 text-[9px] font-medium block tracking-wide">
            Y-AXIS DISPLAY
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-black/60 p-1 rounded-lg border border-[#52C97D]/30">
            <button
              onClick={() => onDisplayModeChange('price')}
              className={`py-1.5 text-[10px] font-bold tracking-wider transition-all rounded-md ${
                displayMode === 'price'
                  ? 'bg-[#52C97D] text-black shadow-[0_0_8px_rgba(82,201,125,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              PRICE
            </button>
            <button
              onClick={() => onDisplayModeChange('marketCap')}
              className={`py-1.5 text-[10px] font-bold tracking-wider transition-all rounded-md ${
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
        <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-[#52C97D]/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <label className="text-white text-[10px] font-medium group-hover:text-[#52C97D] transition-colors cursor-pointer">
                Volume Bars
              </label>
            </div>
            <button
              onClick={onVolumeToggle}
              className={`relative flex-shrink-0 w-9 h-[18px] rounded-full transition-all duration-300 ${
                showVolume
                  ? 'bg-[#52C97D] shadow-[0_0_6px_rgba(82,201,125,0.4)]'
                  : 'bg-gray-700/80 hover:bg-gray-600/80'
              }`}
              aria-label={showVolume ? 'Hide volume bars' : 'Show volume bars'}
            >
              <div
                className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
                  showVolume
                    ? 'translate-x-[19px]'
                    : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Migration Events Toggle */}
        <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-[#52C97D]/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <label className="text-white text-[10px] font-medium group-hover:text-[#52C97D] transition-colors cursor-pointer">
                Migration Events
              </label>
            </div>
            <button
              onClick={onMigrationLinesToggle}
              className={`relative flex-shrink-0 w-9 h-[18px] rounded-full transition-all duration-300 ${
                showMigrationLines
                  ? 'bg-[#52C97D] shadow-[0_0_6px_rgba(82,201,125,0.4)]'
                  : 'bg-gray-700/80 hover:bg-gray-600/80'
              }`}
              aria-label={showMigrationLines ? 'Hide migration lines' : 'Show migration lines'}
            >
              <div
                className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
                  showMigrationLines
                    ? 'translate-x-[19px]'
                    : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ margin: '0' }} className="border-t border-[#52C97D]/20"></div>

        {/* Auto Scale Toggle */}
        <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-[#52C97D]/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <label className="text-white text-[10px] font-medium group-hover:text-[#52C97D] transition-colors cursor-pointer">
                Auto Scale
              </label>
            </div>
            <button
              onClick={onAutoScaleToggle}
              className={`relative flex-shrink-0 w-9 h-[18px] rounded-full transition-all duration-300 ${
                isAutoScale
                  ? 'bg-[#52C97D] shadow-[0_0_6px_rgba(82,201,125,0.4)]'
                  : 'bg-gray-700/80 hover:bg-gray-600/80'
              }`}
              aria-label={isAutoScale ? 'Disable auto scale' : 'Enable auto scale'}
            >
              <div
                className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
                  isAutoScale
                    ? 'translate-x-[19px]'
                    : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Log Scale Toggle */}
        <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-[#52C97D]/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <label className="text-white text-[10px] font-medium group-hover:text-[#52C97D] transition-colors cursor-pointer">
                Log Scale
              </label>
            </div>
            <button
              onClick={onLogScaleToggle}
              className={`relative flex-shrink-0 w-9 h-[18px] rounded-full transition-all duration-300 ${
                isLogScale
                  ? 'bg-[#52C97D] shadow-[0_0_6px_rgba(82,201,125,0.4)]'
                  : 'bg-gray-700/80 hover:bg-gray-600/80'
              }`}
              aria-label={isLogScale ? 'Switch to linear scale' : 'Switch to log scale'}
            >
              <div
                className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
                  isLogScale
                    ? 'translate-x-[19px]'
                    : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset Position Button */}
        {onResetPosition && (
          <>
            {/* Divider */}
            <div style={{ margin: '0' }} className="border-t border-[#52C97D]/20"></div>

            <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
              <button
                onClick={onResetPosition}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-black/60 hover:bg-[#52C97D]/20 border border-[#52C97D]/30 hover:border-[#52C97D]/60 rounded-lg transition-all"
              >
                <svg className="w-3 h-3 text-[#52C97D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-white text-[9px] font-medium">Reset Position</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
