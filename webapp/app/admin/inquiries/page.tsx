import { redirect } from 'next/navigation';
import { getUser, createClient } from '@/lib/supabase-server';
import InquiryActions from '@/components/admin/InquiryActions';

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
        .inquiries-page {
          padding: 3rem;
          max-width: 1400px;
        }

        .page-header {
          margin-bottom: 2.5rem;
        }

        .page-title {
          font-family: 'Fraunces', serif;
          font-size: 2.5rem;
          font-weight: 400;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .page-subtitle .highlight {
          color: var(--accent);
        }

        .inquiries-list {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
        }

        .list-header {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr 120px;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
        }

        .list-header-cell {
          font-size: 0.6rem;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .inquiry-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr 120px;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          align-items: start;
          transition: background 0.1s;
        }

        .inquiry-row:last-child {
          border-bottom: none;
        }

        .inquiry-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .inquiry-project {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .project-name {
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 500;
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
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .contact-email {
          font-size: 0.7rem;
          color: var(--accent);
        }

        .contact-telegram {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .inquiry-message {
          font-size: 0.7rem;
          color: var(--text-muted);
          line-height: 1.5;
          max-width: 250px;
        }

        .inquiry-message.empty {
          font-style: italic;
          opacity: 0.5;
        }

        .migrate-link {
          font-size: 0.7rem;
          color: var(--accent);
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .migrate-link:hover {
          opacity: 0.7;
        }

        .cell-value {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.6rem;
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid;
        }

        .status-pending {
          color: var(--warning);
          border-color: rgba(212, 168, 83, 0.3);
          background: rgba(212, 168, 83, 0.1);
        }

        .status-contacted {
          color: #6ba3d4;
          border-color: rgba(107, 163, 212, 0.3);
          background: rgba(107, 163, 212, 0.1);
        }

        .status-approved {
          color: var(--success);
          border-color: rgba(124, 182, 135, 0.3);
          background: rgba(124, 182, 135, 0.1);
        }

        .status-rejected {
          color: var(--error);
          border-color: rgba(196, 92, 92, 0.3);
          background: rgba(196, 92, 92, 0.1);
        }

        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 3rem;
          color: var(--text-muted);
          opacity: 0.3;
          margin-bottom: 1rem;
        }

        .empty-title {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-text {
          font-size: 0.75rem;
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
              <div key={inquiry.id} className="inquiry-row">
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
                    >
                      View Migration ↗
                    </a>
                  ) : (
                    <span className="cell-value" style={{ opacity: 0.5 }}>—</span>
                  )}
                </div>

                <div>
                  <span className={`status-badge status-${inquiry.status}`}>
                    {inquiry.status}
                  </span>
                </div>

                <div>
                  <InquiryActions inquiry={inquiry} />
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <h3 className="empty-title">No Inquiries Yet</h3>
            <p className="empty-text">
              When projects submit listing requests, they'll appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
