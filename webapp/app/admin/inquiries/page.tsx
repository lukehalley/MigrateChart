import { redirect } from 'next/navigation';
import { getUser, createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import InquiryActions from '@/components/admin/InquiryActions';
import { toTitleCase } from '@/lib/utils';

async function getInquiries() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function InquiriesPage() {
  const user = await getUser();
  if (!user) redirect('/admin/login');

  const inquiries = await getInquiries();
  const pendingCount = inquiries.filter(i => i.status === 'pending').length;

  return (
    <div className="inquiries-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .inquiries-page {
          --bg: #0a0a0a;
          --surface: transparent;
          --surface-elevated: rgba(0, 0, 0, 0.3);
          --border: rgba(82, 201, 125, 0.15);
          --border-subtle: rgba(82, 201, 125, 0.05);
          --text: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.4);
          --primary: #52C97D;
          --green: #52C97D;
          --green-dim: rgba(82, 201, 125, 0.12);
          --green-glow: rgba(82, 201, 125, 0.2);
          --orange: #D4A853;
          --orange-dim: rgba(212, 168, 83, 0.12);
          --red: #ef5350;
          --blue: #5B9BD5;

          padding: 2.5rem 3rem;
          max-width: 1400px;
          font-family: 'JetBrains Mono', monospace;
          -webkit-font-smoothing: antialiased;
        }

        .page-header {
          margin-bottom: 2.5rem;
        }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-bottom: 0.35rem;
        }

        .page-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .page-subtitle .highlight {
          color: var(--green);
        }

        .inquiries-list {
          background: transparent;
          border: 1px solid var(--border);
          transition: all 0.2s ease;
        }

        .inquiries-list:hover {
          box-shadow: 0 0 20px var(--green-glow);
          border-color: rgba(82, 201, 125, 0.3);
        }

        .list-header {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr 120px;
          gap: 2rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
        }

        .list-header-cell {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .inquiry-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr 120px;
          gap: 2rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          align-items: start;
          transition: all 0.15s;
          text-decoration: none;
          color: inherit;
        }

        .inquiry-row:last-child {
          border-bottom: none;
        }

        .inquiry-row:hover {
          background: rgba(82, 201, 125, 0.05);
          cursor: pointer;
        }

        .inquiry-project {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .project-name {
          font-family: 'Syne', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text);
        }

        .project-tokens {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .token-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.65rem;
        }

        .token-label {
          font-family: 'JetBrains Mono', monospace;
          color: var(--text-muted);
          width: 28px;
        }

        .token-address {
          font-family: 'JetBrains Mono', monospace;
          color: var(--text-secondary);
          background: rgba(0, 0, 0, 0.3);
          padding: 0.15rem 0.4rem;
        }

        .inquiry-contact {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .contact-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: var(--text);
        }

        .contact-email {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--green);
        }

        .contact-telegram {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .migrate-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--green);
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .migrate-link:hover {
          text-shadow: 0 0 8px var(--green-glow);
        }

        .cell-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.6rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          border-radius: 3px;
        }

        .status-badge.status-pending {
          background: var(--orange-dim);
          color: var(--orange);
        }

        .status-badge.status-contacted {
          background: rgba(91, 155, 213, 0.12);
          color: var(--blue);
        }

        .status-badge.status-approved {
          background: var(--green-dim);
          color: var(--green);
        }

        .status-badge.status-rejected {
          background: rgba(239, 83, 80, 0.12);
          color: var(--red);
        }

        .empty-state {
          padding: 3rem 1.5rem;
          text-align: center;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--border);
          border-radius: 50%;
          font-size: 1.25rem;
          color: var(--text-muted);
        }

        .empty-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        @media (max-width: 1200px) {
          .list-header,
          .inquiry-row {
            grid-template-columns: 1.5fr 1fr 1fr 100px;
          }

          .list-header-cell:nth-child(3),
          .inquiry-row > *:nth-child(3) {
            display: none;
          }
        }

        /* Light mode overrides */
        html.light .inquiries-page,
        .light .inquiries-page {
          --bg: #f8faf9;
          --surface: #ffffff;
          --surface-elevated: rgba(255, 255, 255, 0.8);
          --border: rgba(45, 138, 82, 0.2);
          --border-subtle: rgba(45, 138, 82, 0.1);
          --text: #1a1a1a;
          --text-secondary: rgba(26, 26, 26, 0.7);
          --text-muted: rgba(26, 26, 26, 0.5);
          --primary: #2d8a52;
          --green: #2d8a52;
          --green-dim: rgba(45, 138, 82, 0.1);
          --green-glow: rgba(45, 138, 82, 0.15);
          --orange: #b8860b;
          --orange-dim: rgba(184, 134, 11, 0.1);
          --blue: #2563eb;
          --red: #dc2626;
        }

        html.light .inquiries-list,
        .light .inquiries-list {
          background: rgba(255, 255, 255, 0.7);
        }

        html.light .inquiries-list:hover,
        .light .inquiries-list:hover {
          box-shadow: 0 4px 20px rgba(45, 138, 82, 0.12);
        }

        html.light .list-header,
        .light .list-header {
          background: rgba(45, 138, 82, 0.05);
        }

        html.light .inquiry-row:hover,
        .light .inquiry-row:hover {
          background: rgba(45, 138, 82, 0.08);
        }

        html.light .token-address,
        .light .token-address {
          background: rgba(45, 138, 82, 0.08);
          color: #1a1a1a;
        }

        html.light .status-badge.status-pending,
        .light .status-badge.status-pending {
          background: rgba(184, 134, 11, 0.1);
          color: #b8860b;
        }

        html.light .status-badge.status-contacted,
        .light .status-badge.status-contacted {
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
        }

        html.light .status-badge.status-approved,
        .light .status-badge.status-approved {
          background: rgba(45, 138, 82, 0.1);
          color: #2d8a52;
        }

        html.light .status-badge.status-rejected,
        .light .status-badge.status-rejected {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
        }
      `}</style>

      <header className="page-header">
        <h1 className="page-title">Inquiries</h1>
        <p className="page-subtitle">
          {pendingCount > 0 ? (
            <>
              <span className="highlight">{pendingCount} pending</span> review
            </>
          ) : (
            `${inquiries.length} total inquiries`
          )}
        </p>
      </header>

      <div className="inquiries-list">
        {inquiries.length > 0 ? (
          <>
            <div className="list-header">
              <div className="list-header-cell">Project</div>
              <div className="list-header-cell">Contact</div>
              <div className="list-header-cell">Migrate.Fun</div>
              <div className="list-header-cell">Status</div>
              <div className="list-header-cell">Actions</div>
            </div>

            {inquiries.map((inquiry: any) => (
              <Link key={inquiry.id} href={`/admin/inquiries/${inquiry.id}`} className="inquiry-row">
                <div className="inquiry-project">
                  <span className="project-name">{inquiry.project_name}</span>
                  <div className="project-tokens">
                    <div className="token-row">
                      <span className="token-label">OLD</span>
                      <code className="token-address">
                        {inquiry.old_token_address.slice(0, 8)}...{inquiry.old_token_address.slice(-4)}
                      </code>
                    </div>
                    <div className="token-row">
                      <span className="token-label">NEW</span>
                      <code className="token-address">
                        {inquiry.new_token_address.slice(0, 8)}...{inquiry.new_token_address.slice(-4)}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="inquiry-contact">
                  <span className="contact-name">{inquiry.name}</span>
                  <span className="contact-email">{inquiry.email}</span>
                  {inquiry.telegram && (
                    <span className="contact-telegram">{inquiry.telegram}</span>
                  )}
                </div>

                <div>
                  {inquiry.migrate_fun_url ? (
                    <a
                      href={inquiry.migrate_fun_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="migrate-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Migration ↗
                    </a>
                  ) : (
                    <span className="cell-value" style={{ opacity: 0.5 }}>—</span>
                  )}
                </div>

                <div>
                  <span className={`status-badge status-${inquiry.status}`}>
                    {toTitleCase(inquiry.status)}
                  </span>
                </div>

                <InquiryActions inquiry={inquiry} />
              </Link>
            ))}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <p className="empty-text">No Inquiries Yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
