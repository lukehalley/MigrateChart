export default function PreviewLoading() {
  return (
    <main className="preview-loading-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600&display=swap');

        .preview-loading-page {
          --primary: #D97706;
          --amber: #F59E0B;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(217, 119, 6, 0.06) 2px,
              rgba(217, 119, 6, 0.06) 3px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(217, 119, 6, 0.04) 2px,
              rgba(217, 119, 6, 0.04) 3px
            ),
            radial-gradient(
              ellipse 120% 80% at 50% 20%,
              rgba(217, 119, 6, 0.08) 0%,
              transparent 50%
            ),
            #000000;
          background-size: 3px 3px, 3px 3px, 100% 100%;
          background-attachment: fixed;
          position: relative;
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .preview-loading-page::before {
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
          animation: scanline 12s linear infinite;
        }

        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(7px); }
        }

        .preview-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(245, 158, 11, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 2px solid rgb(217, 119, 6);
          padding: 0.5rem;
        }

        .banner-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .preview-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #000;
        }

        .preview-text {
          color: #000;
          font-weight: 700;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
        }

        .loading-content {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .loading-spinner {
          font-size: 3rem;
          color: var(--amber);
          margin-bottom: 1rem;
          animation: pulse-amber 2s ease-in-out infinite;
        }

        @keyframes pulse-amber {
          0%, 100% {
            opacity: 1;
            filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.8));
          }
          50% {
            opacity: 0.6;
            filter: drop-shadow(0 0 20px rgba(245, 158, 11, 1));
          }
        }

        .loading-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          color: var(--amber);
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

      {/* Preview Mode Banner */}
      <div className="preview-banner">
        <div className="banner-content">
          <svg className="preview-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="preview-text">PREVIEW MODE</span>
        </div>
      </div>

      {/* Loading Content */}
      <div className="loading-content">
        <div className="loading-spinner">◈</div>
        <div className="loading-text">
          <span className="loading-dots">LOADING PREVIEW</span>
        </div>
      </div>
    </main>
  );
}
