"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Database,
  Zap,
  ChevronRight,
} from "lucide-react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import { AnimatedCandlestickBackground } from "./AnimatedCandlestickBackground";

interface ProjectListItem {
  slug: string;
  name: string;
  primaryColor: string;
  logoUrl: string;
}

export default function LandingPageNew() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="landing" suppressHydrationWarning>
      {/* Particles Background - Fixed throughout scroll */}
      {mounted && (
        <div suppressHydrationWarning>
          <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
            background: {
              color: {
                value: "transparent",
              },
            },
            fpsLimit: 60,
            particles: {
              number: {
                value: 60,
                density: {
                  enable: true,
                  width: 1920,
                  height: 1080,
                },
              },
              color: {
                value: ["#52C97D", "#3FAA66", "#2D7A4A"],
              },
              shape: {
                type: "circle",
              },
              opacity: {
                value: { min: 0.1, max: 0.4 },
                animation: {
                  enable: true,
                  speed: 0.5,
                  sync: false,
                },
              },
              size: {
                value: { min: 1, max: 3 },
              },
              links: {
                enable: true,
                distance: 150,
                color: "#52C97D",
                opacity: 0.15,
                width: 1,
              },
              move: {
                enable: true,
                speed: 0.5,
                direction: "top",
                random: true,
                straight: false,
                outModes: {
                  default: "out",
                },
              },
            },
            interactivity: {
              detectsOn: "window",
              events: {
                onHover: {
                  enable: true,
                  mode: "grab",
                },
                resize: {
                  enable: true,
                  delay: 0.5,
                },
              },
              modes: {
                grab: {
                  distance: 200,
                  links: {
                    opacity: 0.5,
                    color: "#52C97D",
                  },
                },
              },
            },
            detectRetina: true,
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
          />
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

        .landing {
          --primary: #52C97D;
          --primary-dark: #3FAA66;
          --primary-darker: #2D7A4A;
          --accent: #D4A853;
          --bg: #000000;
          --surface: #0a0a0a;
          --surface-elevated: #111111;
          --text: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.4);
          --border: rgba(82, 201, 125, 0.15);

          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          overflow-x: hidden;
          position: relative;
        }

        /* Animated Grid Background */
        .landing::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(82, 201, 125, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(82, 201, 125, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 100% 100% at 50% 50%, black 0%, transparent 70%);
          pointer-events: none;
          animation: gridScroll 40s linear infinite;
        }

        @keyframes gridScroll {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        /* Hero Section */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .hero-content {
          max-width: 1000px;
          text-align: center;
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
        }

        .btn-primary {
          background: var(--primary);
          color: #000000;
          border: 2px solid var(--primary);
          box-shadow: 0 0 30px rgba(82, 201, 125, 0.3);
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          box-shadow: 0 0 50px rgba(82, 201, 125, 0.5);
          transform: translateY(-2px);
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

        /* Features Section */
        .features {
          padding: 8rem 2rem;
          position: relative;
          z-index: 1;
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
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 2rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          position: relative;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 8px;
          padding: 1px;
          background: linear-gradient(135deg, var(--primary), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(82, 201, 125, 0.15);
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
          background: var(--surface);
          position: relative;
          z-index: 1;
        }

        .projects-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .project-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: var(--surface-elevated);
          border: 1px solid var(--border);
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }

        .project-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(135deg, var(--primary), transparent);
          border-radius: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .project-card:hover::before {
          opacity: 1;
        }

        .project-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
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

        .project-slug {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* CTA Section */
        .cta-section {
          padding: 8rem 2rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .cta-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 4rem;
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 12px;
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
          border-top: 1px solid var(--border);
          text-align: center;
          position: relative;
          z-index: 1;
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

        .footer-logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
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
        @media (max-width: 768px) {
          .hero {
            padding: 4rem 1.5rem;
            min-height: 80vh;
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

      {/* Hero Section */}
      <motion.section
        className="hero"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Animated Candlestick Chart Background */}
        <AnimatedCandlestickBackground />

        {/* Glowing Orb Effect */}
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
            Track Every <span className="hero-highlight">Migration</span> With
            Precision
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Complete price history, holder analytics, and fee tracking for
            migrated Solana tokens. Trusted by projects launching through
            migrate.fun.
          </motion.p>

          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Link href="/zera" className="btn btn-primary">
              Explore Live Projects
              <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              List Your Project
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          style={{
            position: "absolute",
            bottom: "3rem",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronRight
            size={24}
            style={{ transform: "rotate(90deg)", color: "var(--text-muted)" }}
          />
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="section-header">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="section-label">Premium Analytics</div>
              <h2 className="section-title">
                Built for Migration Transparency
              </h2>
              <p className="section-description">
                We stitch together complete price history across pool
                migrations, giving your community the full story.
              </p>
            </motion.div>
          </div>

          <div className="features-grid">
            {[
              {
                icon: <BarChart3 size={24} />,
                title: "Complete History",
                description:
                  "Seamlessly merged charts across pump.fun, Raydium, Meteora, and more.",
              },
              {
                icon: <Database size={24} />,
                title: "Holder Tracking",
                description:
                  "Time-series snapshots showing holder growth and retention over time.",
              },
              {
                icon: <Zap size={24} />,
                title: "Fee Analytics",
                description:
                  "Real-time fee accumulation tracking with historical breakdowns.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      {projects.length > 0 && (
        <section className="projects">
          <div className="projects-container">
            <div className="section-header">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="section-label">Featured Projects</div>
                <h2 className="section-title">Live on Platform</h2>
                <p className="section-description">
                  Explore migration analytics for these Solana tokens
                </p>
              </motion.div>
            </div>

            <div className="projects-grid">
              {projects.map((project, index) => (
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link href={`/${project.slug}`} className="project-card">
                    {project.logoUrl && (
                      <img
                        src={project.logoUrl}
                        alt={project.name}
                        className="project-logo"
                      />
                    )}
                    <div className="project-name">{project.name}</div>
                    <div className="project-slug">/{project.slug}</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="cta-title">Ready to Launch?</h2>
          <p className="cta-description">
            Partner with migrate.fun and get comprehensive analytics for your
            migrated token. Transparent data your community deserves.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Get Started
            <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">migrate-chart.fun</div>
          <div className="footer-links">
            <Link href="/" className="footer-link">
              Home
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
    </div>
  );
}
