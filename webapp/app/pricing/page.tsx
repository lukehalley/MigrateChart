"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Zap, Clock } from "lucide-react";
import PricingSection from "@/components/PricingSection";

export default function PricingPage() {
  return (
    <div className="pricing-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

        .pricing-page {
          --primary: #52C97D;
          --primary-dark: #3FAA66;
          --bg: #000000;
          --surface: #0a0a0a;
          --text: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --text-muted: rgba(255, 255, 255, 0.4);
          --border: rgba(82, 201, 125, 0.15);

          min-height: 100vh;
          background:
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
            radial-gradient(
              ellipse 120% 80% at 50% 20%,
              rgba(82, 201, 125, 0.08) 0%,
              transparent 50%
            ),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"),
            #000000;
          background-size: 3px 3px, 3px 3px, 100% 100%, 200px 200px, 100% 100%;
          background-attachment: fixed;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          overflow-x: hidden;
        }

        .pricing-page::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.06;
          pointer-events: none;
          z-index: 9999;
        }

        .page-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 2rem;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .back-link:hover {
          border-color: var(--primary);
          color: var(--primary);
          transform: translateX(-4px);
        }

        .logo-link {
          display: inline-block;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logo-link:hover {
          transform: translateY(-2px);
        }

        .logo-svg {
          width: 50px;
          height: 50px;
          color: var(--primary);
          filter: drop-shadow(0 0 12px rgba(82, 201, 125, 0.6));
          transition: all 0.3s ease;
        }

        .logo-link:hover .logo-svg {
          filter: drop-shadow(0 0 20px rgba(82, 201, 125, 0.8));
        }

        .page-content {
          padding-top: 8rem;
          position: relative;
          z-index: 2;
        }

        .hero-section {
          text-align: center;
          padding: 2rem;
          margin-bottom: 4rem;
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.6) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          max-width: 700px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .benefits-section {
          max-width: 1200px;
          margin: 0 auto 6rem;
          padding: 0 2rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .benefit-card {
          background: rgba(10, 10, 10, 0.5);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 2rem;
          transition: all 0.3s ease;
        }

        .benefit-card:hover {
          border-color: rgba(82, 201, 125, 0.3);
          transform: translateY(-4px);
        }

        .benefit-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(82, 201, 125, 0.1);
          border-radius: 8px;
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .benefit-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text);
        }

        .benefit-description {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .faq-section {
          max-width: 800px;
          margin: 0 auto 6rem;
          padding: 0 2rem;
        }

        .faq-title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 3rem;
          color: var(--text);
        }

        .faq-item {
          background: rgba(10, 10, 10, 0.5);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .faq-question {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 0.75rem;
        }

        .faq-answer {
          font-size: 0.9rem;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .page-header {
            padding: 1.5rem;
          }

          .logo-svg {
            width: 40px;
            height: 40px;
          }

          .hero-section {
            padding: 1.5rem;
          }
        }
      `}</style>

      {/* Header */}
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Link href="/" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>

        <Link href="/" className="logo-link">
          <svg
            className="logo-svg"
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
      </motion.header>

      {/* Page Content */}
      <div className="page-content">
        {/* Hero Section */}
        <motion.section
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="hero-title">Simple, Fair Pricing</h1>
          <p className="hero-subtitle">
            Pay Once Based on Your Market Cap. Get Complete Migration Analytics for Your Token.
          </p>
        </motion.section>

        {/* Benefits */}
        <section className="benefits-section">
          <div className="benefits-grid">
            {[
              {
                icon: <Zap size={24} />,
                title: "One-Time Payment",
                description:
                  "No Subscriptions. Pay Once in SOL.",
              },
              {
                icon: <Shield size={24} />,
                title: "Fair & Transparent",
                description:
                  "Same Features for Everyone. Pricing Scales With Your Market Cap.",
              },
              {
                icon: <Clock size={24} />,
                title: "Quick Setup",
                description:
                  "Live in 48 Hours. Simple Onboarding.",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="benefit-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="benefit-icon">{benefit.icon}</div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ */}
        <section className="faq-section">
          <motion.h2
            className="faq-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Frequently Asked Questions
          </motion.h2>

          {[
            {
              question: "What's Included in All Tiers?",
              answer:
                "Every Tier Includes: Price History, Fee Tracking, Holder Tracking, Burn Tracking, and Email & Telegram Support. The Only Difference Is the Price Based on Your Market Cap.",
            },
            {
              question: "How Is Pricing Determined?",
              answer:
                "Pricing Is Based on Your Token's Market Cap at Time of Purchase. We Verify On-Chain to Ensure Fair Pricing. Small Projects (<$100K) Pay 1.5 SOL, While Larger Projects (>$10M) Pay 25 SOL. Same Features, Just Scaled to Project Size.",
            },
            {
              question: "What Payment Methods Do You Accept?",
              answer:
                "We Accept SOL (Primary) and USDC via Solana Blockchain. Crypto Payments Are Instant and We Start Work Immediately After Confirmation.",
            },
            {
              question: "How Long Does Setup Take?",
              answer:
                "Most Projects Go Live Within 48 Hours. We Automatically Integrate With Migrate.fun's On-Chain Data, Pull Your Token Metadata, and Configure Your Analytics Dashboard. You'll Get a Dedicated Page at migrate-chart.fun/yourtoken.",
            },
            {
              question: "Do You Offer Discounts?",
              answer:
                "Yes! Beta Pricing: First 5 Projects Get 1 SOL Flat Rate Regardless of Market Cap. Volume Discounts Available for 3+ Projects.",
            },
          ].map((faq, index) => (
            <motion.div
              key={index}
              className="faq-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <h3 className="faq-question">{faq.question}</h3>
              <p className="faq-answer">{faq.answer}</p>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
}
