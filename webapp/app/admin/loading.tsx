import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="admin-loading">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600&family=JetBrains+Mono:wght@500;600&display=swap');

        .admin-loading {
          --primary: #52C97D;
          min-height: 100vh;
          background:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(82, 201, 125, 0.06) 2px,
              rgba(82, 201, 125, 0.06) 3px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(82, 201, 125, 0.04) 2px,
              rgba(82, 201, 125, 0.04) 3px
            ),
            radial-gradient(
              ellipse 120% 80% at 50% 20%,
              rgba(82, 201, 125, 0.08) 0%,
              transparent 50%
            ),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"),
            #000000;
          background-size: 3px 3px, 3px 3px, 100% 100%, 200px 200px, 100% 100%;
          background-attachment: fixed;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          display: flex;
        }

        .admin-loading::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.3),
              rgba(0, 0, 0, 0.3) 1px,
              transparent 1px,
              transparent 3px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 6px,
              rgba(82, 201, 125, 0.03) 6px,
              rgba(82, 201, 125, 0.03) 7px
            );
          background-size: 100% 3px, 100% 7px;
          pointer-events: none;
          z-index: 1;
          animation: scanline 12s linear infinite;
        }

        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(7px); }
        }

        .sidebar-skeleton {
          width: 260px;
          flex-shrink: 0;
          background: rgba(0, 0, 0, 0.5);
          border-right: 1px solid rgba(82, 201, 125, 0.15);
          padding: 2rem 1.5rem;
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .content-skeleton {
          flex: 1;
          padding: 2.5rem 3rem;
          position: relative;
          z-index: 2;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-top: 2.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 1100px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .stat-skeleton {
          border: 1px solid rgba(82, 201, 125, 0.15);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
      `}</style>

      {/* Sidebar Skeleton */}
      <div className="sidebar-skeleton">
        <Skeleton className="h-12 w-32 bg-primary/10" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full bg-primary/10" />
          <Skeleton className="h-10 w-full bg-primary/10" />
          <Skeleton className="h-10 w-full bg-primary/10" />
          <Skeleton className="h-10 w-full bg-primary/10" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="content-skeleton">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2 bg-primary/10" />
          <Skeleton className="h-4 w-64 bg-primary/10" />
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-skeleton">
              <Skeleton className="h-4 w-24 bg-primary/10" />
              <Skeleton className="h-10 w-20 bg-primary/10" />
              <Skeleton className="h-3 w-16 bg-primary/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
