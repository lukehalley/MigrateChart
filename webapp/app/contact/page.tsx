'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';

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
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

          .contact-page {
            --primary: #52C97D;
            --primary-dark: #3FAA66;
            --bg: #000000;
            --text: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.7);
            --text-muted: rgba(255, 255, 255, 0.4);
            --border: rgba(82, 201, 125, 0.15);

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
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            font-family: 'JetBrains Mono', monospace;
            color: var(--text);
            position: relative;
          }

          .contact-page::before {
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

          .success-container {
            text-align: center;
            max-width: 500px;
            position: relative;
            z-index: 2;
          }

          .success-icon {
            width: 80px;
            height: 80px;
            border: 2px solid var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            font-size: 2.5rem;
            color: var(--primary);
            box-shadow: 0 0 30px rgba(82, 201, 125, 0.3);
          }

          .success-title {
            font-family: 'Syne', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text);
            margin-bottom: 1rem;
          }

          .success-text {
            font-size: 1rem;
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 2.5rem;
          }

          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            font-size: 0.9rem;
            color: var(--text);
            text-decoration: none;
            border: 2px solid var(--border);
            border-radius: 6px;
            transition: all 0.3s ease;
          }

          .back-link:hover {
            border-color: var(--primary);
            color: var(--primary);
            box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
          }
        `}</style>

        <div className="success-container">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <div className="success-icon">
              <Check size={40} strokeWidth={3} />
            </div>
          </motion.div>
          <motion.h1
            className="success-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Request Submitted
          </motion.h1>
          <motion.p
            className="success-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Thank You For Your Interest. We've Received Your Listing Request
            And Will Review It Shortly. You'll Hear From Us Via Email Or Telegram.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/" className="back-link">
              <ArrowLeft size={18} />
              Return To Home
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

        .contact-page {
          --primary: #52C97D;
          --primary-dark: #3FAA66;
          --bg: #000000;
          --surface: #060606;
          --text: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.4);
          --border: rgba(82, 201, 125, 0.15);
          --error: #ef4444;

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
          font-family: 'JetBrains Mono', monospace;
          color: var(--text);
          position: relative;
        }

        .contact-page::before {
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

        .contact-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 8rem 2rem 4rem;
          position: relative;
          z-index: 2;
        }

        .contact-nav {
          margin-bottom: 4rem;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .contact-header {
          margin-bottom: 4rem;
          text-align: center;
        }

        .contact-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 700;
          color: var(--text);
          margin-bottom: 1rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .contact-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 500px;
          margin: 0 auto;
        }

        .error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 1.25rem 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          border-radius: 6px;
        }

        .error-icon {
          color: var(--error);
          font-size: 1.5rem;
          line-height: 1;
        }

        .error-text {
          font-size: 0.9rem;
          color: var(--error);
          line-height: 1.5;
        }

        .form-section {
          background: transparent;
          border: 1px solid var(--border);
          margin-bottom: 2rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .form-section:hover {
          border-color: rgba(82, 201, 125, 0.3);
        }

        .section-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .section-title {
          font-size: 0.7rem;
          color: var(--primary);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .section-body {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .field-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .field-label .required {
          color: var(--primary);
        }

        .field-input {
          background: rgba(6, 6, 6, 0.8);
          border: 1px solid var(--border);
          padding: 1rem 1.25rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          color: var(--text);
          transition: all 0.3s ease;
          border-radius: 6px;
        }

        .field-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
          background: rgba(6, 6, 6, 1);
        }

        .field-input::placeholder {
          color: var(--text-muted);
        }

        .field-input.mono {
          font-size: 0.8rem;
        }

        .field-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .field-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: -0.25rem;
        }

        .submit-btn {
          width: 100%;
          background: var(--primary);
          border: 2px solid var(--primary);
          padding: 1.25rem 2rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          font-weight: 600;
          color: #000000;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          border-radius: 6px;
          box-shadow: 0 0 30px rgba(82, 201, 125, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          box-shadow: 0 0 50px rgba(82, 201, 125, 0.5);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Logo Header */}
      <motion.header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '2rem',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'flex-start',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
          <svg
            style={{
              width: '60px',
              height: '60px',
              color: 'var(--primary)',
              filter: 'drop-shadow(0 0 12px rgba(82, 201, 125, 0.6)) drop-shadow(0 0 6px rgba(82, 201, 125, 0.4))',
              transition: 'all 0.3s ease',
            }}
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
        </Link>
      </motion.header>

      <div className="contact-container">
        <nav className="contact-nav">
          <Link href="/" className="nav-link">
            <ArrowLeft size={18} />
            Back To Home
          </Link>
        </nav>

        <header className="contact-header">
          <motion.h1
            className="contact-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Add Your Token
          </motion.h1>
          <motion.p
            className="contact-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Already Migrated? Get Your Complete Price History On Our Platform.
            Fill Out The Form Below And We'll Set You Up.
          </motion.p>
        </header>

        {status === 'error' && (
          <div className="error-box">
            <span className="error-icon">⚠</span>
            <span className="error-text">{errorMessage}</span>
          </div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="form-section">
            <div className="section-header">
              <span className="section-title">Your Contact Info</span>
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
              <span className="section-title">Migration Details</span>
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
                  Pre-Migration Token <span className="required">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.oldTokenAddress}
                  onChange={(e) => setFormData({ ...formData, oldTokenAddress: e.target.value })}
                  className="field-input mono"
                  placeholder="Old token mint address"
                />
                <span className="field-hint">
                  Your original token address before migration
                </span>
              </div>

              <div className="form-field">
                <label className="field-label">
                  Current Token Address <span className="required">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.newTokenAddress}
                  onChange={(e) => setFormData({ ...formData, newTokenAddress: e.target.value })}
                  className="field-input mono"
                  placeholder="Post-migration token mint"
                />
                <span className="field-hint">
                  Your token address after migration
                </span>
              </div>

              <div className="form-field">
                <label className="field-label">Migrate.Fun Link (Optional)</label>
                <input
                  type="url"
                  value={formData.migrateFunUrl}
                  onChange={(e) => setFormData({ ...formData, migrateFunUrl: e.target.value })}
                  className="field-input mono"
                  placeholder="https://migrate.fun/claim/..."
                />
                <span className="field-hint">
                  If you used migrate.fun, we can auto-import your migration data
                </span>
              </div>

              <div className="form-field">
                <label className="field-label">Additional Notes</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="field-input field-textarea"
                  placeholder="Pool addresses, migration dates, or any other context..."
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
            {status === 'submitting' ? (
              <>
                <span className="spinner" />
                Submitting Request
              </>
            ) : (
              'Submit Listing Request'
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
