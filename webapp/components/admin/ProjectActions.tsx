'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, ExternalLink, X, Circle, CircleDot } from 'lucide-react';

export default function ProjectActions({ project }: { project: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleEnabled = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !project.enabled })
      });

      if (!response.ok) throw new Error('Failed to update');
      router.refresh();
    } catch (error) {
      alert('Failed to toggle status');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!confirm(`Delete "${project.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete');
      router.refresh();
    } catch (error) {
      alert('Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="project-actions"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <style jsx>{`
        .project-actions {
          display: flex;
          gap: 0.25rem;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .action-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--border);
          color: var(--text-primary);
        }

        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .action-btn.danger:hover:not(:disabled) {
          color: var(--error);
          border-color: rgba(196, 92, 92, 0.3);
        }

        .action-btn.toggle:hover:not(:disabled) {
          color: var(--success);
          border-color: rgba(124, 182, 135, 0.3);
        }

        .action-btn.preview:hover:not(:disabled) {
          color: #D4A853;
          border-color: rgba(212, 168, 83, 0.3);
        }
      `}</style>

      <button
        onClick={toggleEnabled}
        disabled={loading}
        className="action-btn toggle"
        title={project.enabled ? 'Disable project' : 'Enable project'}
      >
        {project.enabled ? <CircleDot size={14} /> : <Circle size={14} />}
      </button>

      <button
        onClick={() => router.push(project.is_active ? `/${project.slug}` : `/preview/${project.slug}`)}
        className={`action-btn ${project.is_active ? '' : 'preview'}`}
        title={project.is_active ? 'View project' : 'Preview inactive project'}
      >
        <Eye size={14} />
      </button>

      <button
        onClick={() => router.push(`/${project.slug}`)}
        className="action-btn"
        title="Open in new tab"
      >
        <ExternalLink size={14} />
      </button>

      <button
        onClick={deleteProject}
        disabled={loading}
        className="action-btn danger"
        title="Delete project"
      >
        <X size={14} />
      </button>
    </div>
  );
}
