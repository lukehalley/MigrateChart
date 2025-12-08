import { Skeleton } from '@/components/ui/skeleton';

export default function ContactLoading() {
  return (
    <div className="contact-loading">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .contact-loading {
          --accent: #52C97D;
          --accent-glow: rgba(82, 201, 125, 0.4);
          --bg: #0a0a0a;
          --surface: #111111;
          --border: rgba(255, 255, 255, 0.06);

          min-height: 100vh;
          background: var(--bg);
          position: relative;
          overflow: hidden;
        }

        .contact-loading::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 100% 100% at 0% 0%, rgba(82, 201, 125, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 80% at 100% 100%, rgba(82, 201, 125, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .contact-loading::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }

        .page-container {
          min-height: 100vh;
          display: flex;
          position: relative;
          z-index: 1;
        }

        .hero-panel {
          flex: 0 0 42%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          position: sticky;
          top: 0;
          height: 100vh;
          border-right: 1px solid var(--border);
        }

        .hero-top {
          display: flex;
          flex-direction: column;
        }

        .hero-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-right: 2rem;
        }

        .hero-footer {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          min-height: 100vh;
        }

        .form-container {
          width: 100%;
          max-width: 520px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .form-field.full {
          grid-column: 1 / -1;
        }

        @media (max-width: 1024px) {
          .page-container {
            flex-direction: column;
          }

          .hero-panel {
            flex: none;
            position: relative;
            height: auto;
            min-height: auto;
            padding: 2rem;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }

          .hero-content {
            padding-right: 0;
          }

          .hero-footer {
            margin-top: 2rem;
          }

          .form-panel {
            min-height: auto;
            padding: 2rem;
          }
        }

        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-container">
        {/* Hero Panel */}
        <div className="hero-panel">
          <div className="hero-top">
            {/* Back link */}
            <Skeleton className="h-4 w-28 mb-16 bg-white/5" />
          </div>

          <div className="hero-content">
            {/* Logo */}
            <Skeleton
              className="w-14 h-14 mb-10 bg-primary/15"
              style={{ filter: 'drop-shadow(0 0 20px rgba(82, 201, 125, 0.3))' }}
            />

            {/* Eyebrow */}
            <Skeleton className="h-3 w-40 mb-6 bg-primary/10" />

            {/* Title */}
            <Skeleton className="h-12 w-64 mb-3 bg-white/10" />
            <Skeleton className="h-12 w-48 mb-6 bg-primary/15" />

            {/* Description */}
            <Skeleton className="h-4 w-full max-w-[380px] mb-2 bg-white/5" />
            <Skeleton className="h-4 w-3/4 max-w-[300px] bg-white/5" />
          </div>

          <div className="hero-footer">
            {/* Feature list */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Skeleton className="w-1.5 h-1.5 rounded-full bg-primary/30" />
              <Skeleton className="h-3 w-48 bg-white/5" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Skeleton className="w-1.5 h-1.5 rounded-full bg-primary/30" />
              <Skeleton className="h-3 w-40 bg-white/5" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Skeleton className="w-1.5 h-1.5 rounded-full bg-primary/30" />
              <Skeleton className="h-3 w-44 bg-white/5" />
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="form-panel">
          <div className="form-container">
            {/* Form header */}
            <div style={{ marginBottom: '2rem' }}>
              <Skeleton className="h-7 w-48 mb-2 bg-white/10" />
              <Skeleton className="h-3 w-52 bg-white/5" />
            </div>

            {/* Form fields */}
            <div className="form-grid">
              {/* Name */}
              <div className="form-field">
                <Skeleton className="h-3 w-12 bg-white/5" />
                <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
              </div>

              {/* Email */}
              <div className="form-field">
                <Skeleton className="h-3 w-14 bg-white/5" />
                <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
              </div>

              {/* Telegram */}
              <div className="form-field">
                <Skeleton className="h-3 w-20 bg-white/5" />
                <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
              </div>

              {/* Project Name */}
              <div className="form-field">
                <Skeleton className="h-3 w-28 bg-white/5" />
                <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
              </div>

              {/* Pre-Migration Address */}
              <div className="form-field full">
                <Skeleton className="h-3 w-44 bg-white/5" />
                <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
                <Skeleton className="h-2.5 w-56 bg-white/5" />
              </div>

              {/* Post-Migration Address */}
              <div className="form-field full">
                <Skeleton className="h-3 w-48 bg-white/5" />
                <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
                <Skeleton className="h-2.5 w-52 bg-white/5" />
              </div>

              {/* Migrate.fun Link */}
              <div className="form-field full">
                <Skeleton className="h-3 w-32 bg-white/5" />
                <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
              </div>

              {/* Additional Notes */}
              <div className="form-field full">
                <Skeleton className="h-3 w-36 bg-white/5" />
                <Skeleton className="h-24 w-full rounded-lg bg-white/5" />
              </div>

              {/* Submit Button */}
              <div className="form-field full" style={{ marginTop: '0.75rem' }}>
                <Skeleton
                  className="h-12 w-full rounded-lg bg-primary/20"
                  style={{ boxShadow: '0 0 30px rgba(82, 201, 125, 0.15)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
