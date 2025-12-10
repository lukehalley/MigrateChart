import { redirect } from 'next/navigation';
import { getUser, createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { toTitleCase } from '@/lib/utils';

async function getStats() {
  const supabase = await createClient();
  const [projectsRes, inquiriesRes, poolsRes] = await Promise.all([
    supabase.from('projects').select('id, is_active', { count: 'exact' }),
    supabase.from('inquiries').select('id, status', { count: 'exact' }),
    supabase.from('pools').select('id', { count: 'exact' })
  ]);

  const projects = projectsRes.data || [];
  const inquiries = inquiriesRes.data || [];

  return {
    totalProjects: projectsRes.count || 0,
    activeProjects: projects.filter(p => p.is_active).length,
    totalInquiries: inquiriesRes.count || 0,
    pendingInquiries: inquiries.filter(i => i.status === 'pending').length,
    totalPools: poolsRes.count || 0
  };
}

async function getRecentInquiries() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return data || [];
}

async function getRecentProjects() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return data || [];
}

export default async function AdminDashboardPage() {
  const user = await getUser();
  if (!user) redirect('/admin/login');

  const [stats, recentInquiries, recentProjects] = await Promise.all([
    getStats(),
    getRecentInquiries(),
    getRecentProjects()
  ]);

  return (
    <div className="dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .dashboard {
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

        /* Header */
        .dashboard-header {
          margin-bottom: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .header-content h1 {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-bottom: 0.35rem;
        }

        .header-content p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 1100px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
        }

        .stat-card {
          background: transparent;
          border: 1px solid var(--border);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          background: var(--surface-elevated);
          box-shadow: 0 0 20px var(--green-glow);
          border-color: rgba(82, 201, 125, 0.3);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .stat-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 2.25rem;
          font-weight: 500;
          color: var(--text);
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .stat-value.green { color: var(--green); }
        .stat-value.orange { color: var(--orange); }

        .stat-footer {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .stat-footer span {
          color: var(--text-secondary);
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
        }

        /* Section Card */
        .section-card {
          background: transparent;
          border: 1px solid var(--border);
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .section-card:hover {
          box-shadow: 0 0 20px var(--green-glow);
          border-color: rgba(82, 201, 125, 0.3);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text);
          letter-spacing: 0.01em;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .section-title:hover {
          color: var(--green);
        }

        .section-title-icon {
          color: var(--green);
          font-size: 0.85rem;
        }

        .section-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--text-muted);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          transition: color 0.15s ease;
        }

        .section-link:hover {
          color: var(--green);
          text-shadow: 0 0 8px var(--green-glow);
        }

        /* List Items */
        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          transition: all 0.15s ease;
          text-decoration: none;
          color: inherit;
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .list-item:hover {
          background: rgba(82, 201, 125, 0.05);
          cursor: pointer;
        }

        .list-item-content {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }

        .list-item-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .list-item-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .list-item-meta .divider {
          width: 3px;
          height: 3px;
          background: var(--text-muted);
          border-radius: 50%;
          opacity: 0.5;
        }

        /* Status Badges */
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
          flex-shrink: 0;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .badge-active {
          background: var(--green-dim);
          color: var(--green);
        }

        .badge-active .status-dot {
          background: var(--green);
        }

        .badge-inactive {
          background: var(--orange-dim);
          color: var(--orange);
        }

        .badge-inactive .status-dot {
          background: var(--orange);
        }

        .badge-pending {
          background: var(--orange-dim);
          color: var(--orange);
        }

        .badge-approved {
          background: var(--green-dim);
          color: var(--green);
        }

        .badge-contacted {
          background: rgba(91, 155, 213, 0.12);
          color: var(--blue);
        }

        .badge-rejected {
          background: rgba(239, 83, 80, 0.12);
          color: var(--red);
        }

        /* Empty State */
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
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Light mode overrides */
        html.light .dashboard,
        .light .dashboard {
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
        }

        html.light .stat-card,
        .light .stat-card {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(45, 138, 82, 0.15);
        }

        html.light .stat-card:hover,
        .light .stat-card:hover {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 20px rgba(45, 138, 82, 0.12);
        }

        html.light .section-card,
        .light .section-card {
          background: rgba(255, 255, 255, 0.7);
        }

        html.light .section-card:hover,
        .light .section-card:hover {
          box-shadow: 0 4px 20px rgba(45, 138, 82, 0.12);
        }

        html.light .section-header,
        .light .section-header {
          background: rgba(45, 138, 82, 0.05);
        }

        html.light .list-item:hover,
        .light .list-item:hover {
          background: rgba(45, 138, 82, 0.08);
        }

      `}</style>

      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p>Admin overview</p>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">◇</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-footer"><span>{stats.activeProjects}</span> active</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">◎</span>
            <span className="stat-label">Inquiries</span>
          </div>
          <div className={`stat-value ${stats.pendingInquiries > 0 ? 'orange' : ''}`}>
            {stats.pendingInquiries}
          </div>
          <div className="stat-footer"><span>{stats.totalInquiries}</span> total</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">⬡</span>
            <span className="stat-label">Pools</span>
          </div>
          <div className="stat-value">{stats.totalPools}</div>
          <div className="stat-footer">migration pools</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">●</span>
            <span className="stat-label">Live</span>
          </div>
          <div className="stat-value green">{stats.activeProjects}</div>
          <div className="stat-footer">on public site</div>
        </div>
      </div>

      <div className="content-grid">
        <div className="section-card">
          <div className="section-header">
            <Link href="/admin/inquiries" className="section-title">
              <span className="section-title-icon">◎</span>
              Recent Inquiries
            </Link>
            <Link href="/admin/inquiries" className="section-link">
              View All →
            </Link>
          </div>

          {recentInquiries.length > 0 ? (
            recentInquiries.map((inquiry: any) => (
              <Link key={inquiry.id} href={`/admin/inquiries/${inquiry.id}`} className="list-item">
                <div className="list-item-content">
                  <span className="list-item-title">{inquiry.project_name}</span>
                  <div className="list-item-meta">
                    <span>{inquiry.email}</span>
                    <span className="divider" />
                    <span>{new Date(inquiry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <span className={`status-badge badge-${inquiry.status}`}>
                  {toTitleCase(inquiry.status)}
                </span>
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <p className="empty-text">No Inquiries Yet</p>
            </div>
          )}
        </div>

        <div className="section-card">
          <div className="section-header">
            <Link href="/admin/projects" className="section-title">
              <span className="section-title-icon">◇</span>
              Recent Projects
            </Link>
            <Link href="/admin/projects" className="section-link">
              View All →
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            recentProjects.map((project: any) => (
              <Link key={project.id} href={`/admin/projects/${project.id}`} className="list-item">
                <div className="list-item-content">
                  <span className="list-item-title">{project.name}</span>
                  <div className="list-item-meta">
                    <span>/{project.slug}</span>
                    <span className="divider" />
                    <span>{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <span className={`status-badge ${project.is_active ? 'badge-active' : 'badge-inactive'}`}>
                  <span className="status-dot" />
                  {project.is_active ? 'Active' : 'Inactive'}
                </span>
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">◇</div>
              <p className="empty-text">No Projects Yet</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
