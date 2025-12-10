"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = ["problem", "solution", "metrics", "projects", "community", "pricing", "contact"];

    const handleScroll = () => {
      // Get current scroll position
      const scrollPosition = window.scrollY + 100; // Offset for navbar height

      // Check if we're at the very top (hero section)
      if (window.scrollY < 200) {
        setActiveSection("");
        return;
      }

      // Find which section is currently in view
      let currentSection = "";

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          // Check if scroll position is within this section
          // Use a generous range to catch the section
          if (scrollPosition >= elementTop - 200 && scrollPosition < elementBottom - 200) {
            currentSection = sectionId;
            break;
          }
        }
      }

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    // Run on mount and on scroll
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Lock/unlock body scroll when mobile menu opens/closes
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for nav height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <style>{`
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 1rem 2rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInNav 0.6s ease-out forwards;
        }

        @keyframes fadeInNav {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse-cta {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes ripple {
          0% {
            box-shadow: 0 0 0 0 rgba(82, 201, 125, 0.7),
                        0 0 0 0 rgba(82, 201, 125, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(82, 201, 125, 0),
                        0 0 0 5px rgba(82, 201, 125, 0.3);
          }
          100% {
            box-shadow: 0 0 0 20px rgba(82, 201, 125, 0),
                        0 0 0 10px rgba(82, 201, 125, 0);
          }
        }

        .landing-nav.scrolled {
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(82, 201, 125, 0.1);
        }

        .nav-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .nav-logo-wrapper {
          z-index: 10;
        }

        .nav-links-wrapper {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .nav-cta-wrapper {
          margin-left: auto;
        }

        .nav-logo-link {
          display: inline-block;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
        }

        .nav-logo-link:hover {
          transform: translateY(-2px);
        }

        .nav-logo-svg {
          width: 60px;
          height: 60px;
          color: var(--primary);
          filter: drop-shadow(0 0 12px rgba(82, 201, 125, 0.6))
                  drop-shadow(0 0 6px rgba(82, 201, 125, 0.4));
          transition: all 0.3s ease;
        }

        .nav-logo-link:hover .nav-logo-svg {
          filter: drop-shadow(0 0 20px rgba(82, 201, 125, 0.8))
                  drop-shadow(0 0 10px rgba(82, 201, 125, 0.6));
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 0.75rem 1.25rem;
          border-radius: 6px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          letter-spacing: 0.02em;
          position: relative;
          border: 1px solid transparent;
        }

        .nav-link::before {
          content: '>';
          position: absolute;
          left: 0.5rem;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--primary);
        }

        .nav-link.active {
          color: var(--primary);
          background: rgba(82, 201, 125, 0.08);
          border-color: rgba(82, 201, 125, 0.25);
          padding-left: 1.75rem;
          font-weight: 600;
        }

        .nav-link.active::before {
          opacity: 1;
          transform: translateX(0);
        }

        .nav-link:hover {
          color: var(--primary);
          background: rgba(82, 201, 125, 0.05);
          border-color: rgba(82, 201, 125, 0.2);
          padding-left: 1.75rem;
        }

        .nav-link:hover::before {
          opacity: 1;
          transform: translateX(0);
        }

        .nav-link.primary {
          background: var(--primary);
          color: #000000;
          border: 2px solid var(--primary);
          font-weight: 600;
          animation: pulse-cta 1.5s ease-in-out infinite, ripple 1.5s ease-out infinite;
        }

        .nav-link.primary:hover {
          background: var(--primary);
          box-shadow: 0 0 30px rgba(82, 201, 125, 0.8), 0 0 50px rgba(82, 201, 125, 0.4);
          padding-left: 1.25rem;
          animation-play-state: paused;
        }

        .nav-link.primary::before {
          display: none;
        }

        /* Mobile Menu */
        .mobile-menu-button {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid rgba(82, 201, 125, 0.3);
          padding: 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 44px;
          height: 44px;
          position: relative;
        }

        .mobile-menu-button:hover {
          border-color: var(--primary);
          background: rgba(82, 201, 125, 0.05);
        }

        .mobile-menu-button span {
          width: 22px;
          height: 2px;
          background: var(--primary);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: absolute;
          display: block;
        }

        .mobile-menu-button span:nth-child(1) {
          top: 12px;
        }

        .mobile-menu-button span:nth-child(2) {
          top: 20px;
        }

        .mobile-menu-button span:nth-child(3) {
          top: 28px;
        }

        .mobile-menu-button.open span:nth-child(1) {
          top: 20px;
          transform: rotate(45deg);
        }

        .mobile-menu-button.open span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-button.open span:nth-child(3) {
          top: 20px;
          transform: rotate(-45deg);
        }

        .mobile-nav {
          display: none;
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(82, 201, 125, 0.2);
          padding: 2rem 1.5rem;
          overflow-y: auto;
          z-index: 999;
        }

        .mobile-nav.open {
          display: block;
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mobile-nav .nav-link {
          padding: 1.25rem 1.5rem;
          font-size: 1rem;
          border: 1px solid rgba(82, 201, 125, 0.15);
          border-radius: 8px;
          text-align: left;
          background: rgba(6, 6, 6, 0.6);
        }

        .mobile-nav .nav-link.active {
          background: rgba(82, 201, 125, 0.12);
          border-color: rgba(82, 201, 125, 0.35);
          color: var(--primary);
          font-weight: 600;
        }

        .mobile-nav .nav-link:hover {
          background: rgba(82, 201, 125, 0.08);
          border-color: rgba(82, 201, 125, 0.3);
        }

        .mobile-nav .nav-link.primary {
          margin-top: 1rem;
          background: var(--primary);
          border-color: var(--primary);
          animation: pulse-cta 1.5s ease-in-out infinite, ripple 1.5s ease-out infinite;
        }

        .mobile-nav .nav-link.primary:hover {
          background: var(--primary);
          box-shadow: 0 0 30px rgba(82, 201, 125, 0.8), 0 0 50px rgba(82, 201, 125, 0.4);
          animation-play-state: paused;
        }

        @media (max-width: 768px) {
          .landing-nav {
            padding: 1rem 1.5rem;
          }

          .nav-container {
            display: flex;
            justify-content: space-between;
          }

          .nav-logo-svg {
            width: 48px;
            height: 48px;
          }

          .nav-links-wrapper,
          .nav-cta-wrapper {
            display: none;
          }

          .mobile-menu-button {
            display: flex;
          }
        }

        /* Light mode overrides */
        .light .landing-nav.scrolled,
        html.light .landing-nav.scrolled {
          background: rgba(255, 255, 255, 0.85);
          border-bottom: 1px solid rgba(45, 138, 82, 0.15);
        }

        .light .nav-link.active,
        html.light .nav-link.active {
          background: rgba(45, 138, 82, 0.08);
          border-color: rgba(45, 138, 82, 0.25);
        }

        .light .nav-link:hover,
        html.light .nav-link:hover {
          background: rgba(45, 138, 82, 0.05);
          border-color: rgba(45, 138, 82, 0.2);
        }

        .light .nav-link.primary,
        html.light .nav-link.primary {
          color: #ffffff;
        }

        .light .nav-link.primary:hover,
        html.light .nav-link.primary:hover {
          box-shadow: 0 0 20px rgba(45, 138, 82, 0.5), 0 0 35px rgba(45, 138, 82, 0.25);
        }

        .light .mobile-menu-button,
        html.light .mobile-menu-button {
          border: 1px solid rgba(45, 138, 82, 0.3);
        }

        .light .mobile-menu-button:hover,
        html.light .mobile-menu-button:hover {
          background: rgba(45, 138, 82, 0.05);
        }

        .light .mobile-nav,
        html.light .mobile-nav {
          background: rgba(255, 255, 255, 0.95);
          border-top: 1px solid rgba(45, 138, 82, 0.2);
        }

        .light .mobile-nav .nav-link,
        html.light .mobile-nav .nav-link {
          border: 1px solid rgba(45, 138, 82, 0.15);
          background: rgba(255, 255, 255, 0.6);
        }

        .light .mobile-nav .nav-link.active,
        html.light .mobile-nav .nav-link.active {
          background: rgba(45, 138, 82, 0.1);
          border-color: rgba(45, 138, 82, 0.3);
        }

        .light .mobile-nav .nav-link:hover,
        html.light .mobile-nav .nav-link:hover {
          background: rgba(45, 138, 82, 0.08);
          border-color: rgba(45, 138, 82, 0.25);
        }

        .light .mobile-nav .nav-link.primary,
        html.light .mobile-nav .nav-link.primary {
          color: #ffffff;
        }
      `}</style>

      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          {/* Logo */}
          <div className="nav-logo-wrapper">
            <Link href="/" className="nav-logo-link">
              <svg
                className="nav-logo-svg"
                viewBox="57 135 388 232"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Migrate Chart"
              >
                <path
                  fill="currentColor"
                  d="M135.423309,290.383972 C135.222244,292.157013 134.849457,293.929749 134.846222,295.703156 C134.806274,317.680511 134.820129,339.657990 134.820129,361.635437 C134.820129,363.432007 134.820129,365.228577 134.820129,367.319092 C108.857216,367.319092 83.287056,367.319092 57.352207,367.319092 C57.352207,341.704376 57.352207,316.037659 57.352207,289.918823 C83.140572,289.918823 108.899254,289.918823 135.063660,290.174957 C135.469360,290.431091 135.423309,290.383972 135.423309,290.383972z"
                />
                <path
                  fill="currentColor"
                  d="M290.364258,290.336945 C290.217560,292.805908 289.947449,295.274719 289.943604,297.743896 C289.910065,319.238007 289.924225,340.732239 289.924225,362.226410 C289.924225,363.852112 289.924225,365.477844 289.924225,367.357361 C263.907196,367.357361 238.310226,367.357361 211.965073,367.357361 C211.965073,341.967926 211.965073,316.566803 211.812134,290.761261 C211.659195,290.356812 211.589157,290.420380 211.589157,290.420380 C213.204071,290.267975 214.818726,289.985748 216.433914,289.982635 C240.827682,289.935608 265.221497,289.925293 290.014832,290.152710 C290.414307,290.399109 290.364258,290.336945 290.364258,290.336945z"
                />
                <path
                  fill="currentColor"
                  d="M445.290466,169.000153 C445.290466,183.634445 445.290466,197.768707 445.290466,212.257187 C419.463715,212.257187 393.941895,212.257187 368.161346,212.257187 C368.161346,186.667191 368.161346,161.109375 368.161346,135.257370 C393.655151,135.257370 419.195465,135.257370 445.290466,135.257370 C445.290466,146.339661 445.290466,157.419907 445.290466,169.000153z"
                />
                <path
                  fill="currentColor"
                  d="M135.497192,290.448730 C135.251816,289.392853 134.742188,288.319763 134.740173,287.245728 C134.695267,263.252930 134.703552,239.260025 134.718506,215.267151 C134.719009,214.463577 134.893936,213.660110 135.013840,212.631134 C160.586761,212.631134 186.014481,212.631134 212.069183,212.631134 C212.069183,238.286774 212.069183,263.867767 211.829163,289.934570 C211.589157,290.420380 211.659195,290.356812 211.677277,290.329926 C186.528381,290.218719 161.361404,290.134399 135.808868,290.217041 C135.423309,290.383972 135.469360,290.431091 135.497192,290.448730z"
                />
                <path
                  fill="currentColor"
                  d="M290.446106,290.423218 C290.253357,289.345978 289.834564,288.244904 289.832825,287.143219 C289.795258,263.321381 289.801147,239.499527 289.815552,215.677673 C289.816132,214.720184 289.982727,213.762787 290.090454,212.607132 C315.730774,212.607132 341.153046,212.607132 366.859802,212.607132 C366.859802,238.324921 366.859802,263.892670 366.859802,290.047455 C341.672607,290.047455 316.414978,290.047455 290.760803,290.192200 C290.364258,290.336945 290.414307,290.399109 290.446106,290.423218z"
                />
                <path
                  fill="currentColor"
                  d="M445.290466,302.007385 C445.290466,323.963470 445.290466,345.421448 445.290466,367.245850 C419.480499,367.245850 393.966675,367.245850 368.177490,367.245850 C368.177490,341.667480 368.177490,316.112549 368.177490,290.260376 C393.644684,290.260376 419.183838,290.260376 445.290466,290.260376 C445.290466,293.993011 445.290466,297.751160 445.290466,302.007385z"
                />
              </svg>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="nav-links-wrapper">
            <div className="nav-links">
              <button
                onClick={() => scrollToSection("problem")}
                className={`nav-link ${activeSection === "problem" ? "active" : ""}`}
              >
                Problem
              </button>
              <button
                onClick={() => scrollToSection("solution")}
                className={`nav-link ${activeSection === "solution" ? "active" : ""}`}
              >
                Solution
              </button>
              <button
                onClick={() => scrollToSection("metrics")}
                className={`nav-link ${activeSection === "metrics" ? "active" : ""}`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("projects")}
                className={`nav-link ${activeSection === "projects" ? "active" : ""}`}
              >
                Examples
              </button>
              <button
                onClick={() => scrollToSection("community")}
                className={`nav-link ${activeSection === "community" ? "active" : ""}`}
              >
                Community
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className={`nav-link ${activeSection === "pricing" ? "active" : ""}`}
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`nav-link ${activeSection === "contact" ? "active" : ""}`}
              >
                Contact
              </button>
            </div>
          </div>

          {/* CTA - Right aligned */}
          <div className="nav-cta-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ThemeToggle variant="nav" />
            <Link href="/zera" className="nav-link primary">
              Launch App
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <MobileMenuButton isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <MobileNav
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        scrollToSection={scrollToSection}
        activeSection={activeSection}
      />
    </>
  );
}

