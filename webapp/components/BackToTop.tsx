"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <style>{`
        .back-to-top-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
        }

        .back-to-top-button {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 6, 6, 0.95);
          border: 2px solid rgba(82, 201, 125, 0.3);
          border-radius: 12px;
          color: var(--primary);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .back-to-top-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .back-to-top-button:hover {
          border-color: var(--primary);
          box-shadow: 0 0 30px rgba(82, 201, 125, 0.4);
          transform: translateY(-4px);
        }

        .back-to-top-button:hover::before {
          opacity: 0.1;
        }

        .back-to-top-button:active {
          transform: translateY(-2px);
        }

        .back-to-top-icon {
          position: relative;
          z-index: 1;
          transition: transform 0.3s ease;
        }

        .back-to-top-button:hover .back-to-top-icon {
          transform: translateY(-2px);
        }

        /* Terminal-style scanline effect */
        .back-to-top-button::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(82, 201, 125, 0.05) 2px,
            rgba(82, 201, 125, 0.05) 4px
          );
          pointer-events: none;
        }

        /* Pulsing glow effect */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(82, 201, 125, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(82, 201, 125, 0.4);
          }
        }

        .back-to-top-button:not(:hover) {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .back-to-top-container {
            bottom: 1.5rem;
            right: 1.5rem;
          }

          .back-to-top-button {
            width: 48px;
            height: 48px;
          }
        }
      `}</style>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="back-to-top-container"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <button
              onClick={scrollToTop}
              className="back-to-top-button"
              aria-label="Back to top"
            >
              <ArrowUp size={24} className="back-to-top-icon" strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
