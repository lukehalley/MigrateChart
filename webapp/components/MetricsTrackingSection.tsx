"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Flame,
  Cog,
  LineChart,
  Activity,
} from "lucide-react";

export default function MetricsTrackingSection() {
  const metrics = [
    {
      icon: <LineChart size={24} />,
      title: "Price History",
      description: "Complete OHLCV data across all migrations. Never lose track of historical performance.",
      badge: "Core",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Market Cap",
      description: "Real-time and historical market capitalization tracking. See growth trends over time.",
      badge: "Core",
    },
    {
      icon: <Activity size={24} />,
      title: "Volume Analytics",
      description: "24h volume, cumulative volume, and volume patterns across different pool phases.",
      badge: "Core",
    },
    {
      icon: <Users size={24} />,
      title: "Holder Tracking",
      description: "Monitor holder count evolution. See how community growth correlates with migrations.",
      badge: "Core",
    },
    {
      icon: <DollarSign size={24} />,
      title: "Fee Analytics",
      description: "Track fees collected per pool. Compare fee tiers and optimize liquidity strategy.",
      badge: "Core",
    },
    {
      icon: <Flame size={24} />,
      title: "Burn Tracking",
      description: "For projects with burn mechanics. Monitor token burns, burn rate, and supply changes.",
      badge: "Advanced",
    },
    {
      icon: <Cog size={24} />,
      title: "Custom Mechanics",
      description: "Large projects can track custom tokenomics. Rebases, reflections, unique distributions.",
      badge: "Enterprise",
    },
  ];

  return (
    <section className="metrics-section">
      <style>{`
        .metrics-section {
          padding: 8rem 2rem;
          position: relative;
          background: transparent;
        }

        .metrics-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .metrics-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .metrics-list {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .metric-item {
          display: flex;
          align-items: flex-start;
          gap: 2rem;
          padding: 2rem;
          border-bottom: 1px solid rgba(82, 201, 125, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .metric-item:first-child {
          border-top: 1px solid rgba(82, 201, 125, 0.1);
        }

        .metric-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, var(--primary), var(--accent));
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .metric-item:hover {
          background: rgba(82, 201, 125, 0.03);
          padding-left: 2.5rem;
        }

        .metric-item:hover::before {
          transform: scaleY(1);
        }

        .metric-icon {
          width: 40px;
          height: 40px;
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(82, 201, 125, 0.1);
          border-radius: 8px;
          color: var(--primary);
          transition: all 0.3s ease;
        }

        .metric-item:hover .metric-icon {
          background: rgba(82, 201, 125, 0.2);
          box-shadow: 0 0 20px rgba(82, 201, 125, 0.3);
        }

        .metric-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .metric-title-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .metric-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 100px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1;
        }

        .metric-badge.core {
          background: rgba(82, 201, 125, 0.15);
          color: var(--primary);
          border: 1px solid rgba(82, 201, 125, 0.3);
        }

        .metric-badge.advanced {
          background: rgba(212, 168, 83, 0.15);
          color: var(--accent);
          border: 1px solid rgba(212, 168, 83, 0.3);
        }

        .metric-badge.enterprise {
          background: rgba(147, 112, 219, 0.15);
          color: #9370DB;
          border: 1px solid rgba(147, 112, 219, 0.3);
        }

        .metric-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text);
        }

        .metric-description {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* Data visualization decorative element */
        .data-viz-background {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          pointer-events: none;
          opacity: 0.03;
          z-index: 0;
        }

        .data-viz-background svg {
          width: 100%;
          height: 100%;
          filter: blur(2px);
        }

        @media (max-width: 768px) {
          .metrics-section {
            padding: 4rem 1.5rem;
          }

          .metric-item {
            flex-direction: column;
            gap: 1rem;
            padding: 1.5rem;
          }

          .metric-item:hover {
            padding-left: 1.5rem;
          }

          .metric-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .data-viz-background {
            width: 300px;
            height: 300px;
          }
        }
      `}</style>

      <div className="metrics-container">
        {/* Decorative data visualization in background */}
        <div className="data-viz-background">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 150 L30 120 L50 135 L70 90 L90 110 L110 60 L130 80 L150 40 L170 55 L190 30"
              stroke="#52C97D"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M10 170 L30 165 L50 155 L70 160 L90 145 L110 150 L130 135 L150 140 L170 125 L190 120"
              stroke="#D4A853"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="metrics-header">
          <motion.div
            style={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="section-label">COMPREHENSIVE ANALYTICS</div>
            <h2 className="section-title">Beyond Price History</h2>
            <p className="section-description">
              Track every metric that matters. From market fundamentals to advanced tokenomics.
              One unified dashboard for complete project intelligence.
            </p>
          </motion.div>
        </div>

        <div className="metrics-list">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              className="metric-item"
              style={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="metric-icon">{metric.icon}</div>
              <div className="metric-content">
                <div className="metric-header">
                  <div className="metric-title-wrapper">
                    <h3 className="metric-title">{metric.title}</h3>
                  </div>
                  <span
                    className={`metric-badge ${metric.badge.toLowerCase()}`}
                  >
                    {metric.badge}
                  </span>
                </div>
                <p className="metric-description">{metric.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
