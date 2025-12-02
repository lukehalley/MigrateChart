'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export type TextBoxAction =
  | 'edit'
  | 'duplicate'
  | 'delete'
  | 'lock'
  | 'bringToFront'
  | 'sendToBack'
  | 'cloneStyle';

interface TextBoxContextMenuProps {
  position: { x: number; y: number };
  onAction: (action: TextBoxAction) => void;
  onClose: () => void;
  primaryColor: string;
  isLocked?: boolean;
}

export default function TextBoxContextMenu({
  position,
  onAction,
  onClose,
  primaryColor,
  isLocked = false,
}: TextBoxContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Small delay to prevent immediate close
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    {
      action: 'edit' as TextBoxAction,
      label: 'Edit Settings',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      shortcut: '⏎',
    },
    {
      action: 'duplicate' as TextBoxAction,
      label: 'Duplicate',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      shortcut: '⌘D',
    },
    { divider: true },
    {
      action: 'bringToFront' as TextBoxAction,
      label: 'Bring to Front',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      ),
    },
    {
      action: 'sendToBack' as TextBoxAction,
      label: 'Send to Back',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      ),
    },
    { divider: true },
    {
      action: 'cloneStyle' as TextBoxAction,
      label: 'Copy Style',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    { divider: true },
    {
      action: 'delete' as TextBoxAction,
      label: 'Delete',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      shortcut: 'Del',
      danger: true,
    },
  ];

  // Helper to parse RGB from hex
  const hexToRgba = (hex: string, alpha: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <motion.div
      ref={menuRef}
      data-textbox-context="true"
      className="fixed bg-[#F5F3F0] rounded-lg shadow-2xl overflow-hidden z-[1000] border border-[#8B4545]/20"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '200px',
      }}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="py-1">
        {menuItems.map((item, index) => {
          if ('divider' in item) {
            return (
              <div
                key={`divider-${index}`}
                className="my-1 border-t border-[#8B4545]/10"
              />
            );
          }

          const isDanger = 'danger' in item && item.danger;

          return (
            <button
              key={item.action}
              onClick={() => {
                onAction(item.action);
                onClose();
              }}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#8B4545]/8 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className={isDanger ? 'text-red-600' : 'text-[#8B4545]/70 group-hover:text-[#8B4545]'}>
                  {item.icon}
                </span>
                <span className={`text-sm font-medium ${isDanger ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
                  {item.label}
                </span>
              </div>
              {item.shortcut && (
                <span className="text-xs text-[#8B4545]/50 font-mono">
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
