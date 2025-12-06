import { Skeleton } from '@/components/ui/skeleton';

export default function TokenLoading() {
  return (
    <main className="token-loading-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600&display=swap');

        .token-loading-page {
          --primary: #52C97D;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
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
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"),
            #000000;
          background-size: 3px 3px, 3px 3px, 100% 100%, 200px 200px, 100% 100%;
          background-attachment: fixed;
          position: relative;
          font-family: 'JetBrains Mono', monospace;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        .token-loading-page::before {
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

        .loading-banner {
          position: relative;
          z-index: 2;
          background: linear-gradient(to right, #000000 0%, rgba(82, 201, 125, 0.1) 50%, #000000 100%);
          border-bottom: 2px solid rgba(82, 201, 125, 0.5);
          padding: 1.25rem 1.5rem;
          box-shadow: 0 4px 20px rgba(82, 201, 125, 0.25);
        }

        .loading-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .spinner-container {
          text-align: center;
        }

        .ascii-spinner {
          font-family: 'JetBrains Mono', monospace;
          font-size: 3rem;
          color: var(--primary);
          line-height: 1;
          margin-bottom: 1.5rem;
          animation: spin-frames 1.2s steps(8) infinite;
          text-shadow:
            0 0 10px rgba(82, 201, 125, 0.8),
            0 0 20px rgba(82, 201, 125, 0.4);
        }

        @keyframes spin-frames {
          0% { content: '|'; }
          12.5% { content: '/'; }
          25% { content: '—'; }
          37.5% { content: '\\'; }
          50% { content: '|'; }
          62.5% { content: '/'; }
          75% { content: '—'; }
          87.5% { content: '\\'; }
        }

        .ascii-spinner::before {
          content: '|';
          animation: spinner-rotate 1.2s steps(8) infinite;
        }

        @keyframes spinner-rotate {
          0% { content: '|'; }
          12.5% { content: '/'; }
          25% { content: '—'; }
          37.5% { content: '\\'; }
          50% { content: '|'; }
          62.5% { content: '/'; }
          75% { content: '—'; }
          87.5% { content: '\\'; }
        }

        .loading-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          color: var(--primary);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .loading-dots::after {
          content: '';
          animation: dots 1.5s steps(4, end) infinite;
        }

        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
      `}</style>

      {/* Skeleton Banner */}
      <div className="loading-banner">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-6 w-48 mx-auto bg-primary/10" />
        </div>
      </div>

      {/* Loading Spinner */}
      <div className="loading-content">
        <div className="spinner-container">
          <div className="ascii-spinner" />
          <div className="loading-text">
            <span className="loading-dots">LOADING CHART</span>
          </div>
        </div>
      </div>
    </main>
  );
}
