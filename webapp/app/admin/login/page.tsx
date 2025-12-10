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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

        .admin-login {
          --primary: #52C97D;
          --primary-dark: #3FAA66;
          --text: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.4);
          --border: rgba(82, 201, 125, 0.15);
          --error: #c45c5c;

          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .login-container {
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 10;
        }

        .login-card {
          background: rgba(6, 6, 6, 0.8);
          border: 2px solid var(--border);
          border-radius: 12px;
          padding: 3rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 40px rgba(82, 201, 125, 0.15);
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          width: 60px;
          height: 60px;
          color: var(--primary);
          filter: drop-shadow(0 0 12px rgba(82, 201, 125, 0.6));
        }

        .login-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .login-header h2 {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.75rem;
        }

        .login-header p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          letter-spacing: 0.02em;
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
          border-radius: 6px;
          padding: 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          color: var(--text);
          transition: all 0.3s ease;
        }

        .form-field input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.3), 0 0 0 2px rgba(82, 201, 125, 0.2);
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
          background: var(--primary);
          border: 2px solid var(--primary);
          border-radius: 6px;
          padding: 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          font-weight: 500;
          color: #000000;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(82, 201, 125, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          box-shadow: 0 0 50px rgba(82, 201, 125, 0.5);
          transform: translateY(-2px);
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
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
          text-align: center;
        }

        .login-footer a {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .login-footer a:hover {
          color: var(--primary);
        }

        /* Light mode overrides */
        html.light .admin-login,
        .light .admin-login {
          --primary: #2d8a52;
          --primary-dark: #247043;
          --text: #1a1a1a;
          --text-secondary: rgba(26, 26, 26, 0.7);
          --text-muted: rgba(26, 26, 26, 0.5);
          --border: rgba(45, 138, 82, 0.25);
          --error: #dc2626;
        }

        html.light .login-card,
        .light .login-card {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(45, 138, 82, 0.3);
          box-shadow: 0 4px 40px rgba(45, 138, 82, 0.15);
        }

        html.light .login-logo,
        .light .login-logo {
          color: #2d8a52;
          filter: drop-shadow(0 0 12px rgba(45, 138, 82, 0.4));
        }

        html.light .form-field input,
        .light .form-field input {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(45, 138, 82, 0.25);
          color: #1a1a1a;
        }

        html.light .form-field input:focus,
        .light .form-field input:focus {
          border-color: #2d8a52;
          box-shadow: 0 0 20px rgba(45, 138, 82, 0.2), 0 0 0 2px rgba(45, 138, 82, 0.15);
        }

        html.light .form-field input::placeholder,
        .light .form-field input::placeholder {
          color: rgba(26, 26, 26, 0.4);
        }

        html.light .submit-btn,
        .light .submit-btn {
          background: #2d8a52;
          border-color: #2d8a52;
          color: #ffffff;
          box-shadow: 0 4px 20px rgba(45, 138, 82, 0.25);
        }

        html.light .submit-btn:hover:not(:disabled),
        .light .submit-btn:hover:not(:disabled) {
          background: #247043;
          box-shadow: 0 6px 30px rgba(45, 138, 82, 0.35);
        }

        html.light .error-message,
        .light .error-message {
          background: rgba(220, 38, 38, 0.08);
          border-color: #dc2626;
          color: #dc2626;
        }

        html.light .login-footer,
        .light .login-footer {
          border-color: rgba(45, 138, 82, 0.2);
        }

        html.light .login-footer a,
        .light .login-footer a {
          color: rgba(26, 26, 26, 0.5);
        }

        html.light .login-footer a:hover,
        .light .login-footer a:hover {
          color: #2d8a52;
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <div className="logo-container">
            <svg
              className="login-logo"
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
          </div>

          <div className="login-header">
            <h2>Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
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

            <div className="login-footer">
              <a href="/">← Return To Public Site</a>
            </div>
          </form>
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
