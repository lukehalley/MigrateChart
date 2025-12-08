'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Check, X, Download } from 'lucide-react';

export default function InquiryActions({ inquiry }: { inquiry: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update');
      router.refresh();
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const importAsProject = () => {
    if (inquiry.migrate_fun_url) {
      router.push(`/admin/projects/import?url=${encodeURIComponent(inquiry.migrate_fun_url)}`);
    }
  };

  return (
    <div
      className="inquiry-actions"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <style jsx>{`
        .inquiry-actions {
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

        .action-btn.approve:hover:not(:disabled) {
          color: var(--success);
          border-color: rgba(124, 182, 135, 0.3);
        }

        .action-btn.contact:hover:not(:disabled) {
          color: #6ba3d4;
          border-color: rgba(107, 163, 212, 0.3);
        }

        .action-btn.reject:hover:not(:disabled) {
          color: var(--error);
          border-color: rgba(196, 92, 92, 0.3);
        }

        .action-btn.import:hover:not(:disabled) {
          color: var(--accent);
          border-color: rgba(212, 168, 83, 0.3);
        }
      `}</style>

      {inquiry.status === 'pending' && (
        <>
          <button
            onClick={() => updateStatus('contacted')}
            disabled={loading}
            className="action-btn contact"
            title="Mark as contacted"
          >
            <Mail size={16} />
          </button>

          <button
            onClick={() => updateStatus('approved')}
            disabled={loading}
            className="action-btn approve"
            title="Approve"
          >
            <Check size={16} />
          </button>

          <button
            onClick={() => updateStatus('rejected')}
            disabled={loading}
            className="action-btn reject"
            title="Reject"
          >
            <X size={16} />
          </button>
        </>
      )}

      {inquiry.status === 'contacted' && (
        <>
          <button
            onClick={() => updateStatus('approved')}
            disabled={loading}
            className="action-btn approve"
            title="Approve"
          >
            <Check size={16} />
          </button>

          <button
            onClick={() => updateStatus('rejected')}
            disabled={loading}
            className="action-btn reject"
            title="Reject"
          >
            <X size={16} />
          </button>
        </>
      )}

      {inquiry.status === 'approved' && inquiry.migrate_fun_url && (
        <button
          onClick={importAsProject}
          className="action-btn import"
          title="Import as project"
        >
          <Download size={16} />
        </button>
      )}
    </div>
  );
}
