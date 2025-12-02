'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2 } from 'lucide-react';
import { TextBoxDrawing } from '@/lib/drawingTools';
import { TextBoxTemplateManager, TextBoxTemplate } from '@/lib/textBoxTemplates';

interface TextBoxSettingsPanelProps {
  textBox: Partial<TextBoxDrawing>;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<TextBoxDrawing>) => void;
  onApply: () => void;
  primaryColor: string;
}

type Tab = 'text' | 'style' | 'visibility';

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48];
const FONT_FAMILIES = [
  { value: 'Inter, system-ui, -apple-system, sans-serif', label: 'Inter' },
  { value: '"DM Sans", system-ui, sans-serif', label: 'DM Sans' },
  { value: '"Instrument Sans", system-ui, sans-serif', label: 'Instrument Sans' },
  { value: '"Crimson Pro", Georgia, serif', label: 'Crimson Pro' },
  { value: '"Fraunces", Georgia, serif', label: 'Fraunces' },
  { value: '"JetBrains Mono", "Courier New", monospace', label: 'JetBrains Mono' },
];
const FONT_WEIGHTS = [
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi-Bold' },
  { value: '700', label: 'Bold' },
];

export default function TextBoxSettingsPanel({
  textBox,
  isOpen,
  onClose,
  onUpdate,
  onApply,
  primaryColor,
}: TextBoxSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [templates, setTemplates] = useState<TextBoxTemplate[]>([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Load templates on mount
  useEffect(() => {
    setTemplates(TextBoxTemplateManager.getTemplates());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;

    const style: Partial<TextBoxDrawing> = {
      fontSize: textBox.fontSize,
      fontFamily: textBox.fontFamily,
      fontWeight: textBox.fontWeight,
      fontStyle: textBox.fontStyle,
      textDecoration: textBox.textDecoration,
      color: textBox.color,
      textAlign: textBox.textAlign,
      backgroundColor: textBox.backgroundColor,
      backgroundOpacity: textBox.backgroundOpacity,
      backgroundEnabled: textBox.backgroundEnabled,
      borderEnabled: textBox.borderEnabled,
      borderColor: textBox.borderColor,
      borderWidth: textBox.borderWidth,
      padding: textBox.padding,
      textWrap: textBox.textWrap,
    };

    TextBoxTemplateManager.saveTemplate(templateName, style);
    setTemplates(TextBoxTemplateManager.getTemplates());
    setTemplateName('');
    setShowSaveTemplate(false);
  };

  const handleLoadTemplate = (template: TextBoxTemplate) => {
    onUpdate(template.style);
  };

  const handleDeleteTemplate = (id: string) => {
    TextBoxTemplateManager.deleteTemplate(id);
    setTemplates(TextBoxTemplateManager.getTemplates());
  };

  const text = textBox.text || '';
  const fontSize = textBox.fontSize || 16;
  const fontFamily = textBox.fontFamily || 'Inter, system-ui, -apple-system, sans-serif';
  const fontWeight = textBox.fontWeight || '400';
  const fontStyle = textBox.fontStyle || 'normal';
  const textDecoration = textBox.textDecoration || 'none';
  const color = textBox.color || '#000000';
  const textAlign = textBox.textAlign || 'left';
  const backgroundColor = textBox.backgroundColor || '#FFFFFF';
  const backgroundOpacity = textBox.backgroundOpacity !== undefined ? textBox.backgroundOpacity : 0.95;
  const backgroundEnabled = textBox.backgroundEnabled !== false;
  const borderEnabled = textBox.borderEnabled || false;
  const borderColor = textBox.borderColor || '#000000';
  const borderWidth = textBox.borderWidth || 2;
  const padding = textBox.padding || 12;
  const textWrap = textBox.textWrap !== false;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[500]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        data-textbox-settings="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[480px] bg-[#F5F3F0] rounded-2xl shadow-2xl overflow-hidden z-[501]"
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B4545]/5 via-[#8B4545]/10 to-[#8B4545]/5 border-b border-[#8B4545]/15 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1a1a1a]" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
              Anchored Text
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#8B4545]/10 text-[#8B4545]/70 hover:text-[#8B4545] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['text', 'style', 'visibility'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  color: activeTab === tab ? '#8B4545' : '#1a1a1a80',
                  fontFamily: '"Instrument Sans", system-ui, sans-serif',
                }}
              >
                {tab === activeTab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-[#8B4545]/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* TEXT TAB */}
            {activeTab === 'text' && (
              <motion.div
                key="text-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-[#8B4545] mb-2 tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                    TEXT CONTENT
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => onUpdate({ text: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-[#8B4545]/20 rounded-lg text-sm text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none focus:border-[#8B4545] focus:ring-2 focus:ring-[#8B4545]/20 transition-all resize-none"
                    placeholder="Enter your annotation text..."
                    rows={4}
                    style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
                  />
                </div>

                {/* Typography Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Font Size */}
                  <div>
                    <label className="block text-xs font-bold text-[#8B4545] mb-2 tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                      SIZE
                    </label>
                    <div className="relative">
                      <select
                        value={fontSize}
                        onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                        className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-[#8B4545]/20 rounded-lg text-sm font-medium text-[#1a1a1a] hover:border-[#8B4545]/40 focus:outline-none focus:border-[#8B4545] focus:ring-2 focus:ring-[#8B4545]/20 transition-all cursor-pointer"
                      >
                        {FONT_SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size}px
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#8B4545]/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-[#8B4545] mb-2 tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                      FONT
                    </label>
                    <div className="relative">
                      <select
                        value={fontFamily}
                        onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                        className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-[#8B4545]/20 rounded-lg text-sm font-medium text-[#1a1a1a] hover:border-[#8B4545]/40 focus:outline-none focus:border-[#8B4545] focus:ring-2 focus:ring-[#8B4545]/20 transition-all cursor-pointer"
                      >
                        {FONT_FAMILIES.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[#8B4545]/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-xs font-bold text-[#8B4545] mb-2 tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                    WEIGHT
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {FONT_WEIGHTS.map((weight) => (
                      <button
                        key={weight.value}
                        onClick={() => onUpdate({ fontWeight: weight.value })}
                        className={`py-2 text-sm font-medium rounded-lg border transition-all ${
                          fontWeight === weight.value
                            ? 'bg-[#8B4545]/15 border-[#8B4545] text-[#8B4545]'
                            : 'bg-white border-[#8B4545]/20 text-[#1a1a1a]/70 hover:border-[#8B4545]/40 hover:bg-[#8B4545]/5'
                        }`}
                      >
                        {weight.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format Buttons */}
                <div>
                  <label className="block text-xs font-bold text-[#8B4545] mb-2 tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                    FORMAT
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdate({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' })}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                        fontStyle === 'italic'
                          ? 'bg-[#8B4545]/15 border-[#8B4545] text-[#8B4545]'
                          : 'bg-white border-[#8B4545]/20 text-[#1a1a1a]/70 hover:border-[#8B4545]/40 hover:bg-[#8B4545]/5'
                      }`}
                    >
                      <span className="italic font-serif">Italic</span>
                    </button>
                    <button
                      onClick={() => onUpdate({ textDecoration: textDecoration === 'underline' ? 'none' : 'underline' })}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                        textDecoration === 'underline'
                          ? 'bg-[#8B4545]/15 border-[#8B4545] text-[#8B4545]'
                          : 'bg-white border-[#8B4545]/20 text-[#1a1a1a]/70 hover:border-[#8B4545]/40 hover:bg-[#8B4545]/5'
                      }`}
                    >
                      <span className="underline">Underline</span>
                    </button>
                  </div>
                </div>

                {/* Color and Alignment */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Text Color */}
                  <div>
                    <label className="block text-xs font-bold text-[#8B4545] mb-2 tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                      TEXT COLOR
                    </label>
                    <div className="relative">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => onUpdate({ color: e.target.value })}
                        className="absolute opacity-0 w-full h-full cursor-pointer"
                      />
                      <div
                        className="w-full h-10 rounded-lg border border-[#8B4545]/20 hover:border-[#8B4545]/40 transition-colors cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xs font-mono font-bold" style={{ color: color === '#FFFFFF' ? '#000000' : '#FFFFFF' }}>
                          {color.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div>
                    <label className="block text-xs font-bold text-[#8B4545] mb-2 tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                      ALIGN
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 bg-white border border-[#8B4545]/20 p-1 rounded-lg">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => onUpdate({ textAlign: align })}
                          className={`py-2 rounded-md transition-all ${
                            textAlign === align
                              ? 'bg-[#8B4545]/15 text-[#8B4545]'
                              : 'text-[#1a1a1a]/60 hover:bg-[#8B4545]/5'
                          }`}
                        >
                          <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {align === 'left' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                            )}
                            {align === 'center' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
                            )}
                            {align === 'right' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
                            )}
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STYLE TAB */}
            {activeTab === 'style' && (
              <motion.div
                key="style-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Background Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-[#8B4545] tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                      BACKGROUND
                    </label>
                    <button
                      onClick={() => onUpdate({ backgroundEnabled: !backgroundEnabled })}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        backgroundEnabled ? 'bg-[#8B4545]' : 'bg-[#1a1a1a]/20'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          backgroundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {backgroundEnabled && (
                    <div className="space-y-3">
                      {/* Background Color */}
                      <div>
                        <label className="block text-xs text-[#1a1a1a]/70 mb-2 font-medium">Color</label>
                        <div className="relative">
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                            className="absolute opacity-0 w-full h-full cursor-pointer"
                          />
                          <div
                            className="w-full h-12 rounded-lg border border-[#8B4545]/20 hover:border-[#8B4545]/40 transition-colors cursor-pointer"
                            style={{ backgroundColor }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-sm font-mono font-bold" style={{ color: backgroundColor === '#FFFFFF' || backgroundColor === '#ffffff' ? '#000000' : '#FFFFFF' }}>
                              {backgroundColor.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Background Opacity */}
                      <div>
                        <label className="block text-xs text-[#1a1a1a]/70 mb-2 font-medium">
                          Opacity: {Math.round(backgroundOpacity * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round(backgroundOpacity * 100)}
                          onChange={(e) => onUpdate({ backgroundOpacity: parseInt(e.target.value) / 100 })}
                          className="w-full h-2 bg-[#8B4545]/10 rounded-lg appearance-none cursor-pointer accent-[#8B4545]"
                          style={{
                            background: `linear-gradient(to right, #8B4545 0%, #8B4545 ${backgroundOpacity * 100}%, #8B454520 ${backgroundOpacity * 100}%, #8B454520 100%)`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#8B4545]/10" />

                {/* Border Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-[#8B4545] tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                      BORDER
                    </label>
                    <button
                      onClick={() => onUpdate({ borderEnabled: !borderEnabled })}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        borderEnabled ? 'bg-[#8B4545]' : 'bg-[#1a1a1a]/20'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          borderEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {borderEnabled && (
                    <div className="space-y-3">
                      {/* Border Color */}
                      <div>
                        <label className="block text-xs text-[#1a1a1a]/70 mb-2 font-medium">Color</label>
                        <div className="relative">
                          <input
                            type="color"
                            value={borderColor}
                            onChange={(e) => onUpdate({ borderColor: e.target.value })}
                            className="absolute opacity-0 w-full h-full cursor-pointer"
                          />
                          <div
                            className="w-full h-12 rounded-lg border border-[#8B4545]/20 hover:border-[#8B4545]/40 transition-colors cursor-pointer"
                            style={{ backgroundColor: borderColor }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-sm font-mono font-bold" style={{ color: borderColor === '#FFFFFF' || borderColor === '#ffffff' ? '#000000' : '#FFFFFF' }}>
                              {borderColor.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Border Width */}
                      <div>
                        <label className="block text-xs text-[#1a1a1a]/70 mb-2 font-medium">
                          Width: {borderWidth}px
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map((width) => (
                            <button
                              key={width}
                              onClick={() => onUpdate({ borderWidth: width })}
                              className={`py-2 text-sm font-medium rounded-lg border transition-all ${
                                borderWidth === width
                                  ? 'bg-[#8B4545]/15 border-[#8B4545] text-[#8B4545]'
                                  : 'bg-white border-[#8B4545]/20 text-[#1a1a1a]/70 hover:border-[#8B4545]/40 hover:bg-[#8B4545]/5'
                              }`}
                            >
                              {width}px
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#8B4545]/10" />

                {/* Layout Options */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#8B4545] tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                    LAYOUT
                  </label>

                  {/* Padding */}
                  <div>
                    <label className="block text-xs text-[#1a1a1a]/70 mb-2 font-medium">
                      Padding: {padding}px
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="24"
                      value={padding}
                      onChange={(e) => onUpdate({ padding: parseInt(e.target.value) })}
                      className="w-full h-2 bg-[#8B4545]/10 rounded-lg appearance-none cursor-pointer accent-[#8B4545]"
                      style={{
                        background: `linear-gradient(to right, #8B4545 0%, #8B4545 ${((padding - 8) / 16) * 100}%, #8B454520 ${((padding - 8) / 16) * 100}%, #8B454520 100%)`,
                      }}
                    />
                  </div>

                  {/* Text Wrap Toggle */}
                  <div className="flex items-center justify-between p-3 bg-white border border-[#8B4545]/20 rounded-lg">
                    <label className="text-sm text-[#1a1a1a] font-medium">Text Wrap</label>
                    <button
                      onClick={() => onUpdate({ textWrap: !textWrap })}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        textWrap ? 'bg-[#8B4545]' : 'bg-[#1a1a1a]/20'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          textWrap ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VISIBILITY TAB */}
            {activeTab === 'visibility' && (
              <motion.div
                key="visibility-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold text-[#8B4545] mb-3 tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                    SHOW ON TIMEFRAMES
                  </label>
                  <p className="text-xs text-[#1a1a1a]/60 mb-4">
                    Control which timeframes display this annotation. Coming soon!
                  </p>
                  <div className="grid grid-cols-3 gap-2 opacity-50 pointer-events-none">
                    {['1H', '4H', '8H', '1D', 'MAX', 'All'].map((tf) => (
                      <button
                        key={tf}
                        className="py-2.5 text-sm font-medium rounded-lg border bg-white border-[#8B4545]/20 text-[#1a1a1a]/70"
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Templates Section (shown on all tabs) */}
          <div className="mt-6 pt-5 border-t border-[#8B4545]/10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-[#8B4545] tracking-wider" style={{ fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                TEMPLATES
              </label>
              <button
                onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#8B4545] hover:bg-[#8B4545]/10 rounded-md transition-colors"
              >
                <Save className="w-3 h-3" />
                Save Current
              </button>
            </div>

            {/* Save Template Input */}
            <AnimatePresence>
              {showSaveTemplate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-3"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Template name..."
                      className="flex-1 px-3 py-2 bg-white border border-[#8B4545]/20 rounded-lg text-sm focus:outline-none focus:border-[#8B4545] focus:ring-2 focus:ring-[#8B4545]/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveTemplate();
                        }
                      }}
                    />
                    <button
                      onClick={handleSaveTemplate}
                      disabled={!templateName.trim()}
                      className="px-4 py-2 bg-[#8B4545] text-white text-sm font-medium rounded-lg hover:bg-[#8B4545]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Template List */}
            {templates.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-2 bg-white border border-[#8B4545]/20 rounded-lg hover:border-[#8B4545]/40 transition-colors group"
                  >
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className="flex-1 text-left text-sm text-[#1a1a1a] font-medium"
                    >
                      {template.name}
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-red-600/60 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#1a1a1a]/50 text-center py-3">
                No saved templates yet
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#8B4545]/10 bg-gradient-to-r from-[#8B4545]/5 via-transparent to-[#8B4545]/5 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#8B4545]/5 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="px-5 py-2 bg-[#8B4545] text-white text-sm font-medium rounded-lg hover:bg-[#8B4545]/90 shadow-lg shadow-[#8B4545]/20 hover:shadow-[#8B4545]/30 transition-all"
          >
            Apply
          </button>
        </div>
      </motion.div>
    </>
  );
}
