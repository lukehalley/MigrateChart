'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTokenContext } from '@/lib/TokenContext';

export function TokenSwitcher() {
  const { currentProject, allProjects, switchProject } = useTokenContext();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentProject) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse" />
        <h1 className="text-lg font-bold text-white">Loading...</h1>
      </div>
    );
  }

  // If only one project, show without dropdown
  if (allProjects.length <= 1) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={currentProject.logoUrl}
          alt={currentProject.name}
          className="h-8 w-8"
        />
        <h1 className="text-lg font-bold text-white">{currentProject.name}</h1>
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
        <img
          src={currentProject.logoUrl}
          alt={currentProject.name}
          className="h-8 w-8 group-hover:scale-105 transition-transform"
        />
        <h1 className="text-lg font-bold text-white group-hover:text-[var(--primary-color)] transition-colors">
          {currentProject.name}
        </h1>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-white" />
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
              className="absolute top-full left-0 mt-2 min-w-[200px] bg-gradient-to-b from-black to-black border-2 border-[var(--primary-color)]/60 rounded-lg shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] z-50 overflow-hidden"
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
                        : 'hover:bg-white/10 cursor-pointer'
                    }`}
                  >
                    <img
                      src={project.logoUrl}
                      alt={project.name}
                      className="h-6 w-6"
                    />
                    <span
                      className={`text-sm font-bold ${
                        isActive ? 'text-[var(--primary-color)]' : 'text-white'
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
