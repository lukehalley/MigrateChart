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
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');

        .admin-layout {
          --bg-primary: #0a0a0a;
          --bg-secondary: #111111;
          --bg-elevated: #161616;
          --text-primary: #f5f2eb;
          --text-secondary: #a8a8a8;
          --text-muted: #5a5a5a;
          --accent: #d4a853;
          --accent-dim: rgba(212, 168, 83, 0.12);
          --success: #7cb687;
          --warning: #d4a853;
          --error: #c45c5c;
          --border: #1e1e1e;
          --border-subtle: #171717;

          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>
      {user ? (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <AdminSidebar />
          <main style={{ flex: 1, marginLeft: '260px' }}>
            {children}
          </main>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
