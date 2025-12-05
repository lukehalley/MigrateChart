'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div className="admin-login">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');

        .admin-login {
          --bg-primary: #0a0a0a;
          --bg-secondary: #111111;
          --text-primary: #f5f2eb;
          --text-muted: #6b6b6b;
          --accent: #d4a853;
          --accent-dim: rgba(212, 168, 83, 0.15);
          --border: #222222;
          --error: #c45c5c;

          min-height: 100vh;
          background: var(--bg-primary);
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'JetBrains Mono', monospace;
        }

        @media (max-width: 768px) {
          .admin-login {
            grid-template-columns: 1fr;
          }
          .admin-login .brand-panel {
            display: none;
          }
        }

        .brand-panel {
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }

        .brand-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 20% 40%, var(--accent-dim), transparent),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.4;
          mix-blend-mode: overlay;
        }

        .brand-logo {
          position: relative;
          z-index: 1;
        }

        .brand-logo h1 {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--text-primary);
          letter-spacing: 0.05em;
        }

        .brand-tagline {
          position: relative;
          z-index: 1;
        }

        .brand-tagline p {
          font-family: 'Fraunces', serif;
          font-size: 3.5rem;
          font-weight: 400;
          color: var(--text-primary);
          line-height: 1.1;
          max-width: 400px;
        }

        .brand-tagline p span {
          color: var(--accent);
        }

        .brand-footer {
          position: relative;
          z-index: 1;
          font-size: 0.7rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .login-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
        }

        .login-container {
          width: 100%;
          max-width: 380px;
        }

        .login-header {
          margin-bottom: 3rem;
        }

        .login-header h2 {
          font-family: 'Fraunces', serif;
          font-size: 2rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .login-header p {
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-field label {
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .form-field input {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 0;
          padding: 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          color: var(--text-primary);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-field input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 1px var(--accent);
        }

        .form-field input::placeholder {
          color: var(--text-muted);
        }

        .error-message {
          background: rgba(196, 92, 92, 0.1);
          border: 1px solid var(--error);
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          color: var(--error);
        }

        .submit-btn {
          background: var(--accent);
          border: none;
          padding: 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--bg-primary);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .submit-btn:hover:not(:disabled) {
          background: #e5b964;
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-btn .btn-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          margin-top: 3rem;
          text-align: center;
        }

        .login-footer a {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-decoration: none;
          letter-spacing: 0.05em;
          transition: color 0.2s;
        }

        .login-footer a:hover {
          color: var(--accent);
        }
      `}</style>

      <div className="brand-panel">
        <div className="brand-logo">
          <h1>migrate-chart.fun</h1>
        </div>
        <div className="brand-tagline">
          <p>Track every <span>migration</span> with precision.</p>
        </div>
        <div className="brand-footer">
          Admin Console v1.0
        </div>
      </div>

      <div className="login-panel">
        <div className="login-container">
          <div className="login-header">
            <h2>Sign In</h2>
            <p>Access the administration panel</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@migrate-chart.fun"
                required
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              <span className="btn-text">
                {loading ? (
                  <>
                    <span className="spinner" />
                    Authenticating
                  </>
                ) : (
                  'Enter Console'
                )}
              </span>
            </button>
          </form>

          <div className="login-footer">
            <a href="/">← Return to public site</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
