"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface PricingTier {
  name: string;
  marketCap: string;
  marketCapRange: string;
  price: string;
  priceUsd: string;
  features: string[];
  popular?: boolean;
  barWidth: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "MICRO",
    marketCap: "<$100K",
    marketCapRange: "New Launches",
    price: "1.5",
    priceUsd: "",
    barWidth: "20%",
    features: [],
  },
  {
    name: "SMALL",
    marketCap: "$100K-$500K",
    marketCapRange: "Growing Projects",
    price: "2.5",
    priceUsd: "",
    barWidth: "40%",
    popular: true,
    features: [],
  },
  {
    name: "MEDIUM",
    marketCap: "$500K-$2M",
    marketCapRange: "Established Tokens",
    price: "5",
    priceUsd: "",
    barWidth: "60%",
    features: [],
  },
  {
    name: "LARGE",
    marketCap: "$2M-$10M",
    marketCapRange: "Major Migrations",
    price: "10",
    priceUsd: "",
    barWidth: "80%",
    features: [],
  },
  {
    name: "PREMIUM",
    marketCap: ">$10M",
    marketCapRange: "Blue Chip Projects",
    price: "25",
    priceUsd: "",
    barWidth: "100%",
    features: [],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="pricing-section">
      <style>{`
        .pricing-section {
          padding: 8rem 2rem;
          position: relative;
          background: transparent;
        }

        .pricing-container {
          max-width: 1600px;
          margin: 0 auto;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .pricing-label {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(82, 201, 125, 0.1);
          border: 1px solid rgba(82, 201, 125, 0.2);
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #52C97D;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }

        .pricing-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1rem;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .pricing-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          max-width: 600px;
          margin: 0 auto 1rem;
          line-height: 1.6;
        }

        .pricing-note {
          font-size: 0.85rem;
          color: rgba(82, 201, 125, 0.8);
          font-family: 'JetBrains Mono', monospace;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .pricing-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .tier-card {
          position: relative;
          background: rgba(10, 10, 10, 0.8);
          border: 1px solid rgba(82, 201, 125, 0.15);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .tier-card:hover {
          transform: translateY(-8px);
          border-color: rgba(82, 201, 125, 0.4);
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.5),
            0 0 60px rgba(82, 201, 125, 0.2);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tier-card.popular {
          border-color: rgba(82, 201, 125, 0.5);
          box-shadow: 0 0 40px rgba(82, 201, 125, 0.15);
        }

        .tier-card.popular::before {
          content: 'MOST POPULAR';
          position: absolute;
          top: -12px;
          right: 2rem;
          padding: 0.4rem 1rem;
          background: linear-gradient(135deg, #52C97D, #3FAA66);
          color: #000;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          border-radius: 100px;
          font-family: 'JetBrains Mono', monospace;
        }

        .tier-header {
          margin-bottom: 1.5rem;
          width: 100%;
        }

        .tier-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #52C97D;
          margin-bottom: 0.5rem;
        }

        .tier-market-cap {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .tier-market-range {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 1rem;
        }

        .market-cap-bar {
          position: relative;
          height: 4px;
          background: rgba(82, 201, 125, 0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .market-cap-fill {
          height: 100%;
          background: linear-gradient(90deg, #52C97D, #3FAA66);
          border-radius: 2px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px rgba(82, 201, 125, 0.5);
        }

        .tier-price {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.5rem;
        }

        .price-sol {
          font-family: 'Syne', sans-serif;
          font-size: 3rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }

        .price-currency {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .pricing-section {
            padding: 4rem 1.5rem;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
          }

          .tier-card.popular::before {
            right: 1rem;
          }
        }

        /* Light mode overrides */
        .light .pricing-label,
        html.light .pricing-label {
          background: rgba(45, 138, 82, 0.1);
          border: 1px solid rgba(45, 138, 82, 0.2);
          color: #2d8a52;
        }

        .light .pricing-title,
        html.light .pricing-title {
          background: linear-gradient(180deg, #1a1a1a 0%, rgba(26, 26, 26, 0.8) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .light .pricing-subtitle,
        html.light .pricing-subtitle {
          color: rgba(26, 26, 26, 0.6);
        }

        .light .pricing-note,
        html.light .pricing-note {
          color: rgba(45, 138, 82, 0.9);
        }

        .light .tier-card,
        html.light .tier-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(45, 138, 82, 0.15);
        }

        .light .tier-card:hover,
        html.light .tier-card:hover {
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 0 40px rgba(45, 138, 82, 0.1);
        }

        .light .tier-card.popular,
        html.light .tier-card.popular {
          box-shadow: 0 0 30px rgba(45, 138, 82, 0.1);
        }

        .light .tier-card.popular::before,
        html.light .tier-card.popular::before {
          background: linear-gradient(135deg, #2d8a52, #236b40);
          color: #fff;
        }

        .light .tier-name,
        html.light .tier-name {
          color: #2d8a52;
        }

        .light .tier-market-cap,
        html.light .tier-market-cap {
          color: #1a1a1a;
        }

        .light .tier-market-range,
        html.light .tier-market-range {
          color: rgba(26, 26, 26, 0.5);
        }

        .light .market-cap-bar,
        html.light .market-cap-bar {
          background: rgba(45, 138, 82, 0.1);
        }

        .light .market-cap-fill,
        html.light .market-cap-fill {
          background: linear-gradient(90deg, #2d8a52, #236b40);
          box-shadow: 0 0 8px rgba(45, 138, 82, 0.3);
        }

        .light .price-sol,
        html.light .price-sol {
          color: #1a1a1a;
        }

        .light .price-currency,
        html.light .price-currency {
          color: rgba(26, 26, 26, 0.6);
        }
      `}</style>

      <div className="pricing-container">
        <motion.div
          className="pricing-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="pricing-label">
            <TrendingUp size={14} />
            <span>FAIR PRICING</span>
          </div>
          <h2 className="pricing-title">Priced By Market Cap</h2>
          <p className="pricing-subtitle">
            Same Features. Fair Pricing Based on Project Size.
          </p>
          <p className="pricing-note">
            SOL-Denominated • One-Time Payment
          </p>
        </motion.div>

        <div className="pricing-grid">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`tier-card ${tier.popular ? "popular" : ""}`}
              style={{
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              <div className="tier-header">
                <div className="tier-name">{tier.name}</div>
                <div className="tier-market-cap">{tier.marketCap}</div>
                <div className="tier-market-range">{tier.marketCapRange}</div>

                <div className="market-cap-bar">
                  <div
                    className="market-cap-fill"
                    style={{ width: tier.barWidth }}
                  />
                </div>
              </div>

              <div className="tier-price">
                <span className="price-sol">
                  {tier.price}
                </span>
                <span className="price-currency">SOL</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
