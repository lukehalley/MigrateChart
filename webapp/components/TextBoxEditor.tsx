'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface TextBoxData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  logical: number;
  price: number;
}

interface TextBoxEditorProps {
  textBox: TextBoxData;
  isSelected: boolean;
  isEditing: boolean;
  onUpdate: (updates: Partial<TextBoxData>) => void;
  onStartDrag: (e: React.MouseEvent, handle?: string) => void;
  onDoubleClick: () => void;
  onBlur: () => void;
  primaryColor: string;
}

const HANDLE_SIZE = 8;
const ROTATION_HANDLE_OFFSET = 30;

export default function TextBoxEditor({
  textBox,
  isSelected,
  isEditing,
  onUpdate,
  onStartDrag,
  onDoubleClick,
  onBlur,
  primaryColor
}: TextBoxEditorProps) {
  const textAreaRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [localText, setLocalText] = useState(textBox.text);

  // Calculate text color based on background brightness
  const getTextColor = (bgColor: string) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const textColor = textBox.color || getTextColor(textBox.backgroundColor);

  // Focus text area when editing starts
  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(textAreaRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  // Update local text when textBox changes
  useEffect(() => {
    setLocalText(textBox.text);
  }, [textBox.text]);

  const handles = [
    { id: 'nw', x: 0, y: 0, cursor: 'nwse-resize' },
    { id: 'n', x: textBox.width / 2, y: 0, cursor: 'ns-resize' },
    { id: 'ne', x: textBox.width, y: 0, cursor: 'nesw-resize' },
    { id: 'e', x: textBox.width, y: textBox.height / 2, cursor: 'ew-resize' },
    { id: 'se', x: textBox.width, y: textBox.height, cursor: 'nwse-resize' },
    { id: 's', x: textBox.width / 2, y: textBox.height, cursor: 'ns-resize' },
    { id: 'sw', x: 0, y: textBox.height, cursor: 'nesw-resize' },
    { id: 'w', x: 0, y: textBox.height / 2, cursor: 'ew-resize' },
  ];

  return (
    <>
      {/* Main TextBox */}
      <div
        data-textbox-editor="true"
        className="absolute select-none"
        style={{
          left: `${textBox.x}px`,
          top: `${textBox.y}px`,
          width: `${textBox.width}px`,
          height: `${textBox.height}px`,
          transform: `rotate(${textBox.rotation}deg)`,
          transformOrigin: 'center center',
          zIndex: isSelected ? 100 : 50,
        }}
        onDoubleClick={onDoubleClick}
        onMouseDown={(e) => !isEditing && onStartDrag(e)}
      >
        {/* TextBox Content */}
        <div
          className={`w-full h-full rounded-lg shadow-lg flex items-center justify-center overflow-hidden ${
            !isEditing ? 'cursor-move' : ''
          }`}
          style={{
            backgroundColor: textBox.backgroundColor,
            padding: '12px',
          }}
        >
          {isEditing ? (
            <div
              ref={textAreaRef}
              contentEditable
              suppressContentEditableWarning
              className="w-full h-full outline-none overflow-auto resize-none"
              style={{
                color: textColor,
                fontSize: `${textBox.fontSize}px`,
                fontFamily: textBox.fontFamily,
                fontWeight: textBox.fontWeight,
                textAlign: textBox.textAlign,
                lineHeight: 1.4,
                wordWrap: 'break-word',
                cursor: 'text',
              }}
              onInput={(e) => {
                const text = e.currentTarget.textContent || '';
                setLocalText(text);
                onUpdate({ text });
              }}
              onBlur={onBlur}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.currentTarget.blur();
                }
              }}
              dangerouslySetInnerHTML={{ __html: localText }}
            />
          ) : (
            <div
              className="w-full h-full overflow-hidden"
              style={{
                color: textColor,
                fontSize: `${textBox.fontSize}px`,
                fontFamily: textBox.fontFamily,
                fontWeight: textBox.fontWeight,
                textAlign: textBox.textAlign,
                lineHeight: 1.4,
                wordWrap: 'break-word',
              }}
            >
              {textBox.text}
            </div>
          )}
        </div>

        {/* Selection Handles */}
        {isSelected && !isEditing && (
          <>
            {/* Selection Border */}
            <div
              className="absolute inset-0 border-2 rounded-lg pointer-events-none"
              style={{
                borderColor: primaryColor,
                boxShadow: `0 0 0 1px ${primaryColor}40`,
              }}
            />

            {/* Resize Handles */}
            {handles.map((handle) => (
              <div
                key={handle.id}
                className="absolute bg-white border-2 rounded-sm shadow-md hover:scale-125 transition-transform"
                style={{
                  width: `${HANDLE_SIZE}px`,
                  height: `${HANDLE_SIZE}px`,
                  left: `${handle.x - HANDLE_SIZE / 2}px`,
                  top: `${handle.y - HANDLE_SIZE / 2}px`,
                  borderColor: primaryColor,
                  cursor: handle.cursor,
                  transform: `rotate(-${textBox.rotation}deg)`,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onStartDrag(e, handle.id);
                }}
              />
            ))}

            {/* Rotation Handle */}
            <div
              className="absolute"
              style={{
                left: `${textBox.width / 2}px`,
                top: `-${ROTATION_HANDLE_OFFSET}px`,
                transform: `rotate(-${textBox.rotation}deg)`,
              }}
            >
              <div className="relative flex flex-col items-center">
                {/* Connection Line */}
                <div
                  className="w-0.5 h-6"
                  style={{ backgroundColor: primaryColor }}
                />
                {/* Rotation Handle */}
                <div
                  className="w-4 h-4 rounded-full border-2 bg-white shadow-md hover:scale-125 transition-transform cursor-grab active:cursor-grabbing"
                  style={{ borderColor: primaryColor }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onStartDrag(e, 'rotate');
                  }}
                >
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth="2"
                  >
                    <path d="M8 3 L8 8 L11 6" />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Formatting Toolbar */}
      <AnimatePresence>
        {isSelected && showToolbar && !isEditing && (
          <motion.div
            data-textbox-toolbar="true"
            className="absolute bg-black/95 backdrop-blur-lg border-2 rounded-lg shadow-2xl overflow-hidden"
            style={{
              left: `${textBox.x}px`,
              top: `${textBox.y - 60}px`,
              borderColor: primaryColor,
              boxShadow: `0 0 20px ${primaryColor}40`,
              zIndex: 200,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 p-2">
              {/* Font Size */}
              <input
                type="number"
                value={textBox.fontSize}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 14 })}
                className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                min="8"
                max="72"
              />

              {/* Font Weight */}
              <select
                value={textBox.fontWeight}
                onChange={(e) => onUpdate({ fontWeight: e.target.value })}
                className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
              >
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semi-Bold</option>
                <option value="700">Bold</option>
              </select>

              {/* Text Align */}
              <div className="flex gap-1 border-l border-white/20 pl-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onUpdate({ textAlign: align })}
                    className={`p-1 rounded transition-colors ${
                      textBox.textAlign === align
                        ? 'bg-white/20'
                        : 'hover:bg-white/10'
                    }`}
                    style={{ color: textBox.textAlign === align ? primaryColor : 'white' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

              {/* Background Color */}
              <div className="flex items-center gap-2 border-l border-white/20 pl-2">
                <input
                  type="color"
                  value={textBox.backgroundColor}
                  onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Toolbar Button */}
      {isSelected && !isEditing && (
        <button
          data-textbox-toolbar="true"
          className="absolute w-6 h-6 rounded-full border-2 bg-white shadow-md hover:scale-110 transition-transform flex items-center justify-center"
          style={{
            left: `${textBox.x + textBox.width + 12}px`,
            top: `${textBox.y - 3}px`,
            borderColor: primaryColor,
            zIndex: 150,
          }}
          onClick={() => setShowToolbar(!showToolbar)}
        >
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke={primaryColor} strokeWidth="2">
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        </button>
      )}
    </>
  );
}
