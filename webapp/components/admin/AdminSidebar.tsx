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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

        .admin-sidebar {
          --primary: #52C97D;
          --primary-dim: rgba(82, 201, 125, 0.1);
          --surface: rgba(6, 6, 6, 0.95);
          --border: rgba(82, 201, 125, 0.15);
          --text: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.4);
          --error: #ef4444;

          width: 260px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          font-family: 'JetBrains Mono', monospace;
          backdrop-filter: blur(10px);
          z-index: 50;
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          flex-direction: column;
          gap: 1rem;
          text-decoration: none;
          margin-bottom: 1rem;
        }

        .brand-logo {
          width: 50px;
          height: 50px;
          color: var(--primary);
          filter: drop-shadow(0 0 10px rgba(82, 201, 125, 0.5));
        }

        .brand-text {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text);
          letter-spacing: -0.01em;
          text-align: center;
        }

        .admin-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.4rem 0.75rem;
          background: var(--primary-dim);
          border: 1px solid rgba(82, 201, 125, 0.2);
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          font-weight: 600;
          color: var(--primary);
          letter-spacing: 0.1em;
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
          color: var(--primary);
          background: var(--primary-dim);
          border-left: 2px solid var(--primary);
          padding-left: calc(0.75rem - 2px);
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
          background: var(--primary);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(82, 201, 125, 0.6);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .signout-btn {
          width: 100%;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .signout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--error);
        }
      `}</style>

      <div className="sidebar-header">
        <Link href="/admin/dashboard" className="sidebar-brand">
          <svg
            className="brand-logo"
            viewBox="57 135 388 232"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Migrate Chart"
          >
            <path fill="currentColor" d="M135.423309,290.383972 C135.222244,292.157013 134.849457,293.929749 134.846222,295.703156 C134.806274,317.680511 134.820129,339.657990 134.820129,361.635437 C134.820129,363.432007 134.820129,365.228577 134.820129,367.319092 C108.857216,367.319092 83.287056,367.319092 57.352207,367.319092 C57.352207,341.704376 57.352207,316.037659 57.352207,289.918823 C83.140572,289.918823 108.899254,289.918823 135.063660,290.174957 C135.469360,290.431091 135.423309,290.383972 135.423309,290.383972z"/>
            <path fill="currentColor" d="M290.364258,290.336945 C290.217560,292.805908 289.947449,295.274719 289.943604,297.743896 C289.910065,319.238007 289.924225,340.732239 289.924225,362.226410 C289.924225,363.852112 289.924225,365.477844 289.924225,367.357361 C263.907196,367.357361 238.310226,367.357361 211.965073,367.357361 C211.965073,341.967926 211.965073,316.566803 211.812134,290.761261 C211.659195,290.356812 211.589157,290.420380 211.589157,290.420380 C213.204071,290.267975 214.818726,289.985748 216.433914,289.982635 C240.827682,289.935608 265.221497,289.925293 290.014832,290.152710 C290.414307,290.399109 290.364258,290.336945 290.364258,290.336945z"/>
            <path fill="currentColor" d="M445.290466,169.000153 C445.290466,183.634445 445.290466,197.768707 445.290466,212.257187 C419.463715,212.257187 393.941895,212.257187 368.161346,212.257187 C368.161346,186.667191 368.161346,161.109375 368.161346,135.257370 C393.655151,135.257370 419.195465,135.257370 445.290466,135.257370 C445.290466,146.339661 445.290466,157.419907 445.290466,169.000153z"/>
            <path fill="currentColor" d="M135.497192,290.448730 C135.251816,289.392853 134.742188,288.319763 134.740173,287.245728 C134.695267,263.252930 134.703552,239.260025 134.718506,215.267151 C134.719009,214.463577 134.893936,213.660110 135.013840,212.631134 C160.586761,212.631134 186.014481,212.631134 212.069183,212.631134 C212.069183,238.286774 212.069183,263.867767 211.829163,289.934570 C211.589157,290.420380 211.659195,290.356812 211.677277,290.329926 C186.528381,290.218719 161.361404,290.134399 135.808868,290.217041 C135.423309,290.383972 135.469360,290.431091 135.497192,290.448730z"/>
            <path fill="currentColor" d="M290.446106,290.423218 C290.253357,289.345978 289.834564,288.244904 289.832825,287.143219 C289.795258,263.321381 289.801147,239.499527 289.815552,215.677673 C289.816132,214.720184 289.982727,213.762787 290.090454,212.607132 C315.730774,212.607132 341.153046,212.607132 366.859802,212.607132 C366.859802,238.324921 366.859802,263.892670 366.859802,290.047455 C341.672607,290.047455 316.414978,290.047455 290.760803,290.192200 C290.364258,290.336945 290.414307,290.399109 290.446106,290.423218z"/>
            <path fill="currentColor" d="M445.290466,302.007385 C445.290466,323.963470 445.290466,345.421448 445.290466,367.245850 C419.480499,367.245850 393.966675,367.245850 368.177490,367.245850 C368.177490,341.667480 368.177490,316.112549 368.177490,290.260376 C393.644684,290.260376 419.183838,290.260376 445.290466,290.260376 C445.290466,293.993011 445.290466,297.751160 445.290466,302.007385z"/>
          </svg>
          <span className="brand-text">Admin Console</span>
        </Link>
        <span className="admin-badge">Authenticated</span>
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
