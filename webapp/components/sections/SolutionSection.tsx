"use client";

import { motion } from "framer-motion";
import { GitMerge, History, MapPin } from "lucide-react";

export default function SolutionSection() {
  return (
    <section id="solution" className="features">
      <div className="features-container">
        <div className="section-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="section-label">THE SOLUTION</div>
            <h2 className="section-title">
              Prove Your Legitimacy With One Chart
            </h2>
            <p className="section-description">
              Show investors your complete journey. Connect your old pool to your new one. One unbroken timeline that demonstrates your project's real staying power and transparency.
            </p>
          </motion.div>
        </div>

        <div className="features-grid">
          {[
            {
              icon: <GitMerge size={24} />,
              title: "Build Trust Immediately",
              description:
                "Show your complete track record in one glance. Investors see you're established, not a rug waiting to happen. Transparency wins confidence.",
            },
            {
              icon: <History size={24} />,
              title: "Prove Your Staying Power",
              description:
                "Display months of price action, holder growth, and real volume. Let your history do the talking. Legitimate projects have nothing to hide.",
            },
            {
              icon: <MapPin size={24} />,
              title: "Demonstrate Smart Strategy",
              description:
                "Show why you migrated: better fees, more holders, stronger liquidity. Turn migrations from red flags into proof points of professional management.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
