'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ArrowUpRight } from 'lucide-react';
import { useThemeContext } from '@/lib/ThemeContext';

export default function ContactPage() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isLight = theme === 'light';
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
          telegram: formData.telegram ? `@${formData.telegram}` : null,
          projectName: formData.projectName,
          oldTokenAddress: formData.oldTokenAddress,
          newTokenAddress: formData.newTokenAddress,
          migrateFunUrl: formData.migrateFunUrl || null,
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
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap');

          .contact-page {
            --accent: #52C97D;
            --accent-glow: rgba(82, 201, 125, 0.4);
            --bg: #0a0a0a;
            --surface: #111111;
            --surface-elevated: #161616;
            --border: rgba(255, 255, 255, 0.06);
            --border-focus: rgba(82, 201, 125, 0.5);
            --text: #fafafa;
            --text-secondary: rgba(255, 255, 255, 0.6);
            --text-muted: rgba(255, 255, 255, 0.35);
            --error: #ff6b6b;

            min-height: 100vh;
            background: var(--bg);
            position: relative;
            overflow: hidden;
          }

          /* Light mode */
          html.light .contact-page,
          .light .contact-page {
            --bg: #f8faf9;
            --surface: #ffffff;
            --surface-elevated: #ffffff;
            --border: rgba(82, 201, 125, 0.15);
            --border-focus: rgba(82, 201, 125, 0.4);
            --text: #1a1a1a;
            --text-secondary: rgba(26, 26, 26, 0.7);
            --text-muted: rgba(26, 26, 26, 0.5);
            --accent-glow: rgba(82, 201, 125, 0.2);
          }

          .contact-page::before {
            content: '';
            position: fixed;
            inset: 0;
            background:
              radial-gradient(ellipse 100% 100% at 0% 0%, rgba(82, 201, 125, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 80% 80% at 100% 100%, rgba(82, 201, 125, 0.05) 0%, transparent 50%);
            pointer-events: none;
          }

          .contact-page::after {
            content: '';
            position: fixed;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
            opacity: 0.03;
            pointer-events: none;
          }

          .success-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            position: relative;
            z-index: 1;
          }

          .success-container {
            text-align: center;
            max-width: 480px;
          }

          .success-icon-wrap {
            width: 100px;
            height: 100px;
            margin: 0 auto 2.5rem;
            position: relative;
          }

          .success-icon-ring {
            position: absolute;
            inset: 0;
            border: 1px solid var(--accent);
            border-radius: 50%;
            animation: pulse-ring 2s ease-out infinite;
          }

          .success-icon-ring:nth-child(2) {
            animation-delay: 0.5s;
          }

          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.5); opacity: 0; }
          }

          .success-icon {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--accent) 0%, #3FAA66 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            box-shadow: 0 0 60px var(--accent-glow);
            position: relative;
          }

          .success-title {
            font-family: 'Outfit', sans-serif;
            font-size: 2.5rem;
            font-weight: 600;
            color: var(--text);
            margin-bottom: 1rem;
            letter-spacing: -0.03em;
          }

          .success-text {
            font-family: 'Space Mono', monospace;
            font-size: 0.875rem;
            color: var(--text-secondary);
            line-height: 1.8;
            margin-bottom: 3rem;
          }

          .success-back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            font-family: 'Space Mono', monospace;
            font-size: 0.8rem;
            color: var(--text);
            text-decoration: none;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .success-back-link:hover {
            border-color: var(--accent);
            box-shadow: 0 0 30px rgba(82, 201, 125, 0.15);
            transform: translateY(-2px);
          }
        `}</style>

        <div className="success-wrapper">
          <div className="success-container">
            <motion.div
              className="success-icon-wrap"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            >
              <div className="success-icon-ring" />
              <div className="success-icon-ring" />
              <div className="success-icon">
                <Check size={44} strokeWidth={3} />
              </div>
            </motion.div>
            <motion.h1
              className="success-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Request Submitted
            </motion.h1>
            <motion.p
              className="success-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              We&apos;ve received your listing request and will review it shortly.
              Expect to hear from us via email or Telegram within 24-48 hours.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/" className="success-back-link">
                <ArrowLeft size={16} />
                Return Home
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .contact-page {
          --accent: #52C97D;
          --accent-glow: rgba(82, 201, 125, 0.4);
          --bg: #0a0a0a;
          --surface: #111111;
          --surface-elevated: #161616;
          --border: rgba(255, 255, 255, 0.06);
          --border-focus: rgba(82, 201, 125, 0.5);
          --text: #fafafa;
          --text-secondary: rgba(255, 255, 255, 0.6);
          --text-muted: rgba(255, 255, 255, 0.35);
          --error: #ff6b6b;

          min-height: 100vh;
          background: var(--bg);
          position: relative;
          overflow-x: hidden;
        }

        /* Light mode */
        html.light .contact-page,
        .light .contact-page {
          --bg: #f8faf9;
          --surface: #ffffff;
          --surface-elevated: #ffffff;
          --border: rgba(82, 201, 125, 0.15);
          --border-focus: rgba(82, 201, 125, 0.4);
          --text: #1a1a1a;
          --text-secondary: rgba(26, 26, 26, 0.7);
          --text-muted: rgba(26, 26, 26, 0.5);
          --accent-glow: rgba(82, 201, 125, 0.2);
        }

        .contact-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 100% 100% at 0% 0%, rgba(82, 201, 125, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 80% at 100% 100%, rgba(82, 201, 125, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .contact-page::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }

        .page-container {
          min-height: 100vh;
          display: flex;
          position: relative;
          z-index: 1;
        }

        /* Left panel - hero/branding */
        .hero-panel {
          flex: 0 0 42%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          position: sticky;
          top: 0;
          height: 100vh;
          border-right: 1px solid var(--border);
        }

        .hero-top {
          display: flex;
          flex-direction: column;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 4rem;
          transition: color 0.2s;
          width: fit-content;
          background: none;
          border: none;
          cursor: pointer;
        }

        .back-link:hover {
          color: var(--accent);
        }

        .hero-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-right: 2rem;
        }

        .logo-mark {
          width: 56px;
          height: 56px;
          margin-bottom: 2.5rem;
          color: var(--accent);
          filter: drop-shadow(0 0 20px var(--accent-glow));
        }

        .hero-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2.5rem, 4vw, 3.5rem);
          font-weight: 600;
          color: var(--text);
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
        }

        .hero-title span {
          color: var(--accent);
        }

        .hero-desc {
          font-family: 'Space Mono', monospace;
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.8;
          max-width: 380px;
        }

        .hero-footer {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .feature-dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Right panel - form */
        .form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          min-height: 100vh;
        }

        .form-container {
          width: 100%;
          max-width: 520px;
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 0.5rem;
        }

        .form-subtitle {
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .error-banner {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.25);
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          border-radius: 8px;
          font-family: 'Space Mono', monospace;
          font-size: 0.8rem;
          color: var(--error);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          position: relative;
        }

        .form-field.full {
          grid-column: 1 / -1;
        }

        .field-label {
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .required-marker {
          color: var(--accent);
          font-size: 0.65rem;
        }

        .field-input {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 0.875rem 1rem;
          font-family: 'Space Mono', monospace;
          font-size: 0.85rem;
          color: var(--text);
          border-radius: 8px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .field-input:hover {
          border-color: rgba(255, 255, 255, 0.12);
        }

        .field-input:focus {
          outline: none;
          border-color: var(--border-focus);
          background: var(--surface-elevated);
          box-shadow: 0 0 0 4px rgba(82, 201, 125, 0.08);
        }

        .field-input::placeholder {
          color: var(--text-muted);
        }

        .input-with-prefix {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-prefix {
          position: absolute;
          left: 1rem;
          font-family: 'Space Mono', monospace;
          font-size: 0.85rem;
          color: var(--text-secondary);
          pointer-events: none;
          z-index: 1;
        }

        .input-with-prefix .field-input {
          padding-left: 1.875rem;
        }

        .field-input.address {
          font-size: 0.75rem;
          letter-spacing: 0.02em;
        }

        .field-hint {
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: -0.25rem;
        }

        .field-textarea {
          resize: vertical;
          min-height: 90px;
        }

        .submit-section {
          grid-column: 1 / -1;
          margin-top: 0.75rem;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--accent) 0%, #3FAA66 100%);
          border: none;
          padding: 1rem 2rem;
          font-family: 'Space Mono', monospace;
          font-size: 0.85rem;
          font-weight: 700;
          color: #000;
          cursor: pointer;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }

        .submit-btn:hover:not(:disabled)::before {
          transform: translateX(100%);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px var(--accent-glow);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-right-color: currentColor;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Mobile responsive */
        @media (max-width: 1024px) {
          .page-container {
            flex-direction: column;
          }

          .hero-panel {
            flex: none;
            position: relative;
            height: auto;
            min-height: auto;
            padding: 2rem;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }

          .back-link {
            margin-bottom: 2rem;
          }

          .hero-content {
            padding-right: 0;
          }

          .hero-footer {
            margin-top: 2rem;
          }

          .form-panel {
            min-height: auto;
            padding: 2rem;
          }
        }

        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .hero-title {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="page-container">
        <motion.div
          className="hero-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-top">
            <button onClick={() => router.back()} className="back-link">
              <ArrowLeft size={14} />
              Go Back
            </button>
          </div>

          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <svg className="logo-mark" viewBox="57 135 388 232" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M135.423309,290.383972 C135.222244,292.157013 134.849457,293.929749 134.846222,295.703156 C134.806274,317.680511 134.820129,339.657990 134.820129,361.635437 C134.820129,363.432007 134.820129,365.228577 134.820129,367.319092 C108.857216,367.319092 83.287056,367.319092 57.352207,367.319092 C57.352207,341.704376 57.352207,316.037659 57.352207,289.918823 C83.140572,289.918823 108.899254,289.918823 135.063660,290.174957 C135.469360,290.431091 135.423309,290.383972 135.423309,290.383972z"/>
                <path fill="currentColor" d="M290.364258,290.336945 C290.217560,292.805908 289.947449,295.274719 289.943604,297.743896 C289.910065,319.238007 289.924225,340.732239 289.924225,362.226410 C289.924225,363.852112 289.924225,365.477844 289.924225,367.357361 C263.907196,367.357361 238.310226,367.357361 211.965073,367.357361 C211.965073,341.967926 211.965073,316.566803 211.812134,290.761261 C211.659195,290.356812 211.589157,290.420380 211.589157,290.420380 C213.204071,290.267975 214.818726,289.985748 216.433914,289.982635 C240.827682,289.935608 265.221497,289.925293 290.014832,290.152710 C290.414307,290.399109 290.364258,290.336945 290.364258,290.336945z"/>
                <path fill="currentColor" d="M445.290466,169.000153 C445.290466,183.634445 445.290466,197.768707 445.290466,212.257187 C419.463715,212.257187 393.941895,212.257187 368.161346,212.257187 C368.161346,186.667191 368.161346,161.109375 368.161346,135.257370 C393.655151,135.257370 419.195465,135.257370 445.290466,135.257370 C445.290466,146.339661 445.290466,157.419907 445.290466,169.000153z"/>
                <path fill="currentColor" d="M135.497192,290.448730 C135.251816,289.392853 134.742188,288.319763 134.740173,287.245728 C134.695267,263.252930 134.703552,239.260025 134.718506,215.267151 C134.719009,214.463577 134.893936,213.660110 135.013840,212.631134 C160.586761,212.631134 186.014481,212.631134 212.069183,212.631134 C212.069183,238.286774 212.069183,263.867767 211.829163,289.934570 C211.589157,290.420380 211.659195,290.356812 211.677277,290.329926 C186.528381,290.218719 161.361404,290.134399 135.808868,290.217041 C135.423309,290.383972 135.469360,290.431091 135.497192,290.448730z"/>
                <path fill="currentColor" d="M290.446106,290.423218 C290.253357,289.345978 289.834564,288.244904 289.832825,287.143219 C289.795258,263.321381 289.801147,239.499527 289.815552,215.677673 C289.816132,214.720184 289.982727,213.762787 290.090454,212.607132 C315.730774,212.607132 341.153046,212.607132 366.859802,212.607132 C366.859802,238.324921 366.859802,263.892670 366.859802,290.047455 C341.672607,290.047455 316.414978,290.047455 290.760803,290.192200 C290.364258,290.336945 290.414307,290.399109 290.446106,290.423218z"/>
                <path fill="currentColor" d="M445.290466,302.007385 C445.290466,323.963470 445.290466,345.421448 445.290466,367.245850 C419.480499,367.245850 393.966675,367.245850 368.177490,367.245850 C368.177490,341.667480 368.177490,316.112549 368.177490,290.260376 C393.644684,290.260376 419.183838,290.260376 445.290466,290.260376 C445.290466,293.993011 445.290466,297.751160 445.290466,302.007385z"/>
              </svg>
            </motion.div>

            <motion.span
              className="hero-eyebrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Token Listing Request
            </motion.span>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Preserve Your
              <br />
              <span>Price History</span>
            </motion.h1>

            <motion.p
              className="hero-desc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Migrated your token? We unify your pre and post-migration charts
              into a single, continuous price history.
            </motion.p>
          </div>

          <motion.div
            className="hero-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-dot" />
                Unified chart across migrations
              </div>
              <div className="feature-item">
                <span className="feature-dot" />
                Historical data preserved
              </div>
              <div className="feature-item">
                <span className="feature-dot" />
                Comprehensive token listing
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="form-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Submit Your Project</h2>
              <p className="form-subtitle">Fields marked with * are required</p>
            </div>

            {status === 'error' && (
              <motion.div
                className="error-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errorMessage}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-field">
                <label className="field-label">
                  Name <span className="required-marker">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className="field-input"
                  placeholder="Your name"
                />
              </div>

              <div className="form-field">
                <label className="field-label">
                  Email <span className="required-marker">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="field-input"
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-field">
                <label className="field-label">Telegram</label>
                <div className="input-with-prefix">
                  <span className="input-prefix">@</span>
                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    onFocus={() => setFocusedField('telegram')}
                    onBlur={() => setFocusedField(null)}
                    className="field-input"
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  Project Name <span className="required-marker">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  onFocus={() => setFocusedField('projectName')}
                  onBlur={() => setFocusedField(null)}
                  className="field-input"
                  placeholder="Token name"
                />
              </div>

              <div className="form-field full">
                <label className="field-label">
                  Pre-Migration Address <span className="required-marker">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.oldTokenAddress}
                  onChange={(e) => setFormData({ ...formData, oldTokenAddress: e.target.value })}
                  onFocus={() => setFocusedField('oldTokenAddress')}
                  onBlur={() => setFocusedField(null)}
                  className="field-input address"
                  placeholder="Original token mint address"
                />
                <span className="field-hint">Your token address before migration</span>
              </div>

              <div className="form-field full">
                <label className="field-label">
                  Post-Migration Address
                </label>
                <input
                  type="text"
                  value={formData.newTokenAddress}
                  onChange={(e) => setFormData({ ...formData, newTokenAddress: e.target.value })}
                  onFocus={() => setFocusedField('newTokenAddress')}
                  onBlur={() => setFocusedField(null)}
                  className="field-input address"
                  placeholder="Current token mint address (optional)"
                />
                <span className="field-hint">Your token address after migration (leave blank if not migrated yet)</span>
              </div>

              <div className="form-field full">
                <label className="field-label">Migrate.fun Link</label>
                <input
                  type="url"
                  value={formData.migrateFunUrl}
                  onChange={(e) => setFormData({ ...formData, migrateFunUrl: e.target.value })}
                  onFocus={() => setFocusedField('migrateFunUrl')}
                  onBlur={() => setFocusedField(null)}
                  className="field-input address"
                  placeholder="https://migrate.fun/claim/..."
                />
              </div>

              <div className="form-field full">
                <label className="field-label">Additional Notes</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  className="field-input field-textarea"
                  placeholder="Pool addresses, migration dates, or other details..."
                />
              </div>

              <div className="submit-section">
                <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
                  {status === 'submitting' ? (
                    <>
                      <span className="spinner" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <ArrowUpRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
