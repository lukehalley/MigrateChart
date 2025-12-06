import { redirect } from 'next/navigation';
import { getUser, createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import ProjectActions from '@/components/admin/ProjectActions';

async function getProjects() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      pools:pools(count)
    `)
    .order('created_at', { ascending: false });

  if (!projects) return [];

  // Fetch data status for each project
  const projectsWithStatus = await Promise.all(
    projects.map(async (project) => {
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

      return {
        ...project,
        hasHolders: !!holderSnapshots && holderSnapshots.length > 0,
        hasBurns,
        hasPools: (project.pools?.[0]?.count || 0) > 0,
      };
    })
  );

  return projectsWithStatus;
}

export default async function ProjectsPage() {
  const user = await getUser();
  if (!user) redirect('/admin/login');

  const projects = await getProjects();

  return (
    <div className="projects-page">
      <style>{`
        .projects-page {
          padding: 3rem;
          max-width: 1400px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.5rem;
        }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-primary {
          background: #52C97D;
          border-color: #52C97D;
          color: #0A0A0A;
        }

        .btn-primary:hover {
          background: #6DD490;
          border-color: #6DD490;
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
        }

        .btn-secondary {
          background: transparent;
          border-color: rgba(82, 201, 125, 0.15);
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          border-color: rgba(82, 201, 125, 0.3);
          color: var(--text-primary);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
        }

        .projects-table {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(82, 201, 125, 0.15);
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 140px 1fr 1fr 120px;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(82, 201, 125, 0.15);
          background: rgba(0, 0, 0, 0.2);
        }

        .table-header-cell {
          font-family: 'Syne', sans-serif;
          font-size: 0.6rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 140px 1fr 1fr 120px;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(82, 201, 125, 0.08);
          align-items: center;
          transition: all 0.15s;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row:hover {
          background: rgba(82, 201, 125, 0.05);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
        }

        .project-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .project-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-elevated);
          border: 1px solid rgba(82, 201, 125, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          overflow: hidden;
        }

        .project-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .project-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .project-name {
          font-family: 'Syne', sans-serif;
          font-size: 0.9rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .project-slug {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .cell-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

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

        .data-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .data-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .data-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .data-dot-active {
          background: #52C97D;
          box-shadow: 0 0 4px rgba(82, 201, 125, 0.5);
        }

        .data-dot-inactive {
          background: rgba(255, 255, 255, 0.1);
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
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
      `}</style>

      <header className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </header>

      <div className="projects-table">
        {projects.length > 0 ? (
          <>
            <div className="table-header">
              <div className="table-header-cell">Project</div>
              <div className="table-header-cell">Pools</div>
              <div className="table-header-cell">Data Status</div>
              <div className="table-header-cell">Created</div>
              <div className="table-header-cell">Status</div>
              <div className="table-header-cell">Actions</div>
            </div>

            {projects.map((project: any) => (
              <div key={project.id} className="table-row">
                <div className="project-info">
                  <div className="project-icon">
                    {project.icon_url ? (
                      <img src={project.icon_url} alt="" />
                    ) : (
                      '◇'
                    )}
                  </div>
                  <div className="project-details">
                    <span className="project-name">{project.name}</span>
                    <span className="project-slug">/{project.slug}</span>
                  </div>
                </div>

                <div className="cell-value">
                  {project.pools?.[0]?.count || 0} pool{(project.pools?.[0]?.count || 0) !== 1 ? 's' : ''}
                </div>

                <div className="data-status">
                  <div className="data-indicator" title={project.hasPools ? 'Chart data available' : 'No chart data'}>
                    <span className={`data-dot ${project.hasPools ? 'data-dot-active' : 'data-dot-inactive'}`} />
                    <span>Chart</span>
                  </div>
                  <div className="data-indicator" title={project.hasHolders ? 'Holder data available' : 'No holder data'}>
                    <span className={`data-dot ${project.hasHolders ? 'data-dot-active' : 'data-dot-inactive'}`} />
                    <span>Holders</span>
                  </div>
                  {project.burns_enabled && (
                    <div className="data-indicator" title={project.hasBurns ? 'Burns data available' : 'No burns data'}>
                      <span className={`data-dot ${project.hasBurns ? 'data-dot-active' : 'data-dot-inactive'}`} />
                      <span>Burns</span>
                    </div>
                  )}
                </div>

                <div className="cell-value">
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    timeZone: 'UTC'
                  })}
                </div>

                <div>
                  <span className={`status-badge ${project.is_active ? 'status-enabled' : 'status-disabled'}`}>
                    <span className="status-dot" />
                    {project.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <ProjectActions project={project} />
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">◇</div>
            <h3 className="empty-title">No Projects Yet</h3>
            <p className="empty-text">
              Import your first project from Migrate.Fun or create one manually.
            </p>
            <Link href="/admin/projects/import" className="btn btn-primary">
              ↓ Import from Migrate.Fun
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
