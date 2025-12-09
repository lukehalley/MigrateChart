"use client";

import { useState, useEffect, ReactNode } from "react";
import LandingNav from "./LandingNav";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MobileSectionPageProps {
  children: ReactNode;
  nextPage?: {
    href: string;
    label: string;
  };
}

export default function MobileSectionPage({ children, nextPage }: MobileSectionPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`landing ${mounted ? 'mounted' : ''}`} suppressHydrationWarning>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

        .landing {
          --primary: #52C97D;
          --primary-dark: #3FAA66;
          --primary-darker: #2D7A4A;
          --accent: #D4A853;
          --accent-dark: #B8913D;
          --bg: #000000;
          --bg-subtle: #030303;
          --surface: #060606;
          --surface-elevated: #0a0a0a;
          --text: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.4);
          --border: rgba(82, 201, 125, 0.15);
          --border-accent: rgba(212, 168, 83, 0.15);

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
            radial-gradient(
              ellipse 100% 70% at 80% 80%,
              rgba(212, 168, 83, 0.05) 0%,
              transparent 50%
            ),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"),
            #000000;
          background-size: 3px 3px, 3px 3px, 100% 100%, 100% 100%, 200px 200px, 100% 100%;
          background-attachment: fixed;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          overflow-x: hidden;
          position: relative;
        }

        .landing.mounted::before {
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
          opacity: 1;
        }

        .landing::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.06;
          pointer-events: none;
          z-index: 9999;
        }

        .section-content {
          padding-top: 100px;
          position: relative;
          z-index: 2;
        }

        .features {
          padding: 4rem 2rem;
          position: relative;
          background: transparent;
        }

        .features + .features {
          padding-top: 2rem;
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-label {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(82, 201, 125, 0.1);
          border: 1px solid rgba(82, 201, 125, 0.2);
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--primary);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1rem;
        }

        .section-description {
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 640px) {
          .features-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
          }
        }

        .feature-card {
          background: transparent;
          border: 1px solid var(--border);
          padding: 2rem;
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(82, 201, 125, 0.15);
          border-color: rgba(82, 201, 125, 0.3);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(82, 201, 125, 0.1);
          border-radius: 8px;
          color: var(--primary);
          margin-bottom: 1.5rem;
          margin-left: auto;
          margin-right: auto;
        }

        .feature-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text);
        }

        .feature-description {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .projects {
          padding: 4rem 2rem;
          background: transparent;
          position: relative;
        }

        .projects-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          max-width: 900px;
          margin: 0 auto;
        }

        @media (min-width: 640px) {
          .projects-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
          }
        }

        .project-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .project-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          filter: brightness(1.1);
        }

        .project-logo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border);
        }

        .project-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          text-align: center;
        }

        .project-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          margin-top: 1.5rem;
          padding: 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 400;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .project-url {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
          margin-top: 0.75rem;
          letter-spacing: 0.01em;
        }

        .project-slug {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.75rem;
          text-align: center;
        }

        .cta-section {
          padding: 3rem 2rem;
          text-align: center;
          position: relative;
          background: transparent;
        }

        .cta-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 0 80px rgba(82, 201, 125, 0.1);
        }

        .cta-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.7;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.75rem;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
        }

        .btn-primary {
          background: var(--primary);
          color: #000000;
          border: 2px solid var(--primary);
          box-shadow: 0 0 30px rgba(82, 201, 125, 0.3);
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          box-shadow: 0 0 50px rgba(82, 201, 125, 0.5);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: transparent;
          color: var(--text);
          border: 2px solid var(--border);
        }

        .btn-secondary:hover {
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
        }

        .next-page-nav {
          padding: 2rem;
          text-align: center;
          background: transparent;
          border-top: 1px solid var(--border);
        }

        .next-page-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 0.75rem;
        }

        @media (min-width: 769px) {
          .section-content {
            padding-top: 120px;
            padding-bottom: 2rem;
          }

          .features {
            padding: 8rem 2rem;
          }

          .features + .features {
            padding-top: 4rem;
          }

          .cta-section {
            padding: 4rem 2rem;
          }

          .cta-content {
            padding: 3rem 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .features {
            padding: 3rem 1.5rem;
          }

          .features + .features {
            padding-top: 1.5rem;
          }

          .section-header {
            margin-bottom: 2rem;
          }

          .cta-section {
            padding: 2.5rem 1.5rem;
          }

          .cta-content {
            padding: 2rem 1.5rem;
          }

          .next-page-nav {
            padding: 1.5rem;
          }
        }
      `}</style>

      {/* Navigation */}
      {mounted && <LandingNav />}

      {/* Content */}
      <div className="section-content" style={{ paddingTop: '100px', position: 'relative', zIndex: 2 }}>
        {children}

        {/* Mobile Contact CTA */}
        <div className="cta-section">
          <div className="cta-content">
            <h3 className="cta-title">Ready to Show Your Complete Story?</h3>
            <p className="cta-description">
              Get your unified chart and prove your project's legitimacy.
            </p>
            <Link href="/contact" className="btn btn-primary">
              Contact Us
              <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Next Page Navigation */}
        {nextPage && (
          <div className="next-page-nav">
            <div className="next-page-label">Up Next</div>
            <Link href={nextPage.href} className="btn btn-secondary">
              {nextPage.label}
              <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
