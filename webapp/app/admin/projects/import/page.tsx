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
            border: 2px solid #52C97D;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2rem;
            color: #52C97D;
            box-shadow: 0 0 20px rgba(82, 201, 125, 0.3);
          }

          .success-title {
            font-family: 'Syne', sans-serif;
            font-size: 1.75rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
          }

          .success-text {
            font-family: 'JetBrains Mono', monospace;
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
          font-family: 'Syne', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .import-section {
          background: transparent;
          border: 1px solid #52C97D;
          margin-bottom: 1.5rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #52C97D;
        }

        .step-number {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid #52C97D;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: #52C97D;
        }

        .section-title {
          font-family: 'JetBrains Mono', monospace;
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
          background: transparent;
          border: 1px solid #52C97D;
          padding: 0.875rem 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
          color: var(--text-primary);
          transition: all 0.15s;
        }

        .url-input:focus {
          outline: none;
          border-color: #52C97D;
          box-shadow: 0 0 15px rgba(82, 201, 125, 0.3);
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
          background: transparent;
          border-color: #52C97D;
          color: #52C97D;
        }

        .btn-primary:hover:not(:disabled) {
          background: rgba(82, 201, 125, 0.1);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.4);
        }

        .btn-success {
          background: #52C97D;
          border-color: #52C97D;
          color: #000;
        }

        .btn-success:hover:not(:disabled) {
          box-shadow: 0 0 25px rgba(82, 201, 125, 0.5);
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
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .error-box {
          background: transparent;
          border: 1px solid #ff4444;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .error-icon {
          color: #ff4444;
          font-size: 1.25rem;
          line-height: 1;
        }

        .error-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: #ff4444;
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
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          color: var(--text-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .preview-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .preview-value.mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          background: transparent;
          border: 1px solid rgba(82, 201, 125, 0.3);
          padding: 0.4rem 0.6rem;
          word-break: break-all;
        }

        .token-card {
          background: transparent;
          border: 1px solid #52C97D;
          padding: 1.25rem;
        }

        .token-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .token-type {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.25rem 0.5rem;
          border: 1px solid;
        }

        .token-type.old {
          color: var(--text-muted);
          border-color: rgba(82, 201, 125, 0.3);
          background: transparent;
        }

        .token-type.new {
          color: #52C97D;
          border-color: #52C97D;
          background: rgba(82, 201, 125, 0.1);
        }

        .token-symbol {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
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
          background: transparent;
          border: 1px solid #52C97D;
          color: #52C97D;
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
          font-family: 'JetBrains Mono', monospace;
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
