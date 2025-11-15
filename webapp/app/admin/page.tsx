'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import ProjectCard from '@/components/admin/ProjectCard';
import ProjectForm from '@/components/admin/ProjectForm';

interface Project {
  id: string;
  slug: string;
  name: string;
  primary_color: string;
  logo_url: string;
  loader_svg: string;
  donation_address: string;
  is_default: boolean;
  is_active: boolean;
  poolCount: number;
}

interface ProjectWithPools extends Project {
  pools?: any[];
}

export default function AdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithPools | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = async (project: Project) => {
    // Fetch full project details including pools
    try {
      const response = await fetch(`/api/projects/${project.slug}`);
      if (response.ok) {
        const fullProject = await response.json();
        setEditingProject({
          ...project,
          pools: fullProject.pools,
        });
        setIsFormOpen(true);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (deleteConfirm !== projectId) {
      setDeleteConfirm(projectId);
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProjects();
        setDeleteConfirm(null);
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = () => {
    fetchProjects();
    setIsFormOpen(false);
    setEditingProject(undefined);
  };

  const handleNewProject = () => {
    setEditingProject(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(undefined);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b-2 border-[#1F6338] px-6 py-8 bg-gradient-to-r from-[#0A1F12] via-[#1F6338]/10 to-[#0A1F12]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#52C97D] tracking-wide">
              Token Project Manager
            </h1>
            <p className="text-white/70 mt-2">Manage token projects, pools, and migrations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleNewProject}
              className="px-6 py-3 font-bold rounded transition-all bg-[#52C97D] text-black hover:shadow-[0_0_30px_rgba(82,201,125,0.7)]"
            >
              + New Project
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 font-bold rounded transition-all bg-red-500/20 text-red-500 border-2 border-red-500/50 hover:bg-red-500/30 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,83,80,0.5)]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white/70">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-white/70">No projects yet</p>
            <button
              onClick={handleNewProject}
              className="px-6 py-3 font-bold rounded transition-all bg-[#52C97D]/20 text-[#52C97D] border-2 border-[#52C97D] hover:bg-[#52C97D]/30 hover:shadow-[0_0_20px_rgba(82,201,125,0.5)]"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div key={project.id} className="relative">
                <ProjectCard
                  project={project}
                  onEdit={() => handleEdit(project)}
                  onDelete={() => handleDelete(project.id)}
                  index={index}
                />

                {/* Delete confirmation overlay */}
                <AnimatePresence>
                  {deleteConfirm === project.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 border-2 border-red-500"
                      style={{ boxShadow: '0 0 30px rgba(239, 83, 80, 0.5)' }}
                    >
                      <div className="text-center">
                        <p className="text-white font-bold mb-2">Delete Project?</p>
                        <p className="text-white/70 text-sm">
                          This will delete all pools and migrations
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 font-bold rounded bg-white/10 text-white border-2 border-white/20 hover:bg-white/20"
                          disabled={isDeleting}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="px-4 py-2 font-bold rounded bg-red-500 text-white border-2 border-red-600 hover:shadow-[0_0_20px_rgba(239,83,80,0.7)]"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        project={editingProject}
        onSave={handleSave}
      />
    </div>
  );
}
