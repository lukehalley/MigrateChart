'use client';

import { motion } from 'framer-motion';

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
  primaryColor: string;
  secondaryColor?: string;
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
  primaryColor,
  secondaryColor = '#000000',
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
          <div className="grid grid-cols-2 gap-1.5 bg-black/60 p-1 rounded-lg border" style={{ borderColor: `${primaryColor}30` }}>
            <button
              onClick={() => onDisplayModeChange('price')}
              className={`relative py-1.5 text-[10px] font-bold tracking-wider rounded-md transition-colors duration-200 ${
                displayMode === 'price'
                  ? ''
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              style={displayMode === 'price' ? { color: secondaryColor } : undefined}
            >
              {displayMode === 'price' && (
                <motion.div
                  layoutId="displayModeIndicator"
                  className="absolute inset-0 rounded-md"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 8px ${primaryColor}66`
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">PRICE</span>
            </button>
            <button
              onClick={() => onDisplayModeChange('marketCap')}
              className={`relative py-1.5 text-[10px] font-bold tracking-wider rounded-md transition-colors duration-200 ${
                displayMode === 'marketCap'
                  ? ''
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              style={displayMode === 'marketCap' ? { color: secondaryColor } : undefined}
            >
              {displayMode === 'marketCap' && (
                <motion.div
                  layoutId="displayModeIndicator"
                  className="absolute inset-0 rounded-md"
                  style={{
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 8px ${primaryColor}66`
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">MKT CAP</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ margin: '0', borderColor: `${primaryColor}33` }} className="border-t"></div>

        {/* Volume Bars Toggle */}
        <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 flex-shrink-0" style={{ color: `${primaryColor}b3` }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <label className="text-white text-[10px] font-medium transition-colors cursor-pointer">
                Volume Bars
              </label>
            </div>
            <button
              onClick={onVolumeToggle}
              className={`relative flex-shrink-0 w-9 h-[18px] rounded-full transition-all duration-300 ${!showVolume ? 'bg-gray-700/80 hover:bg-gray-600/80' : ''}`}
              style={showVolume ? {
                backgroundColor: primaryColor,
                boxShadow: `0 0 6px ${primaryColor}66`
              } : undefined}
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
              <svg className="w-3 h-3 flex-shrink-0" style={{ color: `${primaryColor}b3` }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <label className="text-white text-[10px] font-medium transition-colors cursor-pointer">
                Migration Events
              </label>
            </div>
            <button
              onClick={onMigrationLinesToggle}
              className={`relative flex-shrink-0 w-9 h-[18px] rounded-full transition-all duration-300 ${!showMigrationLines ? 'bg-gray-700/80 hover:bg-gray-600/80' : ''}`}
              style={showMigrationLines ? {
                backgroundColor: primaryColor,
                boxShadow: `0 0 6px ${primaryColor}66`
              } : undefined}
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
        <div style={{ margin: '0', borderColor: `${primaryColor}33` }} className="border-t"></div>

        {/* Auto Scale Toggle */}
        <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 flex-shrink-0" style={{ color: `${primaryColor}b3` }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <label className="text-white text-[10px] font-medium transition-colors cursor-pointer">
                Auto Scale
              </label>
            </div>
            <button
              onClick={onAutoScaleToggle}
              className={`relative flex-shrink-0 w-9 h-[18px] rounded-full transition-all duration-300 ${!isAutoScale ? 'bg-gray-700/80 hover:bg-gray-600/80' : ''}`}
              style={isAutoScale ? {
                backgroundColor: primaryColor,
                boxShadow: `0 0 6px ${primaryColor}66`
              } : undefined}
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
              <svg className="w-3 h-3 flex-shrink-0" style={{ color: `${primaryColor}b3` }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <label className="text-white text-[10px] font-medium transition-colors cursor-pointer">
                Log Scale
              </label>
            </div>
            <button
              onClick={onLogScaleToggle}
              className={`relative flex-shrink-0 w-9 h-[18px] rounded-full transition-all duration-300 ${!isLogScale ? 'bg-gray-700/80 hover:bg-gray-600/80' : ''}`}
              style={isLogScale ? {
                backgroundColor: primaryColor,
                boxShadow: `0 0 6px ${primaryColor}66`
              } : undefined}
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
            <div style={{ margin: '0', borderColor: `${primaryColor}33` }} className="border-t"></div>

            <div style={{ paddingLeft: '2px', paddingRight: '2px' }}>
              <button
                onClick={onResetPosition}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-black/60 border rounded-lg transition-all"
                style={{
                  borderColor: `${primaryColor}4d`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${primaryColor}33`;
                  e.currentTarget.style.borderColor = `${primaryColor}99`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                  e.currentTarget.style.borderColor = `${primaryColor}4d`;
                }}
              >
                <svg className="w-3 h-3" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
