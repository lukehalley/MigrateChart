"use client";

import { motion } from "framer-motion";
import { GitMerge, History, MapPin } from "lucide-react";

/**
 * Reusable Solution Section Component
 *
 * Uses the working animation pattern from LandingPageNew.tsx:
 * - Only animates the header with motion.div + whileInView
 * - Feature cards are plain divs without individual animations
 * - This prevents double animation issues from viewport intersection retriggering
 */
export default function SolutionSectionShared() {
  return (
    <section id="solution" className="features">
      <div className="features-container">
        <div className="section-header">
          <motion.div
            style={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="section-label">THE SOLUTION</div>
            <h2 className="section-title">
              Prove Your Legitimacy With One Chart
            </h2>
            <p className="section-description">
              Show Investors Your Complete Journey. Connect Your Old Pool To Your New One. One Unbroken Timeline That Demonstrates Your Project's Real Staying Power And Transparency.
            </p>
          </motion.div>
        </div>

        <div className="features-grid">
          {[
            {
              icon: <GitMerge size={24} />,
              title: "Build Trust Immediately",
              description:
                "Show Your Complete Track Record In One Glance. Investors See You're Established, Not A Rug Waiting To Happen. Transparency Wins Confidence.",
            },
            {
              icon: <History size={24} />,
              title: "Prove Your Staying Power",
              description:
                "Display Months Of Price Action, Holder Growth, And Real Volume. Let Your History Do The Talking. Legitimate Projects Have Nothing To Hide.",
            },
            {
              icon: <MapPin size={24} />,
              title: "Demonstrate Smart Strategy",
              description:
                "Show Why You Migrated: Better Fees, More Holders, Stronger Liquidity. Turn Migrations From Red Flags Into Proof Points Of Professional Management.",
            },
          ].map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
