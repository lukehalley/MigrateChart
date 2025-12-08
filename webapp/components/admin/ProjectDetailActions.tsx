'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, ExternalLink } from 'lucide-react';

export default function ProjectDetailActions({ project }: { project: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !project.is_active })
      });

      if (!response.ok) throw new Error('Failed to update');
      router.refresh();
    } catch (error) {
      alert('Failed to update project status');
    } finally {
      setLoading(false);
    }
  };

  const viewPublic = () => {
    if (project.slug) {
      const url = project.is_active ? `/${project.slug}` : `/preview/${project.slug}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="detail-actions">
      <style jsx>{`
        .detail-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1.25rem;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .action-btn.view {
          border-color: rgba(82, 201, 125, 0.3);
          color: #52C97D;
        }

        .action-btn.view:hover:not(:disabled) {
          background: rgba(82, 201, 125, 0.1);
          border-color: rgba(82, 201, 125, 0.5);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
        }

        .action-btn.activate {
          border-color: rgba(82, 201, 125, 0.3);
          color: #52C97D;
        }

        .action-btn.activate:hover:not(:disabled) {
          background: rgba(82, 201, 125, 0.1);
          border-color: rgba(82, 201, 125, 0.5);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
        }

        .action-btn.deactivate {
          border-color: rgba(239, 83, 80, 0.3);
          color: #ef5350;
        }

        .action-btn.deactivate:hover:not(:disabled) {
          background: rgba(239, 83, 80, 0.1);
          border-color: rgba(239, 83, 80, 0.5);
          box-shadow: 0 0 20px rgba(239, 83, 80, 0.2);
        }
      `}</style>

      <button
        onClick={viewPublic}
        className="action-btn view"
      >
        <ExternalLink size={16} />
        {project.is_active ? 'View Public Page' : 'Show Preview'}
      </button>

      <button
        onClick={toggleStatus}
        disabled={loading}
        className={`action-btn ${project.is_active ? 'deactivate' : 'activate'}`}
      >
        {project.is_active ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  );
}
