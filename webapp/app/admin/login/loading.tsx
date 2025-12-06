export default function AdminLoginLoading() {
  return (
    <div className="login-loading">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600&display=swap');

        .login-loading {
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
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"),
            #000000;
          background-size: 3px 3px, 3px 3px, 100% 100%, 200px 200px;
          background-attachment: fixed;
          position: relative;
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-loading::before {
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

        .loading-spinner {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .spinner-icon {
          font-size: 2.5rem;
          color: var(--primary);
          animation: rotate-square 1.5s ease-in-out infinite;
          display: inline-block;
          text-shadow: 0 0 12px rgba(82, 201, 125, 0.8);
        }

        @keyframes rotate-square {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          margin-top: 1rem;
          font-size: 0.75rem;
          color: var(--primary);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.8;
        }
      `}</style>

      <div className="loading-spinner">
        <div className="spinner-icon">◆</div>
        <div className="loading-text">AUTHENTICATING</div>
      </div>
    </div>
  );
}
