import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase-server';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // Allow login page without auth
  // The actual protection happens per-page

  return (
    <div className="admin-layout">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

        .admin-layout {
          --primary: #52C97D;
          --primary-dark: #3FAA66;
          --bg: #000000;
          --surface: #060606;
          --text: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.4);
          --border: rgba(82, 201, 125, 0.15);
          --error: #ef4444;
          --success: #52C97D;
          --warning: #D4A853;

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
          background-size: 3px 3px, 3px 3px, 100% 100%, 200px 200px, 100% 100%;
          background-attachment: fixed;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          position: relative;
        }

        .admin-layout::before {
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
      `}</style>
      {user ? (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 2 }}>
          <AdminSidebar />
          <main style={{ flex: 1, marginLeft: '260px' }}>
            {children}
          </main>
        </div>
      ) : (
        <div style={{ position: 'relative', zIndex: 2 }}>
          {children}
        </div>
      )}
    </div>
  );
}
