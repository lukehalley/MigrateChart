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
import ProblemSectionShared from "./sections/ProblemSectionShared";
import SolutionSectionShared from "./sections/SolutionSectionShared";
import ProjectsSectionShared from "./sections/ProjectsSectionShared";
import UnifiedMetricsShowcase from "./UnifiedMetricsShowcase";
import { useThemeContext } from "@/lib/ThemeContext";

export default function LandingPageNew() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useThemeContext();
  const isLight = theme === 'light';

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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

        /* Dark mode (default) */
        .landing {
          --primary: #52C97D;
          --primary-light: #7ADFA0;
          --primary-dark: #3FAA66;
          --primary-darker: #2D7A4A;
          --accent: #D4A853;
          --accent-light: #E8C17A;
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
          --glow-primary: rgba(82, 201, 125, 0.4);
          --glow-accent: rgba(212, 168, 83, 0.3);

          min-height: 100vh;
          min-height: 100dvh;
          background:
            /* Subtle grid overlay */
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(82, 201, 125, 0.03) 1px,
              rgba(82, 201, 125, 0.03) 2px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 1px,
              rgba(82, 201, 125, 0.02) 1px,
              rgba(82, 201, 125, 0.02) 2px
            ),
            /* Primary ambient glow - top center */
            radial-gradient(
              ellipse 100% 60% at 50% 0%,
              rgba(82, 201, 125, 0.12) 0%,
              rgba(82, 201, 125, 0.04) 30%,
              transparent 60%
            ),
            /* Secondary accent glow - bottom right */
            radial-gradient(
              ellipse 80% 50% at 85% 100%,
              rgba(212, 168, 83, 0.08) 0%,
              transparent 50%
            ),
            /* Tertiary subtle glow - left side */
            radial-gradient(
              ellipse 50% 80% at 0% 60%,
              rgba(82, 201, 125, 0.04) 0%,
              transparent 50%
            ),
            /* Fine noise texture */
            url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"),
            /* Deep black base */
            linear-gradient(180deg, #000000 0%, #020202 50%, #000000 100%);
          background-size: 2px 2px, 2px 2px, 100% 100%, 100% 100%, 100% 100%, 256px 256px, 100% 100%;
          background-attachment: fixed;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          overflow-x: hidden;
          position: relative;
        }

        /* Light mode overrides */
        .light .landing,
        html.light .landing {
          --primary: #2d8a52;
          --primary-light: #3da866;
          --primary-dark: #236b40;
          --primary-darker: #1a5030;
          --accent: #b8913d;
          --accent-light: #d4a853;
          --accent-dark: #9a7a32;
          --bg: #fdfbf7;
          --bg-subtle: #f8f6f1;
          --surface: #ffffff;
          --surface-elevated: #ffffff;
          --text: #1a1a1a;
          --text-secondary: rgba(26, 26, 26, 0.7);
          --text-muted: rgba(26, 26, 26, 0.5);
          --border: rgba(45, 138, 82, 0.2);
          --border-accent: rgba(184, 145, 61, 0.2);
          --glow-primary: rgba(45, 138, 82, 0.15);
          --glow-accent: rgba(184, 145, 61, 0.12);

          background:
            /* Subtle grid overlay - light */
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(45, 138, 82, 0.04) 1px,
              rgba(45, 138, 82, 0.04) 2px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 1px,
              rgba(45, 138, 82, 0.03) 1px,
              rgba(45, 138, 82, 0.03) 2px
            ),
            /* Primary ambient glow - top center */
            radial-gradient(
              ellipse 100% 60% at 50% 0%,
              rgba(45, 138, 82, 0.08) 0%,
              rgba(45, 138, 82, 0.03) 30%,
              transparent 60%
            ),
            /* Secondary accent glow - bottom right */
            radial-gradient(
              ellipse 80% 50% at 85% 100%,
              rgba(184, 145, 61, 0.06) 0%,
              transparent 50%
            ),
            /* Tertiary subtle glow - left side */
            radial-gradient(
              ellipse 50% 80% at 0% 60%,
              rgba(45, 138, 82, 0.04) 0%,
              transparent 50%
            ),
            /* Warm cream base */
            linear-gradient(180deg, #fdfbf7 0%, #f8f6f1 50%, #fdfbf7 100%);
        }

        /* Refined scanline effect - subtle and elegant */
        .landing.mounted::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.15) 2px,
              rgba(0, 0, 0, 0.15) 3px
            );
          background-size: 100% 3px;
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
        }

        /* Light mode: hide scanline effect */
        .light .landing.mounted::before,
        html.light .landing.mounted::before {
          opacity: 0;
        }

        /* Light mode: reduce film grain */
        .light .landing::after,
        html.light .landing::after {
          opacity: 0.02;
        }

        /* Light mode: hero ambient orbs */
        .light .hero-ambient-1,
        html.light .hero-ambient-1 {
          background: radial-gradient(circle, rgba(45, 138, 82, 0.1) 0%, transparent 70%);
        }

        .light .hero-ambient-2,
        html.light .hero-ambient-2 {
          background: radial-gradient(circle, rgba(184, 145, 61, 0.08) 0%, transparent 70%);
        }

        .light .hero-ambient-3,
        html.light .hero-ambient-3 {
          background: radial-gradient(circle, rgba(45, 138, 82, 0.06) 0%, transparent 70%);
        }

        /* Light mode: hero title */
        .light .hero-title,
        html.light .hero-title {
          background: linear-gradient(180deg,
            #1a1a1a 0%,
            rgba(26, 26, 26, 0.9) 40%,
            rgba(26, 26, 26, 0.75) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
        }

        /* Light mode: hero eyebrow */
        .light .hero-eyebrow,
        html.light .hero-eyebrow {
          background: rgba(45, 138, 82, 0.08);
          border: 1px solid rgba(45, 138, 82, 0.25);
        }

        /* Light mode: buttons */
        .light .btn-primary,
        html.light .btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: #ffffff;
          box-shadow:
            0 0 20px rgba(45, 138, 82, 0.25),
            0 4px 15px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .light .btn-primary:hover,
        html.light .btn-primary:hover {
          box-shadow:
            0 0 35px rgba(45, 138, 82, 0.35),
            0 8px 25px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .light .btn-secondary,
        html.light .btn-secondary {
          background: rgba(255, 255, 255, 0.8);
          color: var(--text);
          border: 1px solid rgba(45, 138, 82, 0.2);
          backdrop-filter: blur(10px);
        }

        .light .btn-secondary:hover,
        html.light .btn-secondary:hover {
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: 0 0 20px rgba(45, 138, 82, 0.15);
          background: rgba(45, 138, 82, 0.05);
        }

        /* Light mode: section divider */
        .light .section-divider,
        html.light .section-divider {
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(45, 138, 82, 0.2) 20%,
            rgba(184, 145, 61, 0.15) 50%,
            rgba(45, 138, 82, 0.2) 80%,
            transparent 100%
          );
        }

        /* Light mode: scroll down button */
        .light .scroll-down-button,
        html.light .scroll-down-button {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 15px rgba(45, 138, 82, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .light .scroll-down-button:hover,
        html.light .scroll-down-button:hover {
          box-shadow: 0 0 25px rgba(45, 138, 82, 0.35), 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        /* Light mode: section labels */
        .light .section-label,
        html.light .section-label {
          background: rgba(45, 138, 82, 0.08);
          border: 1px solid rgba(45, 138, 82, 0.2);
        }

        /* Light mode: feature cards */
        .light .feature-card,
        html.light .feature-card {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(45, 138, 82, 0.15);
        }

        .light .feature-card:hover,
        html.light .feature-card:hover {
          box-shadow: 0 20px 40px rgba(45, 138, 82, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
          border-color: rgba(45, 138, 82, 0.25);
        }

        .light .feature-icon,
        html.light .feature-icon {
          background: rgba(45, 138, 82, 0.1);
        }

        /* Light mode: project cards */
        .light .project-card,
        html.light .project-card {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(45, 138, 82, 0.15);
        }

        .light .project-card:hover,
        html.light .project-card:hover {
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.1);
        }

        .light .project-stats,
        html.light .project-stats {
          border-top: 1px solid rgba(26, 26, 26, 0.08);
          border-bottom: 1px solid rgba(26, 26, 26, 0.08);
        }

        /* Light mode: CTA section */
        .light .cta-section::before,
        html.light .cta-section::before {
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(45, 138, 82, 0.25) 30%,
            rgba(184, 145, 61, 0.15) 50%,
            rgba(45, 138, 82, 0.25) 70%,
            transparent 100%
          );
        }

        .light .cta-content,
        html.light .cta-content {
          background:
            radial-gradient(ellipse 100% 100% at 50% 0%, rgba(45, 138, 82, 0.06) 0%, transparent 50%),
            rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(45, 138, 82, 0.2);
          box-shadow:
            0 0 80px rgba(45, 138, 82, 0.06),
            0 25px 50px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        /* Light mode: CTA badge */
        .light .cta-badge,
        html.light .cta-badge {
          background: rgba(184, 145, 61, 0.1);
          border: 1px solid rgba(184, 145, 61, 0.25);
        }

        /* Light mode: CTA title */
        .light .cta-title,
        html.light .cta-title {
          background: linear-gradient(180deg,
            #1a1a1a 0%,
            rgba(26, 26, 26, 0.85) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Light mode: footer */
        .light .footer::before,
        html.light .footer::before {
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(26, 26, 26, 0.1) 50%,
            transparent 100%
          );
        }

        .light .footer-logo-svg,
        html.light .footer-logo-svg {
          filter: drop-shadow(0 0 4px rgba(45, 138, 82, 0.25));
        }

        .light .footer-logo-link:hover .footer-logo-svg,
        html.light .footer-logo-link:hover .footer-logo-svg {
          filter: drop-shadow(0 0 8px rgba(45, 138, 82, 0.4));
        }

        /* Section divider gradient */
        .section-divider {
          width: min(600px, 60%);
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(82, 201, 125, 0.15) 20%,
            rgba(212, 168, 83, 0.1) 50%,
            rgba(82, 201, 125, 0.15) 80%,
            transparent 100%
          );
          margin: 2rem auto;
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
          min-height: 100vh;
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
          max-width: 1100px;
          text-align: center;
          position: relative;
          z-index: 3;
        }

        /* Floating ambient orbs */
        .hero-ambient {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          opacity: 0;
          animation: floatIn 2s ease-out forwards;
        }

        .hero-ambient-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(82, 201, 125, 0.15) 0%, transparent 70%);
          top: 10%;
          left: -10%;
          animation-delay: 0.2s;
        }

        .hero-ambient-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(212, 168, 83, 0.1) 0%, transparent 70%);
          bottom: 10%;
          right: -5%;
          animation-delay: 0.4s;
        }

        .hero-ambient-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(82, 201, 125, 0.08) 0%, transparent 70%);
          top: 50%;
          right: 20%;
          animation-delay: 0.6s;
        }

        @keyframes floatIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 1.25rem;
          background: rgba(82, 201, 125, 0.08);
          border: 1px solid rgba(82, 201, 125, 0.2);
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--primary);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
        }

        .hero-eyebrow::before {
          content: '';
          width: 6px;
          height: 6px;
          background: var(--primary);
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 9vw, 6.5rem);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
          background: linear-gradient(180deg,
            #ffffff 0%,
            rgba(255, 255, 255, 0.9) 40%,
            rgba(255, 255, 255, 0.7) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 80px rgba(82, 201, 125, 0.15);
        }

        .hero-highlight {
          position: relative;
          display: inline-block;
          background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 50%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-highlight::after {
          content: '';
          position: absolute;
          bottom: 0.05em;
          left: 0;
          right: 0;
          height: 0.08em;
          background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
          opacity: 0.5;
          filter: blur(2px);
          border-radius: 2px;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2.2vw, 1.35rem);
          font-weight: 400;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.7;
          letter-spacing: 0.01em;
        }

        .hero-subtitle strong {
          color: var(--text);
          font-weight: 500;
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
          padding: 1rem 1.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
        }

        .btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn:hover::before {
          opacity: 1;
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
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: #000000;
          border: none;
          box-shadow:
            0 0 30px rgba(82, 201, 125, 0.4),
            0 4px 20px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          animation: pulse-cta 2s ease-in-out infinite;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
          box-shadow:
            0 0 50px rgba(82, 201, 125, 0.5),
            0 8px 30px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transform: translateY(-3px);
          animation-play-state: paused;
        }

        .btn-secondary {
          background: rgba(0, 0, 0, 0.5);
          color: var(--text);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: 0 0 25px rgba(82, 201, 125, 0.25);
          background: rgba(82, 201, 125, 0.05);
        }

        .btn.hero-cta-desktop {
          background: rgba(0, 0, 0, 0.7);
          color: var(--primary);
          border: 1px solid rgba(82, 201, 125, 0.4);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.15);
          backdrop-filter: blur(10px);
        }

        .btn.hero-cta-desktop:hover {
          background: rgba(82, 201, 125, 0.1);
          color: var(--primary-light);
          border-color: var(--primary);
          box-shadow: 0 0 35px rgba(82, 201, 125, 0.4);
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
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr;
            max-width: 500px;
          }
        }

        .feature-card {
          background: transparent;
          border: 1px solid var(--border);
          padding: 2rem;
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          min-width: 0;
          overflow: hidden;
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
          padding: 8rem 2rem 10rem;
          text-align: center;
          position: relative;
          background: transparent;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          max-width: 800px;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(82, 201, 125, 0.3) 30%,
            rgba(212, 168, 83, 0.2) 50%,
            rgba(82, 201, 125, 0.3) 70%,
            transparent 100%
          );
        }

        .cta-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 5rem 4rem;
          background:
            radial-gradient(ellipse 100% 100% at 50% 0%, rgba(82, 201, 125, 0.08) 0%, transparent 50%),
            rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(82, 201, 125, 0.15);
          border-radius: 24px;
          box-shadow:
            0 0 100px rgba(82, 201, 125, 0.08),
            0 25px 50px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
        }

        .cta-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(82, 201, 125, 0.5) 50%,
            transparent 100%
          );
        }

        .cta-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(212, 168, 83, 0.1);
          border: 1px solid rgba(212, 168, 83, 0.25);
          border-radius: 100px;
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }

        .cta-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.75rem);
          font-weight: 700;
          margin-bottom: 1.25rem;
          line-height: 1.15;
          background: linear-gradient(180deg,
            #ffffff 0%,
            rgba(255, 255, 255, 0.85) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-title-highlight {
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-description {
          font-size: 1.05rem;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
          line-height: 1.75;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Footer */
        .footer {
          padding: 3rem 2rem 4rem;
          text-align: center;
          background: transparent;
          position: relative;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          max-width: 600px;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 100%
          );
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
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .footer-logo-link:hover {
          transform: translateY(-2px);
        }

        .footer-logo-svg {
          width: 36px;
          height: 36px;
          color: var(--primary);
          filter: drop-shadow(0 0 6px rgba(82, 201, 125, 0.4));
          transition: all 0.3s ease;
        }

        .footer-logo-link:hover .footer-logo-svg {
          filter: drop-shadow(0 0 12px rgba(82, 201, 125, 0.6));
        }

        .footer-brand-text {
          font-family: 'Syne', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .footer-links {
          display: flex;
          gap: 2.5rem;
          flex-wrap: wrap;
        }

        .footer-link {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.2s ease;
          letter-spacing: 0.02em;
          position: relative;
        }

        .footer-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--primary);
          transition: width 0.2s ease;
        }

        .footer-link:hover {
          color: var(--primary);
        }

        .footer-link:hover::after {
          width: 100%;
        }

        .footer-copyright {
          font-size: 0.7rem;
          color: var(--text-muted);
          opacity: 0.6;
          letter-spacing: 0.05em;
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

        {/* Floating Ambient Orbs */}
        {mounted && (
          <>
            <div className="hero-ambient hero-ambient-1" />
            <div className="hero-ambient hero-ambient-2" />
            <div className="hero-ambient hero-ambient-3" />
          </>
        )}

        {/* Animated Glowing Orb */}
        {mounted && (
          <motion.div
            style={{
              position: "absolute",
              top: "25%",
              right: "15%",
              width: "350px",
              height: "350px",
              background:
                "radial-gradient(circle, rgba(82, 201, 125, 0.12) 0%, transparent 70%)",
              borderRadius: "50%",
              filter: "blur(50px)",
              pointerEvents: "none",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 8,
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
            Complete Price History.
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            One Continuous Chart Across <strong>All Pool Migrations</strong>. No More Missing Price Data.
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
      <div className="section-divider" />
      <SolutionSectionShared />
      <div className="section-divider" />

      {/* Unified Metrics Showcase - All features with diagrams */}
      <UnifiedMetricsShowcase />
      <div className="section-divider" />

      {/* Projects Showcase */}
      <ProjectsSectionShared />
      <div className="section-divider" />

      {/* Testimonials Section */}
      <TestimonialsCarousel />
      <div className="section-divider" />

      {/* Pricing Section */}
      <PricingSection />
      <div className="section-divider" />

      {/* CTA Section */}
      <section id="contact" className="cta-section">
        <motion.div
          className="cta-content"
          style={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cta-badge">Ready To Fix Your Charts?</div>
          <h2 className="cta-title">
            Don't Let Another Day Go By<br />
            With <span className="cta-title-highlight">Incomplete Charts</span>
          </h2>
          <p className="cta-description">
            Your Community Deserves To See The Full Story. Show Them The Complete Journey—From Launch To Today—And Prove Your Project's Staying Power.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Get Started
            <ArrowRight size={18} strokeWidth={2.5} />
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
            <span className="footer-brand-text">MIGRATE CHART</span>
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
          <div className="footer-copyright">
            {new Date().getFullYear()} Migrate Chart
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}
