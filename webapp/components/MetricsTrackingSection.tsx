"use client";

import { useEffect, useRef, useState } from "react";
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
  const [displayedIndex, setDisplayedIndex] = useState<number | null>(null);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Cascade animation effect - step through each item
  useEffect(() => {
    if (targetIndex === displayedIndex) return;

    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    const stepToTarget = () => {
      // Determine direction first, before changing index
      const currentIdx = displayedIndex;
      let newDirection: "down" | "up" = direction;
      let nextIndex: number | null = currentIdx;

      if (currentIdx === null && targetIndex !== null) {
        newDirection = "down";
        nextIndex = 0;
      } else if (targetIndex === null) {
        newDirection = "up";
        nextIndex = currentIdx !== null && currentIdx > 0 ? currentIdx - 1 : null;
      } else if (currentIdx === null) {
        newDirection = "down";
        nextIndex = 0;
      } else if (currentIdx < targetIndex) {
        newDirection = "down";
        nextIndex = currentIdx + 1;
      } else if (currentIdx > targetIndex) {
        newDirection = "up";
        nextIndex = currentIdx - 1;
      }

      // Set direction and previous index first
      setDirection(newDirection);
      setPrevIndex(currentIdx);

      // Update index after a microtask to ensure CSS applies
      requestAnimationFrame(() => {
        setDisplayedIndex(nextIndex);
        // Clear previous index after animation completes
        setTimeout(() => setPrevIndex(null), 150);
      });
    };

    // Step towards target with delay for cascade effect (match CSS transition duration)
    animationRef.current = setTimeout(stepToTarget, 180);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [targetIndex, displayedIndex]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Only activate when section is in view
      if (sectionRect.top > viewportHeight || sectionRect.bottom < 0) {
        setTargetIndex(null);
        return;
      }

      // Trigger line - where items become active when they cross it
      const triggerLine = viewportHeight * 0.5;

      // Find the last item that has crossed above the trigger line
      let newTargetIndex: number | null = null;

      for (let i = 0; i < itemRefs.current.length; i++) {
        const ref = itemRefs.current[i];
        if (!ref) continue;

        const rect = ref.getBoundingClientRect();
        const itemTop = rect.top;

        // Item becomes active when its top crosses the trigger line
        if (itemTop <= triggerLine) {
          newTargetIndex = i;
        }
      }

      // If we're at the very top of the section, activate first item
      if (newTargetIndex === null && sectionRect.top <= viewportHeight * 0.7) {
        newTargetIndex = 0;
      }

      setTargetIndex(newTargetIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      badge: "Advanced",
    },
    {
      icon: <DollarSign size={24} />,
      title: "Fee Analytics",
      description: "Track fees collected per pool. Compare fee tiers and optimize liquidity strategy.",
      badge: "Advanced",
    },
    {
      icon: <Flame size={24} />,
      title: "Burn Tracking",
      description: "For projects with burn mechanics. Monitor token burns, burn rate, and supply changes.",
      badge: "Advanced",
    },
    {
      icon: <Cog size={24} />,
      title: "Project Mechanics",
      description: "Large projects can track custom tokenomics. Rebases, reflections, unique distributions.",
      badge: "Custom",
    },
  ];

  return (
    <section id="metrics" className="metrics-section" ref={sectionRef}>
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
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          opacity: 0;
          transform: translateX(-20px);
          animation: slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .metric-item:nth-child(1) { animation-delay: 0.05s; }
        .metric-item:nth-child(2) { animation-delay: 0.1s; }
        .metric-item:nth-child(3) { animation-delay: 0.15s; }
        .metric-item:nth-child(4) { animation-delay: 0.2s; }
        .metric-item:nth-child(5) { animation-delay: 0.25s; }
        .metric-item:nth-child(6) { animation-delay: 0.3s; }
        .metric-item:nth-child(7) { animation-delay: 0.35s; }

        @keyframes slideInLeft {
          to {
            opacity: 1;
            transform: translateX(0);
          }
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
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Direction-based transform origins for natural line animation */
        /* Scrolling down: active enters from top, leaving exits to bottom */
        .metric-item.dir-down.active::before {
          transform-origin: top;
          transform: scaleY(1);
        }
        .metric-item.dir-down.leaving::before {
          transform-origin: bottom;
        }

        /* Scrolling up: active enters from bottom, leaving exits to top */
        .metric-item.dir-up.active::before {
          transform-origin: bottom;
          transform: scaleY(1);
        }
        .metric-item.dir-up.leaving::before {
          transform-origin: top;
        }

        .metric-item.has-active {
          opacity: 0.35;
        }

        .metric-item.active {
          background: rgba(82, 201, 125, 0.03);
          padding-left: 2.5rem;
          opacity: 1;
        }

        .metric-item.active::before {
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

        .metric-item.active .metric-icon {
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

        .metric-badge.custom {
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

          .metric-item.active {
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
          <div className="section-label">COMPREHENSIVE ANALYTICS</div>
          <h2 className="section-title">Beyond Price History</h2>
          <p className="section-description">
            Track every metric that matters. From market fundamentals to advanced tokenomics.
            One unified dashboard for complete project intelligence.
          </p>
        </div>

        <div className="metrics-list">
          {metrics.map((metric, index) => (
            <div
              key={metric.title}
              ref={(el) => { itemRefs.current[index] = el; }}
              className={`metric-item dir-${direction}${displayedIndex === index ? " active" : ""}${prevIndex === index ? " leaving" : ""}${displayedIndex !== null && displayedIndex !== index && prevIndex !== index ? " has-active" : ""}`}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
