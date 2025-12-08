import { redirect, notFound } from 'next/navigation';
import { getUser, createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, TrendingUp, DollarSign, Users, Flame } from 'lucide-react';
import ProjectDetailActions from '@/components/admin/ProjectDetailActions';

async function getProject(id: string) {
  const supabase = await createClient();

  // Get project with pools count
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      pools:pools(count)
    `)
    .eq('id', id)
    .single();

  if (!project) return null;

  // Check for holder snapshots
  const { data: holderSnapshots } = await supabase
    .from('holder_snapshots')
    .select('timestamp')
    .eq('project_id', project.id)
    .limit(1);

  // Check for burn transactions (only if burns enabled)
  let hasBurns = false;
  if (project.burns_enabled) {
    const { data: burnTransactions } = await supabase
      .from('burn_transactions')
      .select('signature')
      .eq('project_id', project.id)
      .eq('success', true)
      .limit(1);
    hasBurns = !!burnTransactions && burnTransactions.length > 0;
  }

  // Check for fees data
  const { data: poolsWithFees } = await supabase
    .from('pools')
    .select('fee_rate')
    .eq('project_id', project.id)
    .gt('fee_rate', 0)
    .limit(1);

  // Get all pools for the project
  const { data: pools } = await supabase
    .from('pools')
    .select('*')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  return {
    ...project,
    hasHolders: !!holderSnapshots && holderSnapshots.length > 0,
    hasBurns,
    hasPools: (project.pools?.[0]?.count || 0) > 0,
    hasFees: !!poolsWithFees && poolsWithFees.length > 0,
    poolsList: pools || []
  };
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) redirect('/admin/login');

  const project = await getProject(params.id);
  if (!project) notFound();

  return (
    <div className="project-detail">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .project-detail {
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

          min-height: 100vh;
          padding: 2rem 3rem 4rem;
          max-width: 1400px;
          font-family: 'IBM Plex Mono', monospace;
          position: relative;
        }

        .project-detail::before {
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
          gap: 2rem;
        }

        .header-title-section {
          flex: 1;
          display: flex;
          align-items: flex-start;
          gap: 1.75rem;
        }

        .project-icon {
          width: 72px;
          height: 72px;
          border-radius: 12px;
          background: var(--surface);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          overflow: hidden;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .project-icon:hover {
          border-color: var(--accent);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.15);
        }

        .project-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .header-content {
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

        .header-slug {
          font-size: 0.9rem;
          color: var(--accent);
          margin-bottom: 0.75rem;
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

        /* Status Badge */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.6rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .status-enabled {
          color: #52C97D;
          border-color: rgba(82, 201, 125, 0.3);
          background: rgba(82, 201, 125, 0.1);
        }

        .status-enabled .status-dot {
          background: #52C97D;
          box-shadow: 0 0 4px rgba(82, 201, 125, 0.5);
        }

        .status-disabled {
          color: #888;
          border-color: rgba(136, 136, 136, 0.3);
          background: rgba(136, 136, 136, 0.1);
        }

        .status-disabled .status-dot {
          background: #888;
        }

        /* Data Status */
        .data-status-wrapper {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }

        .data-status-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .data-status {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .data-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: var(--text-muted);
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-subtle);
          transition: all 0.2s;
        }

        .data-indicator:hover {
          border-color: var(--border);
          background: rgba(0, 0, 0, 0.3);
        }

        .data-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .data-dot-active {
          background: #52C97D;
          box-shadow: 0 0 6px rgba(82, 201, 125, 0.6);
        }

        .data-dot-inactive {
          background: rgba(255, 255, 255, 0.15);
        }

        @media (max-width: 900px) {
          .data-status {
            gap: 1rem;
          }

          .data-indicator {
            padding: 0.6rem 0.8rem;
            font-size: 0.65rem;
          }
        }

        @media (max-width: 600px) {
          .data-status {
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .data-indicator {
            flex: 1;
            min-width: calc(50% - 0.375rem);
            justify-content: center;
          }
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
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        @media (max-width: 900px) {
          .info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }

        .info-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
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

        .field-value.accent {
          color: var(--accent);
        }

        .field-value.code {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
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

        /* Pools List */
        .pools-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pool-card {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-subtle);
          padding: 1.25rem;
          border-radius: 4px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1.5rem;
          align-items: center;
        }

        .pool-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.4rem 0.8rem;
          background: rgba(82, 201, 125, 0.1);
          border: 1px solid rgba(82, 201, 125, 0.2);
          border-radius: 3px;
        }

        .pool-address {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-secondary);
          word-break: break-all;
        }

        .pool-fee {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .empty-pools {
          padding: 2rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
      `}</style>

      <div className="detail-container">
        <div className="detail-header">
          <Link href="/admin/projects" className="back-link">
            <ArrowLeft size={14} />
            Back to Projects
          </Link>

          <div className="header-top">
            <div className="header-title-section">
              <div className="project-icon">
                {project.icon_url ? (
                  <img src={project.icon_url} alt="" />
                ) : (
                  '◇'
                )}
              </div>

              <div className="header-content">
                <div className="header-subtitle">Project Details</div>
                <h1 className="header-title">{project.name}</h1>
                <div className="header-slug">/{project.slug}</div>
                <div className="header-meta">
                  <span>ID: {project.id.slice(0, 8)}</span>
                  <span className="meta-divider" />
                  <span>Created {new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>

            <ProjectDetailActions project={project} />
          </div>

          <div className="data-status-wrapper">
            <div className="data-status-label">Data Availability</div>
            <div className="data-status">
              <div className="data-indicator" title={project.hasPools ? 'Chart data available' : 'No chart data'}>
                <span className={`data-dot ${project.hasPools ? 'data-dot-active' : 'data-dot-inactive'}`} />
                <TrendingUp size={14} />
              </div>
              <div className="data-indicator" title={project.hasFees ? 'Fees data available' : 'No fees data'}>
                <span className={`data-dot ${project.hasFees ? 'data-dot-active' : 'data-dot-inactive'}`} />
                <DollarSign size={14} />
              </div>
              <div className="data-indicator" title={project.hasHolders ? 'Holder data available' : 'No holder data'}>
                <span className={`data-dot ${project.hasHolders ? 'data-dot-active' : 'data-dot-inactive'}`} />
                <Users size={14} />
              </div>
              <div className="data-indicator" title={project.hasBurns ? 'Burns data available' : 'No burns data'}>
                <span className={`data-dot ${project.hasBurns ? 'data-dot-active' : 'data-dot-inactive'}`} />
                <Flame size={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="content-grid">
          <div className="section-card">
            <h2 className="section-title">Project Information</h2>
            <div className="info-grid">
              <div className="info-field">
                <span className="field-label">Token Address</span>
                <span className="field-value code">{project.token_mint_address || '—'}</span>
              </div>

              <div className="info-field">
                <span className="field-label">Total Pools</span>
                <span className="field-value accent">{project.pools?.[0]?.count || 0}</span>
              </div>

              {project.public_url && (
                <div className="info-field">
                  <span className="field-label">Public URL</span>
                  <a
                    href={project.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    {project.public_url}
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {project.poolsList.length > 0 && (
            <div className="section-card">
              <h2 className="section-title">Migration Pools ({project.poolsList.length})</h2>
              <div className="pools-list">
                {project.poolsList.map((pool: any, index: number) => (
                  <div key={pool.id} className="pool-card">
                    <span className="pool-label">Pool {index + 1}</span>
                    <span className="pool-address">{pool.pool_address}</span>
                    {pool.fee_rate > 0 && (
                      <span className="pool-fee">Fee: {pool.fee_rate}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
