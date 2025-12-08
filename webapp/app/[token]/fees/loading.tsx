import { Skeleton } from '@/components/ui/skeleton';

export default function FeesLoading() {
  return (
    <main className="fees-loading-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600&display=swap');

        .fees-loading-page {
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
            #000000;
          background-size: 3px 3px, 3px 3px;
          background-attachment: fixed;
          position: relative;
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fees-loading-page::before {
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
            );
          background-size: 100% 3px;
          pointer-events: none;
          z-index: 1;
          /* animation: scanline 12s linear infinite; */
        }

        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(7px); }
        }

        .spinner {
          position: relative;
          z-index: 2;
          font-size: 2.5rem;
          color: var(--primary);
          animation: spin-ascii 1s steps(4) infinite;
          text-shadow: 0 0 10px rgba(82, 201, 125, 0.8);
        }

        .spinner::before {
          content: '◜';
        }

        @keyframes spin-ascii {
          0% { content: '◜'; }
          25% { content: '◝'; }
          50% { content: '◞'; }
          75% { content: '◟'; }
        }
      `}</style>

      <div className="spinner" />
    </main>
  );
}
