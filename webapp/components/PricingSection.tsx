"use client";

import { motion } from "framer-motion";
import { Check, TrendingUp } from "lucide-react";

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

const allFeatures = [
  "Price History",
  "Fee Tracking",
  "Holder Tracking",
  "Burn Tracking",
  "Email & Telegram Support",
];

export default function PricingSection() {
  return (
    <section className="pricing-section">
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


        .all-features-section {
          max-width: 1200px;
          margin: 4rem auto 0;
          text-align: center;
        }

        .all-features-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 2rem;
        }

        .all-features-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .feature-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(10, 10, 10, 0.5);
          border: 1px solid rgba(82, 201, 125, 0.15);
          border-radius: 8px;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .feature-item:hover {
          border-color: rgba(82, 201, 125, 0.3);
          transform: translateX(4px);
          transition: border-color 0.3s ease, transform 0.3s ease;
        }

        .feature-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          color: #52C97D;
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
            <motion.div
              key={tier.name}
              className={`tier-card ${tier.popular ? "popular" : ""}`}
              style={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
            </motion.div>
          ))}
        </div>

        {/* All Features Section */}
        <div className="all-features-section">
          <h3 className="all-features-title">All Tiers Include</h3>
          <div className="all-features-grid">
            {allFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-item"
                style={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Check className="feature-icon" size={20} strokeWidth={3} />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
