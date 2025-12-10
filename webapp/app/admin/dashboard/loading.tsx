import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="dashboard-loading">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600&family=JetBrains+Mono:wght@500&display=swap');

        .dashboard-loading {
          padding: 2.5rem 3rem;
          max-width: 1400px;
          font-family: 'JetBrains Mono', monospace;
        }

        .header-skeleton {
          margin-bottom: 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

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

        .stat-card-skeleton {
          border: 1px solid rgba(82, 201, 125, 0.15);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
        }

        .section-skeleton {
          border: 1px solid rgba(82, 201, 125, 0.15);
          overflow: hidden;
        }

        .section-header-skeleton {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(82, 201, 125, 0.15);
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-items-skeleton {
          display: flex;
          flex-direction: column;
        }

        .list-item-skeleton {
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid rgba(82, 201, 125, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-item-skeleton:last-child {
          border-bottom: none;
        }

        /* Light mode overrides */
        html.light .stat-card-skeleton,
        .light .stat-card-skeleton {
          border-color: rgba(45, 138, 82, 0.2);
        }

        html.light .section-skeleton,
        .light .section-skeleton {
          border-color: rgba(45, 138, 82, 0.2);
        }

        html.light .section-header-skeleton,
        .light .section-header-skeleton {
          background: rgba(45, 138, 82, 0.05);
          border-color: rgba(45, 138, 82, 0.2);
        }

        html.light .list-item-skeleton,
        .light .list-item-skeleton {
          border-color: rgba(45, 138, 82, 0.1);
        }
      `}</style>

      {/* Header */}
      <div className="header-skeleton">
        <div>
          <Skeleton className="h-8 w-48 mb-2 bg-primary/10" />
          <Skeleton className="h-4 w-64 bg-primary/10" />
        </div>
        <Skeleton className="h-8 w-32 bg-primary/10" />
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card-skeleton">
            <Skeleton className="h-4 w-24 bg-primary/10" />
            <Skeleton className="h-12 w-20 bg-primary/10" />
            <Skeleton className="h-3 w-16 bg-primary/10" />
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Inquiries */}
        <div className="section-skeleton">
          <div className="section-header-skeleton">
            <Skeleton className="h-5 w-40 bg-primary/10" />
            <Skeleton className="h-4 w-20 bg-primary/10" />
          </div>
          <div className="list-items-skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="list-item-skeleton">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-48 bg-primary/10" />
                  <Skeleton className="h-3 w-64 bg-primary/10" />
                </div>
                <Skeleton className="h-6 w-20 bg-primary/10" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="section-skeleton">
          <div className="section-header-skeleton">
            <Skeleton className="h-5 w-40 bg-primary/10" />
            <Skeleton className="h-4 w-20 bg-primary/10" />
          </div>
          <div className="list-items-skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="list-item-skeleton">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-40 bg-primary/10" />
                  <Skeleton className="h-3 w-56 bg-primary/10" />
                </div>
                <Skeleton className="h-6 w-16 bg-primary/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