function MobileMenuButton({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  return (
    <button
      className={`mobile-menu-button ${isOpen ? "open" : ""}`}
      onClick={() => setIsOpen(!isOpen)}
      aria-label="Toggle menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
}

function MobileNav({
  isOpen,
  setIsOpen,
  scrollToSection,
  activeSection,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  scrollToSection: (id: string) => void;
  activeSection: string;
}) {
  return (
    <div className={`mobile-nav ${isOpen ? "open" : ""}`}>
      <div className="mobile-nav-links">
        {/* Theme Toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <ThemeToggle variant="nav" />
        </div>
        <Link
          href="/why"
          className="nav-link"
          onClick={() => setIsOpen(false)}
        >
          Why Us
        </Link>
        <Link
          href="/features"
          className="nav-link"
          onClick={() => setIsOpen(false)}
        >
          Features
        </Link>
        <Link
          href="/examples"
          className="nav-link"
          onClick={() => setIsOpen(false)}
        >
          Examples
        </Link>
        <Link
          href="/community"
          className="nav-link"
          onClick={() => setIsOpen(false)}
        >
          Community
        </Link>
        <Link
          href="/pricing"
          className="nav-link"
          onClick={() => setIsOpen(false)}
        >
          Pricing
        </Link>
        <Link
          href="/contact"
          className="nav-link"
          onClick={() => setIsOpen(false)}
        >
          Contact
        </Link>
        <Link
          href="/zera"
          className="nav-link primary"
          onClick={() => setIsOpen(false)}
        >
          Launch App
        </Link>
      </div>
    </div>
  );
}
