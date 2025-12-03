'use client';

import { motion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';

interface TextBoxSizeControlProps {
  fontSize: number;
  position: { x: number; y: number };
  onUpdate: (fontSize: number) => void;
  primaryColor: string;
}

export default function TextBoxSizeControl({
  fontSize,
  position,
  onUpdate,
  primaryColor,
}: TextBoxSizeControlProps) {
  const handleDecrease = () => {
    const newSize = Math.max(12, fontSize - 2);
    onUpdate(newSize);
  };

  const handleIncrease = () => {
    const newSize = Math.min(48, fontSize + 2);
    onUpdate(newSize);
  };

  return (
    <motion.div
      data-textbox-editor="true"
      className="fixed flex items-center gap-1 bg-black/90 backdrop-blur-sm rounded-lg px-2 py-1.5 z-[150]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        border: `1px solid ${primaryColor}40`,
        boxShadow: `0 0 12px ${primaryColor}20`,
      }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Decrease */}
      <button
        onClick={handleDecrease}
        disabled={fontSize <= 12}
        className="w-6 h-6 flex items-center justify-center rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          color: primaryColor,
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          if (fontSize > 12) {
            e.currentTarget.style.backgroundColor = `${primaryColor}20`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      {/* Font Size Display */}
      <div
        className="px-2 text-xs font-mono font-medium"
        style={{ color: primaryColor }}
      >
        {fontSize}px
      </div>

      {/* Increase */}
      <button
        onClick={handleIncrease}
        disabled={fontSize >= 48}
        className="w-6 h-6 flex items-center justify-center rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          color: primaryColor,
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          if (fontSize < 48) {
            e.currentTarget.style.backgroundColor = `${primaryColor}20`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
