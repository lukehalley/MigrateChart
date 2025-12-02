'use client';

import { motion } from 'motion/react';
import { Settings } from 'lucide-react';
import { TextBoxDrawing } from '@/lib/drawingTools';

interface TextBoxQuickToolbarProps {
  textBox: Partial<TextBoxDrawing>;
  position: { x: number; y: number };
  onUpdate: (updates: Partial<TextBoxDrawing>) => void;
  onOpenSettings: () => void;
  primaryColor: string;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48];
const FONT_FAMILIES = [
  { value: 'Inter, system-ui, -apple-system, sans-serif', label: 'Inter' },
  { value: '"DM Sans", system-ui, sans-serif', label: 'DM Sans' },
  { value: '"Instrument Sans", system-ui, sans-serif', label: 'Instrument' },
  { value: '"Crimson Pro", Georgia, serif', label: 'Crimson' },
  { value: '"JetBrains Mono", "Courier New", monospace', label: 'Mono' },
];

export default function TextBoxQuickToolbar({
  textBox,
  position,
  onUpdate,
  onOpenSettings,
  primaryColor,
}: TextBoxQuickToolbarProps) {
  const fontSize = textBox.fontSize || 16;
  const fontFamily = textBox.fontFamily || 'Inter, system-ui, -apple-system, sans-serif';
  const fontWeight = textBox.fontWeight || '400';
  const fontStyle = textBox.fontStyle || 'normal';
  const textDecoration = textBox.textDecoration || 'none';
  const color = textBox.color || '#000000';

  // Get font family label
  const selectedFont = FONT_FAMILIES.find(f => f.value === fontFamily) || FONT_FAMILIES[0];

  return (
    <motion.div
      data-textbox-toolbar="true"
      className="fixed bg-[#F5F3F0] rounded-lg shadow-2xl border border-[#8B4545]/20 overflow-hidden z-[150]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-2 p-2">
        {/* Font Size */}
        <div className="relative">
          <select
            value={fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
            className="appearance-none pl-3 pr-7 py-1.5 bg-white border border-[#8B4545]/20 rounded-md text-sm font-medium text-[#1a1a1a] hover:border-[#8B4545]/40 focus:outline-none focus:border-[#8B4545] transition-colors cursor-pointer"
            style={{ minWidth: '70px' }}
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-[#8B4545]/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Font Family */}
        <div className="relative">
          <select
            value={fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="appearance-none pl-3 pr-7 py-1.5 bg-white border border-[#8B4545]/20 rounded-md text-sm font-medium text-[#1a1a1a] hover:border-[#8B4545]/40 focus:outline-none focus:border-[#8B4545] transition-colors cursor-pointer"
            style={{ minWidth: '110px' }}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-[#8B4545]/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="w-px h-6 bg-[#8B4545]/20" />

        {/* Bold */}
        <button
          onClick={() => onUpdate({ fontWeight: fontWeight === '700' ? '400' : '700' })}
          className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${
            fontWeight === '700'
              ? 'bg-[#8B4545]/15 border-[#8B4545]/40 text-[#8B4545]'
              : 'border-[#8B4545]/20 text-[#1a1a1a]/70 hover:border-[#8B4545]/40 hover:bg-[#8B4545]/5'
          }`}
          title="Bold"
        >
          <span className="text-sm font-bold">B</span>
        </button>

        {/* Italic */}
        <button
          onClick={() => onUpdate({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' })}
          className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${
            fontStyle === 'italic'
              ? 'bg-[#8B4545]/15 border-[#8B4545]/40 text-[#8B4545]'
              : 'border-[#8B4545]/20 text-[#1a1a1a]/70 hover:border-[#8B4545]/40 hover:bg-[#8B4545]/5'
          }`}
          title="Italic"
        >
          <span className="text-sm italic font-serif">I</span>
        </button>

        {/* Underline */}
        <button
          onClick={() => onUpdate({ textDecoration: textDecoration === 'underline' ? 'none' : 'underline' })}
          className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${
            textDecoration === 'underline'
              ? 'bg-[#8B4545]/15 border-[#8B4545]/40 text-[#8B4545]'
              : 'border-[#8B4545]/20 text-[#1a1a1a]/70 hover:border-[#8B4545]/40 hover:bg-[#8B4545]/5'
          }`}
          title="Underline"
        >
          <span className="text-sm underline">U</span>
        </button>

        <div className="w-px h-6 bg-[#8B4545]/20" />

        {/* Text Color */}
        <div className="relative">
          <input
            type="color"
            value={color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-8 h-8 rounded-md cursor-pointer border border-[#8B4545]/20 hover:border-[#8B4545]/40 transition-colors"
            title="Text Color"
          />
        </div>

        <div className="w-px h-6 bg-[#8B4545]/20" />

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-[#8B4545]/30 text-[#8B4545] hover:bg-[#8B4545]/10 hover:border-[#8B4545]/50 transition-all"
          title="More Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
