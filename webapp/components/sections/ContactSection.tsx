"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ContactSection() {
  return (
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
  );
}
