'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

interface Project {
  id: string;
  slug: string;
  name: string;
  primary_color: string;
  logo_url: string;
  is_default: boolean;
  is_active: boolean;
  poolCount: number;
}

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

export default function ProjectCard({ project, onEdit, onDelete, index }: ProjectCardProps) {
  const rgb = hexToRgb(project.primary_color);
  const rgbString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="bg-[#0A1F12] border-2 p-6 relative overflow-hidden"
      style={{
        borderColor: `rgba(${rgbString}, 0.5)`,
        boxShadow: `0 0 12px rgba(${rgbString}, 0.3)`,
      }}
    >
      {/* Status badges */}
      <div className="absolute top-3 right-3 flex gap-2">
        {project.is_default && (
          <span
            className="text-xs px-2 py-1 rounded font-bold"
            style={{
              backgroundColor: `rgba(${rgbString}, 0.2)`,
              color: project.primary_color,
            }}
          >
            DEFAULT
          </span>
        )}
        {!project.is_active && (
          <span className="text-xs px-2 py-1 rounded font-bold bg-red-500/20 text-red-500">
            INACTIVE
          </span>
        )}
      </div>

      {/* Logo */}
      <div className="flex justify-center mb-4 mt-6">
        <div
          className="relative w-20 h-20 rounded-full overflow-hidden border-2"
          style={{
            borderColor: project.primary_color,
            boxShadow: `0 0 20px rgba(${rgbString}, 0.4)`,
          }}
        >
          <Image
            src={project.logo_url}
            alt={project.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Project name */}
      <h3 className="text-xl font-bold text-center text-white mb-2">{project.name}</h3>

      {/* Color swatch with pulse animation */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-full animate-pulse"
          style={{
            backgroundColor: project.primary_color,
            boxShadow: `0 0 16px rgba(${rgbString}, 0.6)`,
          }}
        />
        <span className="text-xs text-white/70 font-mono">{project.primary_color}</span>
      </div>

      {/* Pool count */}
      <div className="text-center mb-6">
        <span className="text-sm text-white/70">
          {project.poolCount} {project.poolCount === 1 ? 'pool' : 'pools'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 px-4 py-2 font-bold rounded transition-all"
          style={{
            backgroundColor: `rgba(${rgbString}, 0.2)`,
            color: project.primary_color,
            border: `2px solid rgba(${rgbString}, 0.5)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${rgbString}, 0.3)`;
            e.currentTarget.style.borderColor = project.primary_color;
            e.currentTarget.style.boxShadow = `0 0 20px rgba(${rgbString}, 0.5)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `rgba(${rgbString}, 0.2)`;
            e.currentTarget.style.borderColor = `rgba(${rgbString}, 0.5)`;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 font-bold rounded transition-all bg-red-500/20 text-red-500 border-2 border-red-500/50 hover:bg-red-500/30 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,83,80,0.5)]"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return { r, g, b };
}
