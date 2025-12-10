'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTokenContext } from '@/lib/TokenContext';
import { useThemeContext } from '@/lib/ThemeContext';

export function TokenSwitcher() {
  const { currentProject, allProjects, switchProject } = useTokenContext();
  const { theme } = useThemeContext();
  const isLight = theme === 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  const handleImageLoad = (slug: string) => {
    setImageLoaded(prev => ({ ...prev, [slug]: true }));
  };

  if (!currentProject) {
    return (
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-full animate-pulse ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`} />
        <h1 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Loading...</h1>
      </div>
    );
  }

  // If only one project, show without dropdown
  if (allProjects.length <= 1) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8">
          {!imageLoaded[currentProject.slug] && (
            <div className={`absolute inset-0 rounded-full animate-pulse ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`} />
          )}
          <img
            src={currentProject.logoUrl}
            alt={currentProject.name}
            className={`h-8 w-8 transition-opacity duration-300 ${
              imageLoaded[currentProject.slug] ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => handleImageLoad(currentProject.slug)}
          />
        </div>
        <h1 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentProject.name}</h1>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Current Token Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group"
      >
        <div className="relative h-8 w-8">
          {!imageLoaded[currentProject.slug] && (
            <div className={`absolute inset-0 rounded-full animate-pulse ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`} />
          )}
          <img
            src={currentProject.logoUrl}
            alt={currentProject.name}
            className={`h-8 w-8 group-hover:scale-105 transition-all duration-300 ${
              imageLoaded[currentProject.slug] ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => handleImageLoad(currentProject.slug)}
          />
        </div>
        <h1 className={`text-lg font-bold group-hover:text-[var(--primary-color)] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>
          {currentProject.name}
        </h1>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-white'}`} />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full left-0 mt-2 min-w-[200px] border-2 border-[var(--primary-color)]/60 rounded-lg shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] z-50 overflow-hidden ${isLight ? 'bg-white' : 'bg-gradient-to-b from-black to-black'}`}
            >
              {allProjects.map((project) => {
                const isActive = project.slug === currentProject.slug;
                return (
                  <button
                    key={project.slug}
                    onClick={() => {
                      if (!isActive) {
                        switchProject(project.slug);
                      }
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                      isActive
                        ? 'bg-[var(--primary-color)]/20 cursor-default'
                        : isLight ? 'hover:bg-gray-100 cursor-pointer' : 'hover:bg-white/10 cursor-pointer'
                    }`}
                  >
                    <div className="relative h-6 w-6">
                      {!imageLoaded[project.slug] && (
                        <div className={`absolute inset-0 rounded-full animate-pulse ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`} />
                      )}
                      <img
                        src={project.logoUrl}
                        alt={project.name}
                        className={`h-6 w-6 transition-opacity duration-300 ${
                          imageLoaded[project.slug] ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(project.slug)}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        isActive ? 'text-[var(--primary-color)]' : isLight ? 'text-gray-900' : 'text-white'
                      }`}
                    >
                      {project.name}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
