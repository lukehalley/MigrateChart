'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TextBoxDrawing } from '@/lib/drawingTools';

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
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color: string;
  backgroundColor: string;
  backgroundOpacity?: number;
  backgroundEnabled?: boolean;
  borderEnabled?: boolean;
  borderColor?: string;
  borderWidth?: number;
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  padding?: number;
  textWrap?: boolean;
  baseBarSpacing?: number;
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
  onRightClick?: (e: React.MouseEvent) => void;
  onHoverChange?: (isHovering: boolean) => void;
  primaryColor: string;
}

const HANDLE_SIZE = 6;
const ROTATION_HANDLE_OFFSET = 25;

export default function TextBoxEditor({
  textBox,
  isSelected,
  isEditing,
  onUpdate,
  onStartDrag,
  onDoubleClick,
  onBlur,
  onRightClick,
  onHoverChange,
  primaryColor,
}: TextBoxEditorProps) {
  const textAreaRef = useRef<HTMLDivElement>(null);
  const [localText, setLocalText] = useState(textBox.text);
  const [isHovered, setIsHovered] = useState(false);
  const hasSelectedInitialTextRef = useRef(false);

  const fontSize = textBox.fontSize || 16;
  const fontFamily = textBox.fontFamily || 'Inter, system-ui, -apple-system, sans-serif';
  const fontWeight = textBox.fontWeight || '400';
  const fontStyle = textBox.fontStyle || 'normal';
  const textDecoration = textBox.textDecoration || 'none';
  const backgroundColor = textBox.backgroundColor || '#FFFFFF';
  const backgroundOpacity = textBox.backgroundOpacity !== undefined ? textBox.backgroundOpacity : 0.95;
  const backgroundEnabled = textBox.backgroundEnabled !== false;
  const borderEnabled = textBox.borderEnabled || false;
  const borderColor = textBox.borderColor || '#000000';
  const borderWidth = textBox.borderWidth || 2;
  const padding = textBox.padding || 12;

  // Calculate text color based on background brightness (if not explicitly set)
  const getTextColor = (bgColor: string) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const textColor = textBox.color || (backgroundEnabled ? getTextColor(backgroundColor) : primaryColor);

  // Create neon glow text-shadow effect
  const textShadow = `
    0 0 5px ${textColor},
    0 0 10px ${textColor},
    0 0 20px ${textColor},
    0 0 30px ${textColor}
  `;

  // Focus text area when editing starts and set initial content
  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      // Set content only once when entering edit mode
      if (textAreaRef.current.textContent !== textBox.text) {
        textAreaRef.current.textContent = textBox.text;
      }

      textAreaRef.current.focus();

      // Only select all text on initial edit, not on every render
      if (!hasSelectedInitialTextRef.current) {
        const range = document.createRange();
        range.selectNodeContents(textAreaRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        hasSelectedInitialTextRef.current = true;
      }
    } else {
      // Reset the flag when not editing
      hasSelectedInitialTextRef.current = false;
    }
  }, [isEditing, textBox.text]);

  // Update local text when textBox changes (only when not editing)
  useEffect(() => {
    if (!isEditing) {
      setLocalText(textBox.text);
    }
  }, [textBox.text, isEditing]);

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

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
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
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onRightClick && !isEditing) {
          onRightClick(e);
        }
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHoverChange?.(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHoverChange?.(false);
      }}
    >
      {/* TextBox Content */}
      <div
        className={`w-full h-full rounded-lg flex items-center justify-center overflow-hidden transition-all ${
          !isEditing ? 'cursor-move' : 'cursor-text'
        }`}
        style={{
          backgroundColor: backgroundEnabled ? hexToRgba(backgroundColor, backgroundOpacity) : 'transparent',
          padding: `${padding}px`,
          border: borderEnabled ? `${borderWidth}px solid ${borderColor}` : 'none',
          boxShadow: backgroundEnabled
            ? (isSelected || isHovered
                ? `0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 ${isSelected ? 2 : 1}px ${hexToRgba(primaryColor, isSelected ? 0.4 : 0.2)}`
                : '0 2px 8px rgba(0, 0, 0, 0.1)')
            : 'none',
        }}
        onMouseDown={(e) => {
          // Start drag when clicking on the text content (when already selected)
          if (!isEditing) {
            e.stopPropagation();
            onStartDrag(e);
          }
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
              fontSize: `${fontSize}px`,
              fontFamily,
              fontWeight,
              fontStyle,
              textDecoration,
              textAlign: textBox.textAlign,
              lineHeight: 1.4,
              wordWrap: 'break-word',
              cursor: 'text',
              textShadow,
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
          />
        ) : (
          <div
            className="w-full h-full overflow-hidden"
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              fontFamily,
              fontWeight,
              fontStyle,
              textDecoration,
              textAlign: textBox.textAlign,
              lineHeight: 1.4,
              wordWrap: 'break-word',
              textShadow,
            }}
          >
            {textBox.text}
          </div>
        )}
      </div>

      {/* Selection Indicators and Handles */}
      <AnimatePresence>
        {isSelected && !isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Selection Border - solid for background, dotted for pure text */}
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{
                border: backgroundEnabled
                  ? `2px solid ${primaryColor}`
                  : `1px dashed ${hexToRgba(primaryColor, 0.4)}`,
              }}
              animate={{
                boxShadow: backgroundEnabled
                  ? [
                      `0 0 0 0 ${hexToRgba(primaryColor, 0.4)}`,
                      `0 0 0 4px ${hexToRgba(primaryColor, 0)}`,
                    ]
                  : [
                      `0 0 0 0 ${hexToRgba(primaryColor, 0.2)}`,
                      `0 0 0 2px ${hexToRgba(primaryColor, 0)}`,
                    ],
              }}
              transition={{
                duration: 0.6,
                repeat: 1,
                ease: 'easeOut',
              }}
            />

            {/* Resize Handles - subtle and refined */}
            {handles.map((handle) => (
              <motion.div
                key={handle.id}
                className="absolute rounded-full shadow-lg transition-all"
                style={{
                  width: `${HANDLE_SIZE}px`,
                  height: `${HANDLE_SIZE}px`,
                  left: `${handle.x - HANDLE_SIZE / 2}px`,
                  top: `${handle.y - HANDLE_SIZE / 2}px`,
                  backgroundColor: backgroundEnabled ? '#ffffff' : primaryColor,
                  border: backgroundEnabled ? `1.5px solid ${primaryColor}` : 'none',
                  cursor: handle.cursor,
                  transform: `rotate(-${textBox.rotation}deg)`,
                  boxShadow: backgroundEnabled
                    ? `0 0 4px ${hexToRgba(primaryColor, 0.3)}`
                    : `0 0 8px ${primaryColor}, 0 0 4px ${primaryColor}`,
                  pointerEvents: 'auto', // Ensure handles capture events
                }}
                whileHover={{
                  scale: 1.5,
                  boxShadow: backgroundEnabled
                    ? `0 0 12px ${hexToRgba(primaryColor, 0.6)}`
                    : `0 0 16px ${primaryColor}, 0 0 8px ${primaryColor}`,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
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
                pointerEvents: 'auto', // Ensure rotation handle captures events
              }}
            >
              <div className="relative flex flex-col items-center">
                {/* Connection Line - glowing for pure text */}
                <motion.div
                  style={{
                    width: backgroundEnabled ? '2px' : '1px',
                    height: `${ROTATION_HANDLE_OFFSET - 12}px`,
                    backgroundColor: primaryColor,
                    boxShadow: backgroundEnabled
                      ? 'none'
                      : `0 0 8px ${primaryColor}, 0 0 4px ${primaryColor}`,
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                />
                {/* Rotation Handle - glowing for text, subtle for boxes */}
                <motion.div
                  className="rounded-full shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center"
                  style={{
                    width: backgroundEnabled ? '20px' : '16px',
                    height: backgroundEnabled ? '20px' : '16px',
                    backgroundColor: backgroundEnabled ? '#ffffff' : primaryColor,
                    border: backgroundEnabled ? `2px solid ${primaryColor}` : 'none',
                    boxShadow: backgroundEnabled
                      ? `0 0 8px ${hexToRgba(primaryColor, 0.3)}`
                      : `0 0 12px ${primaryColor}, 0 0 6px ${primaryColor}`,
                    pointerEvents: 'auto', // Ensure rotation handle captures events
                  }}
                  whileHover={{
                    scale: 1.3,
                    boxShadow: backgroundEnabled
                      ? `0 0 16px ${hexToRgba(primaryColor, 0.6)}`
                      : `0 0 20px ${primaryColor}, 0 0 10px ${primaryColor}`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onStartDrag(e, 'rotate');
                  }}
                >
                  {backgroundEnabled && (
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke={primaryColor}
                      strokeWidth="2"
                    >
                      <path d="M8 3 L8 8 L11 6" />
                    </svg>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
