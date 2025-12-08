"use client";

import { motion } from "framer-motion";
import { XCircle, AlertCircle, Clock } from "lucide-react";

export default function ProblemSection() {
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
              Pool migrations reset your chart. Investors see a "new" project and months of proven performance disappear.
            </p>
          </motion.div>
        </div>

        <div className="features-grid">
          {[
            {
              icon: <XCircle size={24} />,
              title: "Lose Credibility Instantly",
              description:
                "Your chart looks 3 days old. New investors think you just launched. Your proven track record? Gone.",
            },
            {
              icon: <AlertCircle size={24} />,
              title: "Investors Can't Compare",
              description:
                "Liquidity split across multiple pools. Different fee tiers. Fragmented volume data. Impossible to evaluate real performance.",
            },
            {
              icon: <Clock size={24} />,
              title: "Trust Gap Grows",
              description:
                "Fresh charts raise questions. Without historical data, you can't demonstrate your project's legitimacy and staying power.",
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
