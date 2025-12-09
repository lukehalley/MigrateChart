"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Database,
  Zap,
  ChevronDown,
} from "lucide-react";
import { AnimatedCandlestickBackground } from "./AnimatedCandlestickBackground";
import PricingSection from "./PricingSection";
import TestimonialsCarousel from "./TestimonialsCarousel";
import BackToTop from "./BackToTop";
import LandingNav from "./LandingNav";
import MetricsTrackingSection from "./MetricsTrackingSection";
import ProblemSectionShared from "./sections/ProblemSectionShared";
import SolutionSectionShared from "./sections/SolutionSectionShared";
import ProjectsSectionShared from "./sections/ProjectsSectionShared";

export default function LandingPageNew() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for nav height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={`landing ${mounted ? 'mounted' : ''}`} suppressHydrationWarning>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

        .landing {
          --primary: #52C97D;
          --primary-dark: #3FAA66;
          --primary-darker: #2D7A4A;
          --accent: #D4A853;
          --accent-dark: #B8913D;
          --bg: #000000;
          --bg-subtle: #030303;
          --surface: #060606;
          --surface-elevated: #0a0a0a;
          --text: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.4);
          --border: rgba(82, 201, 125, 0.15);
          --border-accent: rgba(212, 168, 83, 0.15);

          min-height: 100vh; /* Fallback for browsers without dvh support */
          min-height: 100dvh;
          background:
            /* Terminal character grid - more visible */
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
            /* Radial accent gradients */
            radial-gradient(
              ellipse 120% 80% at 50% 20%,
              rgba(82, 201, 125, 0.08) 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse 100% 70% at 80% 80%,
              rgba(212, 168, 83, 0.05) 0%,
              transparent 50%
            ),
            /* Noise texture for terminal feel */
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"),
            /* Base color */
            #000000;
          background-size: 3px 3px, 3px 3px, 100% 100%, 100% 100%, 200px 200px, 100% 100%;
          background-attachment: fixed;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          overflow-x: hidden;
          position: relative;
        }

        /* CRT scanline effect - more visible */
        .landing.mounted::before {
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
          opacity: 1;
          /* animation: scanline 12s linear infinite; */
        }

        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(7px); }
        }

        @keyframes pulse-cta {
          0% {
            transform: scale(1);
            box-shadow: 0 0 30px rgba(82, 201, 125, 0.5), 0 0 0 0 rgba(82, 201, 125, 0.8);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 60px rgba(82, 201, 125, 1), 0 0 0 12px rgba(82, 201, 125, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 30px rgba(82, 201, 125, 0.5), 0 0 0 0 rgba(82, 201, 125, 0);
          }
        }

        /* Film grain overlay */
        .landing::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.06;
          pointer-events: none;
          z-index: 9999;
        }

        /* Hero Section */
        .hero {
          min-height: 100vh; /* Fallback */
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          max-width: 1000px;
          text-align: center;
          position: relative;
          z-index: 3;
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(3rem, 10vw, 7rem);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -0.04em;
          margin-bottom: 2rem;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.6) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-highlight {
          position: relative;
          display: inline-block;
        }

        .hero-highlight::after {
          content: '';
          position: absolute;
          bottom: 0.1em;
          left: 0;
          right: 0;
          height: 0.15em;
          background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
          opacity: 0.6;
          filter: blur(4px);
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2.5vw, 1.5rem);
          font-weight: 300;
          color: var(--text-secondary);
          margin-bottom: 3rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .hero-cta {
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }

          .hero-cta .btn {
            max-width: 280px;
            width: 100%;
            justify-content: center;
          }
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 2rem;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
        }

        .hero-cta .btn-primary {
          display: none;
        }

        .btn.hero-cta-desktop {
          display: inline-flex;
        }

        .btn.hero-cta-mobile {
          display: none;
        }

        .btn-primary {
          background: var(--primary);
          color: #000000;
          border: 2px solid var(--primary);
          box-shadow: 0 0 30px rgba(82, 201, 125, 0.4);
          animation: pulse-cta 1.5s ease-in-out infinite;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          box-shadow: 0 0 50px rgba(82, 201, 125, 0.5);
          transform: translateY(-2px);
          animation-play-state: paused;
        }

        .btn-secondary {
          background: transparent;
          color: var(--text);
          border: 2px solid var(--border);
        }

        .btn-secondary:hover {
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
        }

        .btn.hero-cta-desktop {
          background: #000000;
          color: var(--primary);
          border: 2px solid var(--primary);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
        }

        .btn.hero-cta-desktop:hover {
          background: #000000;
          color: var(--primary);
          box-shadow: 0 0 30px rgba(82, 201, 125, 0.6);
        }

        /* Scroll Down Indicator */
        .scroll-down-indicator {
          position: absolute;
          bottom: 2rem;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          z-index: 10;
          pointer-events: none;
        }

        .scroll-down-button {
          background: rgba(0, 0, 0, 0.7);
          border: 2px solid var(--primary);
          border-radius: 50%;
          color: var(--primary);
          cursor: pointer;
          transition: all 0.3s ease;
          pointer-events: auto;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.4);
          backdrop-filter: blur(8px);
        }

        .scroll-down-button:hover {
          box-shadow: 0 0 30px rgba(82, 201, 125, 0.8);
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .scroll-down-indicator {
            display: none;
          }
        }

        /* Features Section */
        .features {
          padding: 8rem 2rem;
          position: relative;
          background: transparent;
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .section-label {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(82, 201, 125, 0.1);
          border: 1px solid rgba(82, 201, 125, 0.2);
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--primary);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1rem;
        }

        .section-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: transparent;
          border: 1px solid var(--border);
          padding: 2rem;
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(82, 201, 125, 0.15);
          border-color: rgba(82, 201, 125, 0.3);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(82, 201, 125, 0.1);
          border-radius: 8px;
          color: var(--primary);
          margin-bottom: 1.5rem;
          margin-left: auto;
          margin-right: auto;
        }

        .feature-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text);
        }

        .feature-description {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* Projects Showcase */
        .projects {
          padding: 8rem 2rem;
          background: transparent;
          position: relative;
        }

        .projects-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .project-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .project-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          filter: brightness(1.1);
        }

        .project-logo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border);
        }

        .project-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          text-align: center;
        }

        .project-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          margin-top: 1.5rem;
          padding: 1rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 400;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .project-url {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
          margin-top: 0.75rem;
          letter-spacing: 0.01em;
        }

        .project-slug {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.75rem;
          text-align: center;
        }

        /* CTA Section */
        .cta-section {
          padding: 10rem 2rem;
          text-align: center;
          position: relative;
          background: transparent;
        }

        .cta-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 4rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 0 80px rgba(82, 201, 125, 0.1);
        }

        .cta-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
          line-height: 1.7;
        }

        /* Footer */
        .footer {
          padding: 4rem 2rem;
          text-align: center;
          background: transparent;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .footer-logo-link {
          display: inline-block;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .footer-logo-link:hover {
          transform: translateY(-2px);
        }

        .footer-logo-svg {
          width: 40px;
          height: 40px;
          color: var(--primary);
          filter: drop-shadow(0 0 8px rgba(82, 201, 125, 0.5));
          transition: all 0.3s ease;
        }

        .footer-logo-link:hover .footer-logo-svg {
          filter: drop-shadow(0 0 15px rgba(82, 201, 125, 0.7));
        }

        .footer-links {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .footer-link {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: var(--primary);
        }

        /* Responsive */
        .desktop-sections {
          display: block;
        }

        @media (max-width: 768px) {
          .hero-cta .btn-primary {
            display: inline-flex;
          }

          .btn.hero-cta-desktop {
            display: none;
          }

          .btn.hero-cta-mobile {
            display: inline-flex;
          }

          .hero {
            /* Fallback, then dvh override */
            min-height: 100vh;
            min-height: 100dvh;
            /* Account for fixed navbar height (~72px) */
            padding-top: 80px;
            padding-bottom: 2rem;
            padding-left: 1.5rem;
            padding-right: 1.5rem;
            /* Ensure content is centered in the remaining space */
            justify-content: center;
          }

          /* Hide sections and footer on mobile - they're available as separate pages */
          .desktop-sections {
            display: none;
          }

          .footer {
            display: none;
          }

          .features, .projects, .cta-section {
            padding: 4rem 1.5rem;
          }

          .cta-content {
            padding: 3rem 2rem;
          }

          .footer-content {
            flex-direction: column;
            text-align: center;
          }

          .footer-links {
            justify-content: center;
          }
        }
      `}</style>

      {/* Navigation */}
      {mounted && <LandingNav />}

      {/* Hero Section */}
      <section className="hero" suppressHydrationWarning>
        {/* Animated Candlestick Chart Background */}
        {mounted && <AnimatedCandlestickBackground />}

        {/* Glowing Orb Effect */}
        {mounted && (
          <motion.div
            style={{
              position: "absolute",
              top: "30%",
              right: "10%",
              width: "400px",
              height: "400px",
              background:
                "radial-gradient(circle, rgba(82, 201, 125, 0.1) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Complete Price History.{" "}
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            One Continuous Chart Across All Pool Migrations. No More Missing Price Data.
          </motion.p>

          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            suppressHydrationWarning
          >
            <Link href="/zera" prefetch={true} className="btn btn-primary">
              Launch App
              <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
            {mounted && (
              <Link href="/why" className="btn btn-secondary hero-cta-mobile">
                Learn More
                <ArrowRight size={20} strokeWidth={2.5} />
              </Link>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll Down Indicator - Desktop Only */}
        {mounted && (
          <div className="scroll-down-indicator">
            <motion.button
              className="scroll-down-button"
              onClick={() => scrollToSection("problem")}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                y: [0, 10, 0]
              }}
              transition={{
                opacity: { duration: 1, delay: 1 },
                y: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 1 }
              }}
            >
              <ChevronDown size={32} strokeWidth={2} />
            </motion.button>
          </div>
        )}
      </section>

      {/* Desktop-only sections - on mobile, these are separate pages */}
      <div className="desktop-sections">
      <ProblemSectionShared />
      <SolutionSectionShared />

      {/* Metrics Tracking Section */}
      <MetricsTrackingSection />

      {/* Projects Showcase */}
      <ProjectsSectionShared />


      {/* Testimonials Section */}
      <TestimonialsCarousel />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section id="contact" className="cta-section">
        <motion.div
          className="cta-content"
          style={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="cta-title">Don't Let Another Day Go By With Incomplete Charts</h2>
          <p className="cta-description">
            Your community deserves to see the full story. Every day with a reset chart is another day potential investors question your legitimacy. Show them the complete journey—from launch to today—and prove your project's staying power.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Contact Us
            <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
        </motion.div>
      </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <Link href="/" className="footer-logo-link">
            <svg
              className="footer-logo-svg"
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
          <div className="footer-links">
            <Link href="/" className="footer-link">
              Home
            </Link>
            <Link href="/pricing" className="footer-link">
              Pricing
            </Link>
            <Link href="/contact" className="footer-link">
              Contact
            </Link>
            <a
              href="https://x.com/Trenchooooor"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}
