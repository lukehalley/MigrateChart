"use client";

import { motion } from "framer-motion";
import { XCircle, AlertCircle, Clock } from "lucide-react";
import { ReactNode } from "react";

interface FeatureItem {
  icon: ReactNode;
  title: string;
  description: string;
}

function FlowingFeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{feature.icon}</div>
      <h3 className="feature-title">{feature.title}</h3>
      <p className="feature-description">{feature.description}</p>
    </div>
  );
}

/**
 * Reusable Problem Section Component
 *
 * Uses the working animation pattern from LandingPageNew.tsx:
 * - Only animates the header with motion.div + whileInView
 * - Feature cards are plain divs without individual animations
 * - This prevents double animation issues from viewport intersection retriggering
 */
export default function ProblemSectionShared() {
  const features: FeatureItem[] = [
    {
      icon: <XCircle size={24} />,
      title: "Lose Credibility Instantly",
      description:
        "Your Chart Looks 3 Days Old. New Investors Think You Just Launched. Your Proven Track Record? Gone.",
    },
    {
      icon: <AlertCircle size={24} />,
      title: "Investors Can't Compare",
      description:
        "Liquidity Split Across Multiple Pools. Different Fee Tiers. Fragmented Volume Data. Impossible To Evaluate Real Performance.",
    },
    {
      icon: <Clock size={24} />,
      title: "Trust Gap Grows",
      description:
        "Fresh Charts Raise Questions. Without Historical Data, You Can't Demonstrate Your Project's Legitimacy And Staying Power.",
    },
  ];

  return (
    <section id="problem" className="features">
      <div className="features-container">
        <div className="section-header">
          <motion.div
            style={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="section-label">THE PROBLEM</div>
            <h2 className="section-title">
              Your Track Record Vanishes Overnight
            </h2>
            <p className="section-description">
              Pool Migrations Reset Your Chart. Investors See A "New" Project And Months Of Proven Performance Disappear.
            </p>
          </motion.div>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <FlowingFeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
