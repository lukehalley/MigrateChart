import { redirect, notFound } from 'next/navigation';
import { getUser, createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { ArrowLeft, Mail, ExternalLink, Copy, Check, X, Download } from 'lucide-react';
import { toTitleCase } from '@/lib/utils';
import InquiryDetailActions from '@/components/admin/InquiryDetailActions';

async function getInquiry(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single();

  return data;
}

export default async function InquiryDetailPage({ params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) redirect('/admin/login');

  const inquiry = await getInquiry(params.id);
  if (!inquiry) notFound();

  return (
    <div className="inquiry-detail">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .inquiry-detail {
          --bg: #0a0a0a;
          --surface: rgba(255, 255, 255, 0.02);
          --surface-elevated: rgba(255, 255, 255, 0.04);
          --border: rgba(82, 201, 125, 0.15);
          --border-subtle: rgba(82, 201, 125, 0.08);
          --text: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.4);
          --accent: #52C97D;
          --accent-glow: rgba(82, 201, 125, 0.2);
          --orange: #D4A853;
          --orange-dim: rgba(212, 168, 83, 0.12);
          --blue: #5B9BD5;
          --red: #ef5350;

          min-height: 100vh;
          padding: 2rem 3rem 4rem;
          max-width: 1200px;
          font-family: 'IBM Plex Mono', monospace;
          position: relative;
        }

        .inquiry-detail::before {
          content: '';
          position: fixed;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          background: radial-gradient(ellipse at top right, rgba(82, 201, 125, 0.06) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .detail-container {
          position: relative;
          z-index: 1;
        }

        /* Header */
        .detail-header {
          margin-bottom: 2rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 2rem;
          transition: all 0.2s;
        }

        .back-link:hover {
          color: var(--accent);
          transform: translateX(-4px);
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .header-title-section {
          flex: 1;
        }

        .header-subtitle {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 0.75rem;
        }

        .header-title {
          font-family: 'Archivo', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 0.5rem;
        }

        .header-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .meta-divider {
          width: 4px;
          height: 4px;
          background: var(--text-muted);
          border-radius: 50%;
          opacity: 0.5;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        /* Status Badge */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 4px;
        }

        .status-badge.status-pending {
          background: var(--orange-dim);
          color: var(--orange);
          border: 1px solid rgba(212, 168, 83, 0.3);
        }

        .status-badge.status-contacted {
          background: rgba(91, 155, 213, 0.12);
          color: var(--blue);
          border: 1px solid rgba(91, 155, 213, 0.3);
        }

        .status-badge.status-approved {
          background: rgba(82, 201, 125, 0.12);
          color: var(--accent);
          border: 1px solid rgba(82, 201, 125, 0.3);
        }

        .status-badge.status-rejected {
          background: rgba(239, 83, 80, 0.12);
          color: var(--red);
          border: 1px solid rgba(239, 83, 80, 0.3);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-pending .status-dot {
          background: var(--orange);
          box-shadow: 0 0 8px var(--orange);
        }

        .status-contacted .status-dot {
          background: var(--blue);
          box-shadow: 0 0 8px var(--blue);
        }

        .status-approved .status-dot {
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
        }

        .status-rejected .status-dot {
          background: var(--red);
          box-shadow: 0 0 8px var(--red);
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          gap: 1.5rem;
        }

        /* Section Card */
        .section-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .section-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
          opacity: 0.5;
        }

        .section-title {
          font-family: 'Archivo', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 1.5rem;
        }

        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }

        .info-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-field.full {
          grid-column: 1 / -1;
        }

        .field-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .field-value {
          font-size: 0.9rem;
          color: var(--text);
          word-break: break-word;
        }

        .field-value.email {
          color: var(--accent);
        }

        .field-value.code {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .copy-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 0.375rem;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .copy-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .external-link {
          color: var(--accent);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.15s;
        }

        .external-link:hover {
          text-shadow: 0 0 12px var(--accent-glow);
        }

        .message-box {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-subtle);
          padding: 1.25rem;
          border-radius: 4px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.7;
          min-height: 120px;
        }

        .empty-message {
          color: var(--text-muted);
          font-style: italic;
        }

        /* Token Grid */
        .token-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .token-grid {
            grid-template-columns: 1fr;
          }
        }

        .token-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-subtle);
          padding: 1.5rem;
          border-radius: 4px;
          position: relative;
        }

        .token-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: var(--accent);
          opacity: 0.5;
        }

        .token-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .token-address {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          color: var(--text);
          word-break: break-all;
          line-height: 1.6;
        }
      `}</style>

      <div className="detail-container">
        <div className="detail-header">
          <Link href="/admin/inquiries" className="back-link">
            <ArrowLeft size={14} />
            Back to Inquiries
          </Link>

          <div className="header-top">
            <div className="header-title-section">
              <div className="header-subtitle">Inquiry Details</div>
              <h1 className="header-title">{inquiry.project_name}</h1>
              <div className="header-meta">
                <span>ID: {inquiry.id.slice(0, 8)}</span>
                <span className="meta-divider" />
                <span>Submitted {new Date(inquiry.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>

            <div className="header-actions">
              <div className={`status-badge status-${inquiry.status}`}>
                <span className="status-dot" />
                {toTitleCase(inquiry.status)}
              </div>
            </div>
          </div>

          <InquiryDetailActions inquiry={inquiry} />
        </div>

        <div className="content-grid">
          <div className="section-card">
            <h2 className="section-title">Contact Information</h2>
            <div className="info-grid">
              <div className="info-field">
                <span className="field-label">Name</span>
                <span className="field-value">{inquiry.name}</span>
              </div>

              <div className="info-field">
                <span className="field-label">Email</span>
                <span className="field-value email">{inquiry.email}</span>
              </div>

              {inquiry.telegram && (
                <div className="info-field">
                  <span className="field-label">Telegram</span>
                  <span className="field-value">{inquiry.telegram}</span>
                </div>
              )}
            </div>
          </div>

          <div className="section-card">
            <h2 className="section-title">Token Addresses</h2>
            <div className="token-grid">
              <div className="token-card">
                <div className="token-label">Pre-Migration Address</div>
                <div className="token-address">{inquiry.old_token_address}</div>
              </div>

              <div className="token-card">
                <div className="token-label">Post-Migration Address</div>
                <div className="token-address">{inquiry.new_token_address}</div>
              </div>
            </div>
          </div>

          {inquiry.migrate_fun_url && (
            <div className="section-card">
              <h2 className="section-title">Migration Link</h2>
              <div className="info-field">
                <a
                  href={inquiry.migrate_fun_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  {inquiry.migrate_fun_url}
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {inquiry.message && (
            <div className="section-card">
              <h2 className="section-title">Additional Notes</h2>
              <div className="message-box">
                {inquiry.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
