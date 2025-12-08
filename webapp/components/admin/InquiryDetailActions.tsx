'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Check, X, Download } from 'lucide-react';

export default function InquiryDetailActions({ inquiry }: { inquiry: any }) {
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

        .action-btn.contact {
          border-color: rgba(91, 155, 213, 0.3);
          color: #5B9BD5;
        }

        .action-btn.contact:hover:not(:disabled) {
          background: rgba(91, 155, 213, 0.1);
          border-color: rgba(91, 155, 213, 0.5);
          box-shadow: 0 0 20px rgba(91, 155, 213, 0.2);
        }

        .action-btn.approve {
          border-color: rgba(82, 201, 125, 0.3);
          color: #52C97D;
        }

        .action-btn.approve:hover:not(:disabled) {
          background: rgba(82, 201, 125, 0.1);
          border-color: rgba(82, 201, 125, 0.5);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
        }

        .action-btn.reject {
          border-color: rgba(239, 83, 80, 0.3);
          color: #ef5350;
        }

        .action-btn.reject:hover:not(:disabled) {
          background: rgba(239, 83, 80, 0.1);
          border-color: rgba(239, 83, 80, 0.5);
          box-shadow: 0 0 20px rgba(239, 83, 80, 0.2);
        }

        .action-btn.import {
          border-color: rgba(212, 168, 83, 0.3);
          color: #D4A853;
        }

        .action-btn.import:hover:not(:disabled) {
          background: rgba(212, 168, 83, 0.1);
          border-color: rgba(212, 168, 83, 0.5);
          box-shadow: 0 0 20px rgba(212, 168, 83, 0.2);
        }
      `}</style>

      {inquiry.status === 'pending' && (
        <>
          <button
            onClick={() => updateStatus('contacted')}
            disabled={loading}
            className="action-btn contact"
          >
            <Mail size={16} />
            Mark as Contacted
          </button>

          <button
            onClick={() => updateStatus('approved')}
            disabled={loading}
            className="action-btn approve"
          >
            <Check size={16} />
            Approve
          </button>

          <button
            onClick={() => updateStatus('rejected')}
            disabled={loading}
            className="action-btn reject"
          >
            <X size={16} />
            Reject
          </button>
        </>
      )}

      {inquiry.status === 'contacted' && (
        <>
          <button
            onClick={() => updateStatus('approved')}
            disabled={loading}
            className="action-btn approve"
          >
            <Check size={16} />
            Approve
          </button>

          <button
            onClick={() => updateStatus('rejected')}
            disabled={loading}
            className="action-btn reject"
          >
            <X size={16} />
            Reject
          </button>
        </>
      )}

      {inquiry.status === 'approved' && inquiry.migrate_fun_url && (
        <button
          onClick={importAsProject}
          className="action-btn import"
        >
          <Download size={16} />
          Import as Project
        </button>
      )}
    </div>
  );
}
