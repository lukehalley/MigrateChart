'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface MigrationPreview {
  migrationId: string;
  projectName: string;
  oldToken: {
    address: string;
    symbol: string;
    name: string;
  };
  newToken: {
    address: string;
    symbol: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  exchangeRate: number;
  totalMigrated: number;
  status: string;
}

export default function ImportProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [migrateFunUrl, setMigrateFunUrl] = useState('');
  const [preview, setPreview] = useState<MigrationPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      setMigrateFunUrl(url);
    }
  }, [searchParams]);

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const response = await fetch(`/api/migrate-fun/project/${encodeURIComponent(migrateFunUrl)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch migration data');
      }

      setPreview(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setError('');

    try {
      const response = await fetch('/api/migrate-fun/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ migrateFunUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import project');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/projects');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  if (success) {
    return (
      <div className="import-page">
        <style>{`
          .import-page {
            min-height: calc(100vh - 6rem);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem;
          }

          .success-container {
            text-align: center;
            max-width: 400px;
          }

          .success-icon {
            width: 64px;
            height: 64px;
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
            font-size: 1.75rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
          }

          .success-text {
            font-size: 0.8rem;
            color: var(--text-muted);
          }
        `}</style>

        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Import Successful</h2>
          <p className="success-text">Redirecting to projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="import-page">
      <style>{`
        .import-page {
          padding: 3rem;
          max-width: 900px;
        }

        .page-header {
          margin-bottom: 2.5rem;
        }

        .page-title {
          font-family: 'Fraunces', serif;
          font-size: 2.5rem;
          font-weight: 400;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .import-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          margin-bottom: 1.5rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .step-number {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-dim);
          border: 1px solid rgba(212, 168, 83, 0.3);
          font-size: 0.7rem;
          color: var(--accent);
        }

        .section-title {
          font-size: 0.8rem;
          color: var(--text-primary);
          letter-spacing: 0.03em;
        }

        .section-body {
          padding: 1.5rem;
        }

        .input-group {
          display: flex;
          gap: 0.75rem;
        }

        .url-input {
          flex: 1;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          padding: 0.875rem 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          color: var(--text-primary);
          transition: border-color 0.15s;
        }

        .url-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .url-input::placeholder {
          color: var(--text-muted);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .btn-primary {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--bg-primary);
        }

        .btn-primary:hover:not(:disabled) {
          background: #e5b964;
          border-color: #e5b964;
        }

        .btn-success {
          background: var(--success);
          border-color: var(--success);
          color: var(--bg-primary);
        }

        .btn-success:hover:not(:disabled) {
          background: #8dc798;
          border-color: #8dc798;
        }

        .btn:disabled {
          opacity: 0.5;
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

        .input-hint {
          margin-top: 0.75rem;
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .error-box {
          background: rgba(196, 92, 92, 0.1);
          border: 1px solid rgba(196, 92, 92, 0.3);
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
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

        .preview-grid {
          display: grid;
          gap: 1.5rem;
        }

        .preview-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 600px) {
          .preview-row { grid-template-columns: 1fr; }
        }

        .preview-item {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .preview-label {
          font-size: 0.6rem;
          color: var(--text-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .preview-value {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .preview-value.mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.4rem 0.6rem;
          word-break: break-all;
        }

        .token-card {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          padding: 1.25rem;
        }

        .token-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .token-type {
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.25rem 0.5rem;
          border: 1px solid;
        }

        .token-type.old {
          color: var(--text-muted);
          border-color: var(--border);
        }

        .token-type.new {
          color: var(--success);
          border-color: rgba(124, 182, 135, 0.3);
          background: rgba(124, 182, 135, 0.1);
        }

        .token-symbol {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .arrow-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0;
        }

        .arrow-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-dim);
          border: 1px solid rgba(212, 168, 83, 0.3);
          color: var(--accent);
          font-size: 1.25rem;
        }

        .import-footer {
          padding-top: 0.5rem;
        }

        .import-btn {
          width: 100%;
          padding: 1rem;
          justify-content: center;
        }

        .import-note {
          margin-top: 1rem;
          text-align: center;
          font-size: 0.65rem;
          color: var(--text-muted);
        }
      `}</style>

      <header className="page-header">
        <h1 className="page-title">Import from Migrate.Fun</h1>
        <p className="page-subtitle">
          Automatically fetch migration data and create a tracked project
        </p>
      </header>

      {error && (
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      <section className="import-section">
        <div className="section-header">
          <span className="step-number">1</span>
          <span className="section-title">Enter Migration URL</span>
        </div>
        <div className="section-body">
          <div className="input-group">
            <input
              type="url"
              value={migrateFunUrl}
              onChange={(e) => setMigrateFunUrl(e.target.value)}
              placeholder="https://migrate.fun/claim/..."
              className="url-input"
            />
            <button
              onClick={handleFetch}
              disabled={!migrateFunUrl || loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Fetching
                </>
              ) : (
                'Fetch Data'
              )}
            </button>
          </div>
          <p className="input-hint">
            Example: https://migrate.fun/claim/mig79
          </p>
        </div>
      </section>

      {preview && (
        <section className="import-section">
          <div className="section-header">
            <span className="step-number">2</span>
            <span className="section-title">Review Migration Data</span>
          </div>
          <div className="section-body">
            <div className="preview-grid">
              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Project Name</span>
                  <span className="preview-value">{preview.projectName}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Exchange Rate</span>
                  <span className="preview-value">1 : {preview.exchangeRate}</span>
                </div>
              </div>

              <div className="token-card">
                <div className="token-header">
                  <span className="token-type old">Legacy Token</span>
                  <span className="token-symbol">{preview.oldToken.symbol}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Name</span>
                  <span className="preview-value">{preview.oldToken.name}</span>
                </div>
                <div className="preview-item" style={{ marginTop: '0.75rem' }}>
                  <span className="preview-label">Address</span>
                  <span className="preview-value mono">{preview.oldToken.address}</span>
                </div>
              </div>

              <div className="arrow-divider">
                <span className="arrow-icon">↓</span>
              </div>

              <div className="token-card">
                <div className="token-header">
                  <span className="token-type new">New Token</span>
                  <span className="token-symbol">{preview.newToken.symbol}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Name</span>
                  <span className="preview-value">{preview.newToken.name}</span>
                </div>
                <div className="preview-item" style={{ marginTop: '0.75rem' }}>
                  <span className="preview-label">Address</span>
                  <span className="preview-value mono">{preview.newToken.address}</span>
                </div>
              </div>

              <div className="preview-row">
                <div className="preview-item">
                  <span className="preview-label">Start Date</span>
                  <span className="preview-value">
                    {new Date(preview.startDate).toLocaleDateString('en-US')}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">End Date</span>
                  <span className="preview-value">
                    {new Date(preview.endDate).toLocaleDateString('en-US')}
                  </span>
                </div>
              </div>

              <div className="import-footer">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="btn btn-success import-btn"
                >
                  {importing ? (
                    <>
                      <span className="spinner" />
                      Importing
                    </>
                  ) : (
                    <>✓ Import Project</>
                  )}
                </button>
                <p className="import-note">
                  This will create the project and migration pools in your database.
                  The project will be disabled by default for review.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
