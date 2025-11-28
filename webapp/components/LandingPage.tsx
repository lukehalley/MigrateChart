'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { TokenLoadingLogo } from './TokenLoadingLogo';

interface ProjectListItem {
  slug: string;
  name: string;
  primaryColor: string;
  logoUrl: string;
  loaderUrl: string;
}

export default function LandingPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch projects
  useEffect(() => {
    const startTime = Date.now();
    const minDisplayTime = 3500; // ~1 animation cycle + fade time

    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        // Ensure loader shows for at least 2 animation cycles
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);

        setTimeout(() => {
          setLoading(false);
          setTimeout(() => setShowLoader(false), 400); // Match 0.4s transition
        }, remainingTime);
      }
    }
    fetchProjects();
  }, []);

  // Auto-cycle through tokens (pauses when button clicked)
  useEffect(() => {
    if (projects.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [projects.length, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % projects.length);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projects.length]);

  const currentProject = projects.length > 0 ? projects[currentIndex] : null;

  const handleTrackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsPaused(true);
    setIsTransitioning(true);

    // Navigate after fade animation (match 0.4s transition)
    setTimeout(() => {
      window.location.href = `/${currentProject.slug}`;
    }, 400);
  };

  return (
    <>
      {/* Initial loading screen */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: loading ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
          >
            <motion.div
              className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            >
              <motion.div
                className="absolute inset-0 blur-3xl"
                animate={{
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ backgroundColor: '#ffffff' }}
              />
              <motion.div
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: [0.97, 1, 0.97],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <MigrateChartLogo color="#ffffff" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition loading overlay */}
      <AnimatePresence>
        {isTransitioning && currentProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            <TokenLoadingLogo
              svgUrl={currentProject.loaderUrl}
              color={currentProject.primaryColor}
              isLoading={true}
              slug={currentProject.slug}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!showLoader && currentProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
          className="fixed inset-0 overflow-hidden bg-black text-white"
        >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={currentProject.slug}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0.0, 0.2, 1]
          }}
          className="absolute inset-0"
        >
          {/* Dynamic Background */}
          <DynamicBackground color={currentProject.primaryColor} />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center px-6">
            {/* Logo */}
            <motion.div
              className="mb-12"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <MigrateChartLogo color={currentProject.primaryColor} />
            </motion.div>

            {/* Token Logo - Uniform sizing with optimized SVGs */}
            <div className="relative mb-8 flex items-center justify-center">
              <div
                className="absolute w-64 h-64 md:w-80 md:h-80 blur-3xl opacity-20 transition-colors duration-500"
                style={{ backgroundColor: currentProject.primaryColor }}
              />
              <img
                src={currentProject.loaderUrl}
                alt={`${currentProject.name} logo`}
                className="relative object-contain h-48 md:h-64 w-auto"
                style={{
                  filter: `drop-shadow(0 0 20px ${currentProject.primaryColor}80) drop-shadow(0 0 40px ${currentProject.primaryColor}40)`,
                }}
              />
            </div>

            {/* Token Name with letter spacing animation */}
            <h1
              className="text-6xl md:text-8xl font-bold mb-4 tracking-tight transition-all duration-500"
              style={{
                color: currentProject.primaryColor,
                textShadow: `0 0 40px ${currentProject.primaryColor}40`
              }}
            >
              {currentProject.name}
            </h1>

            {/* CTA Button with enhanced glow */}
            <Link
              href={`/${currentProject.slug}`}
              onClick={handleTrackClick}
              className="group relative px-12 py-5 font-mono font-bold text-xl rounded-none overflow-hidden inline-flex items-center gap-3 border-2 transition-all duration-300"
              style={{
                backgroundColor: currentProject.primaryColor,
                borderColor: currentProject.primaryColor,
                color: '#000000',
                boxShadow: `0 0 40px ${currentProject.primaryColor}60`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 80px ${currentProject.primaryColor}90, 0 0 120px ${currentProject.primaryColor}50`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 40px ${currentProject.primaryColor}60`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span className="flex items-center gap-3">
                Track
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
              </span>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {projects.length > 1 && (
        <>
          {/* Desktop Arrow Navigation */}
          <div className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)}
              className="p-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all hover:bg-white/10"
              aria-label="Previous token"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % projects.length)}
              className="p-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all hover:bg-white/10"
              aria-label="Next token"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
            {projects.map((project, index) => (
              <button
                key={project.slug}
                onClick={() => setCurrentIndex(index)}
                className="group relative transition-transform hover:scale-125 focus:outline-none"
                aria-label={`View ${project.name}`}
              >
                <div
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${
                    index === currentIndex ? 'w-12' : 'w-2 opacity-50'
                  }`}
                  style={{
                    backgroundColor: index === currentIndex ? currentProject.primaryColor : '#666',
                  }}
                />
              </button>
            ))}
          </div>
        </>
      )}
        </motion.div>
      )}
    </>
  );
}

function DynamicBackground({ color }: { color: string }) {
  return (
    <>
      {/* Base gradient */}
      <div
        className="absolute inset-0 opacity-20 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${color}, transparent 70%)`,
        }}
      />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 transition-colors duration-1000"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_100%)] opacity-60" />
    </>
  );
}

function MigrateChartLogo({ color }: { color: string }) {
  return (
    <svg
      className="w-24 h-24 md:w-32 md:h-32"
      style={{
        color: color,
        filter: `drop-shadow(0 0 20px ${color}99) drop-shadow(0 0 40px ${color}66)`,
      }}
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
  );
}

