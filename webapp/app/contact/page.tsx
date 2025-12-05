'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: '',
    projectName: '',
    oldTokenAddress: '',
    newTokenAddress: '',
    migrateFunUrl: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          telegram: formData.telegram || null,
          project_name: formData.projectName,
          old_token_address: formData.oldTokenAddress,
          new_token_address: formData.newTokenAddress,
          migrate_fun_url: formData.migrateFunUrl || null,
          message: formData.message || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="contact-page">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

          .contact-page {
            --bg-primary: #0a0a0a;
            --bg-secondary: #111111;
            --text-primary: #f5f2eb;
            --text-muted: #6b6b6b;
            --accent: #d4a853;
            --accent-dim: rgba(212, 168, 83, 0.15);
            --border: #222222;
            --success: #7cb687;
            --error: #c45c5c;

            min-height: 100vh;
            background: var(--bg-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            font-family: 'JetBrains Mono', monospace;
          }

          .success-container {
            text-align: center;
            max-width: 420px;
          }

          .success-icon {
            width: 72px;
            height: 72px;
            border: 2px solid var(--success);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2rem;
            color: var(--success);
          }

          .success-title {
            font-family: 'Fraunces', serif;
            font-size: 2rem;
            color: var(--text-primary);
            margin-bottom: 0.75rem;
          }

          .success-text {
            font-size: 0.8rem;
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 2rem;
          }

          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: var(--accent);
            text-decoration: none;
            letter-spacing: 0.05em;
            transition: opacity 0.15s;
          }

          .back-link:hover {
            opacity: 0.7;
          }
        `}</style>

        <div className="success-container">
          <div className="success-icon">✓</div>
          <h1 className="success-title">Request Submitted</h1>
          <p className="success-text">
            Thank you for your interest. We've received your listing request
            and will review it shortly. You'll hear from us via email or Telegram.
          </p>
          <Link href="/" className="back-link">
            ← Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        .contact-page {
          --bg-primary: #0a0a0a;
          --bg-secondary: #111111;
          --text-primary: #f5f2eb;
          --text-secondary: #a8a8a8;
          --text-muted: #5a5a5a;
          --accent: #d4a853;
          --accent-dim: rgba(212, 168, 83, 0.12);
          --border: #1e1e1e;
          --success: #7cb687;
          --error: #c45c5c;

          min-height: 100vh;
          background: var(--bg-primary);
          font-family: 'JetBrains Mono', monospace;
          color: var(--text-primary);
          position: relative;
        }

        .contact-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 400px;
          background: radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-dim), transparent);
          pointer-events: none;
        }

        .contact-container {
          max-width: 640px;
          margin: 0 auto;
          padding: 4rem 2rem;
          position: relative;
        }

        .contact-nav {
          margin-bottom: 3rem;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: var(--text-muted);
          text-decoration: none;
          letter-spacing: 0.05em;
          transition: color 0.15s;
        }

        .nav-link:hover {
          color: var(--text-primary);
        }

        .contact-header {
          margin-bottom: 3rem;
        }

        .contact-title {
          font-family: 'Fraunces', serif;
          font-size: 3rem;
          font-weight: 400;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          line-height: 1.1;
        }

        .contact-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .error-box {
          background: rgba(196, 92, 92, 0.1);
          border: 1px solid rgba(196, 92, 92, 0.3);
          padding: 1rem 1.25rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .error-icon {
          color: var(--error);
          font-size: 1.25rem;
          line-height: 1;
        }

        .error-text {
          font-size: 0.75rem;
          color: var(--error);
          line-height: 1.5;
        }

        .form-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          margin-bottom: 1.5rem;
        }

        .section-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
        }

        .section-title {
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .section-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 500px) {
          .form-row { grid-template-columns: 1fr; }
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .field-label {
          font-size: 0.6rem;
          color: var(--text-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .field-label .required {
          color: var(--error);
        }

        .field-input {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          padding: 0.875rem 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          color: var(--text-primary);
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .field-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 1px var(--accent);
        }

        .field-input::placeholder {
          color: var(--text-muted);
        }

        .field-input.mono {
          font-size: 0.75rem;
        }

        .field-textarea {
          resize: none;
          min-height: 100px;
        }

        .field-hint {
          font-size: 0.6rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .submit-btn {
          width: 100%;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          background: #e5b964;
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
      `}</style>

      <div className="contact-container">
        <nav className="contact-nav">
          <Link href="/" className="nav-link">
            ← Back to home
          </Link>
        </nav>

        <header className="contact-header">
          <h1 className="contact-title">List Your Migration</h1>
          <p className="contact-subtitle">
            Get your token migration tracked on migrate-chart.fun.
            Fill out the form below and we'll be in touch.
          </p>
        </header>

        {status === 'error' && (
          <div className="error-box">
            <span className="error-icon">⚠</span>
            <span className="error-text">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="section-header">
              <span className="section-title">Contact Information</span>
            </div>
            <div className="section-body">
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="field-input"
                    placeholder="Your name"
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="field-input"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="form-field">
                <label className="field-label">Telegram Handle</label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  className="field-input"
                  placeholder="@yourusername"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <span className="section-title">Project Details</span>
            </div>
            <div className="section-body">
              <div className="form-field">
                <label className="field-label">
                  Project Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="field-input"
                  placeholder="My Token"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  Old Token Address <span className="required">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.oldTokenAddress}
                  onChange={(e) => setFormData({ ...formData, oldTokenAddress: e.target.value })}
                  className="field-input mono"
                  placeholder="Legacy token mint address"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  New Token Address <span className="required">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.newTokenAddress}
                  onChange={(e) => setFormData({ ...formData, newTokenAddress: e.target.value })}
                  className="field-input mono"
                  placeholder="New token mint address"
                />
              </div>

              <div className="form-field">
                <label className="field-label">Migrate.Fun URL</label>
                <input
                  type="url"
                  value={formData.migrateFunUrl}
                  onChange={(e) => setFormData({ ...formData, migrateFunUrl: e.target.value })}
                  className="field-input"
                  placeholder="https://migrate.fun/claim/..."
                />
                <span className="field-hint">
                  If you migrated using migrate.fun, paste your migration URL here
                </span>
              </div>

              <div className="form-field">
                <label className="field-label">Additional Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="field-input field-textarea"
                  placeholder="Any additional information about your migration..."
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
            {status === 'submitting' ? (
              <>
                <span className="spinner" />
                Submitting
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
