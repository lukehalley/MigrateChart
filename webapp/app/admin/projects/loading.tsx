import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsLoading() {
  return (
    <div className="projects-loading">
      <style>{`
        .projects-loading {
          padding: 3rem;
          max-width: 1400px;
        }

        .header-loading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.5rem;
        }

        .table-skeleton {
          border: 1px solid rgba(82, 201, 125, 0.15);
          overflow: hidden;
        }

        .table-header-skeleton {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr 80px;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(82, 201, 125, 0.15);
        }

        .table-row-skeleton {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr 80px;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(82, 201, 125, 0.05);
          align-items: center;
        }

        .table-row-skeleton:last-child {
          border-bottom: none;
        }

        @media (max-width: 900px) {
          .table-header-skeleton,
          .table-row-skeleton {
            grid-template-columns: 1fr;
          }
        }

        /* Light mode overrides */
        html.light .table-skeleton,
        .light .table-skeleton {
          border-color: rgba(45, 138, 82, 0.2);
        }

        html.light .table-header-skeleton,
        .light .table-header-skeleton {
          background: rgba(45, 138, 82, 0.05);
          border-color: rgba(45, 138, 82, 0.2);
        }

        html.light .table-row-skeleton,
        .light .table-row-skeleton {
          border-color: rgba(45, 138, 82, 0.1);
        }
      `}</style>

      {/* Header */}
      <div className="header-loading">
        <div>
          <Skeleton className="h-10 w-48 mb-2 bg-primary/10" />
          <Skeleton className="h-4 w-64 bg-primary/10" />
        </div>
        <Skeleton className="h-10 w-40 bg-primary/10" />
      </div>

      {/* Table */}
      <div className="table-skeleton">
        {/* Table Header */}
        <div className="table-header-skeleton">
          <Skeleton className="h-4 w-20 bg-primary/10" />
          <Skeleton className="h-4 w-16 bg-primary/10" />
          <Skeleton className="h-4 w-24 bg-primary/10" />
          <Skeleton className="h-4 w-20 bg-primary/10" />
          <Skeleton className="h-4 w-16 bg-primary/10" />
          <Skeleton className="h-4 w-16 bg-primary/10" />
        </div>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="table-row-skeleton">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg bg-primary/10" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32 bg-primary/10" />
                <Skeleton className="h-3 w-20 bg-primary/10" />
              </div>
            </div>
            <Skeleton className="h-4 w-12 bg-primary/10" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-5 rounded bg-primary/10" />
              <Skeleton className="h-5 w-5 rounded bg-primary/10" />
              <Skeleton className="h-5 w-5 rounded bg-primary/10" />
            </div>
            <Skeleton className="h-4 w-24 bg-primary/10" />
            <Skeleton className="h-6 w-16 bg-primary/10" />
            <Skeleton className="h-8 w-8 rounded bg-primary/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
