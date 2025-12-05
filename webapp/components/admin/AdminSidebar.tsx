'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: '◈' },
  { href: '/admin/projects', label: 'Projects', icon: '◇' },
  { href: '/admin/inquiries', label: 'Inquiries', icon: '◎' },
  { href: '/admin/projects/import', label: 'Import', icon: '↓' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="admin-sidebar">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .admin-sidebar {
          --bg: #0a0a0a;
          --surface: #111111;
          --surface-elevated: #161616;
          --border: rgba(255, 255, 255, 0.06);
          --text: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.4);
          --green: #52C97D;
          --green-dim: rgba(82, 201, 125, 0.1);
          --red: #ef5350;

          width: 240px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          margin-bottom: 0.75rem;
        }

        .brand-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--green);
          font-size: 0.9rem;
          color: #000;
        }

        .brand-text {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text);
          letter-spacing: -0.01em;
        }

        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.6rem;
          background: var(--green-dim);
          border: 1px solid rgba(82, 201, 125, 0.15);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.55rem;
          font-weight: 500;
          color: var(--green);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }

        .nav-section {
          padding: 0 0.75rem;
          margin-bottom: 1.5rem;
        }

        .nav-section-title {
          padding: 0 0.75rem;
          margin-bottom: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.55rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.75rem;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 500;
          border-radius: 6px;
          transition: all 0.15s ease;
          position: relative;
          margin-bottom: 2px;
        }

        .nav-item:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-item.active {
          color: var(--green);
          background: var(--green-dim);
        }

        .nav-icon {
          font-size: 0.9rem;
          width: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.6;
        }

        .nav-item.active .nav-icon {
          opacity: 1;
        }

        .nav-label {
          flex: 1;
        }

        .external-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.75rem;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 500;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .external-link:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.03);
        }

        .external-icon {
          font-size: 0.75rem;
          opacity: 0.5;
        }

        .sidebar-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border);
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          color: var(--text-muted);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .signout-btn {
          width: 100%;
          padding: 0.6rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .signout-btn:hover {
          background: rgba(239, 83, 80, 0.08);
          border-color: rgba(239, 83, 80, 0.2);
          color: var(--red);
        }
      `}</style>

      <div className="sidebar-header">
        <Link href="/admin/dashboard" className="sidebar-brand">
          <span className="brand-icon">M</span>
          <span className="brand-text">migrate-chart</span>
        </Link>
        <span className="admin-badge">Admin Console</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Navigation</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">External</div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="external-link"
          >
            <span className="nav-icon">↗</span>
            <span className="nav-label">View Public Site</span>
            <span className="external-icon">↗</span>
          </a>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="status-row">
          <span className="status-dot" />
          System Online
        </div>
        <button
          onClick={handleSignOut}
          className="signout-btn"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
