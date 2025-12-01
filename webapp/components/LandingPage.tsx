'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

interface ProjectListItem {
  slug: string;
  name: string;
  primaryColor: string;
  logoUrl: string;
  loaderUrl: string;
}

export default function LandingPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const minDisplayTime = 1200;

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
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        setTimeout(() => setLoading(false), remainingTime);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="fixed inset-0 bg-black" suppressHydrationWarning>
      {/* Loading Screen - no exit animation, just instant hide */}
      {loading && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <MigrateChartLogoLoading />
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="fixed inset-0 overflow-auto">
          {/* Animated Background Orbs */}
          <motion.div
            className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] opacity-15"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 3,
            }}
          />

          {/* Texture Overlay */}
          <div
            className="fixed inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Dot Grid Pattern */}
          <div
            className="fixed inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Vignette */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_100%)] opacity-40 pointer-events-none" />

          {/* Content Container */}
          <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 relative">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 md:mb-12 text-center"
            >
              <div className="flex items-center justify-center mb-4">
                <MigrateChartLogoHeader />
              </div>
              <motion.h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 tracking-tight"
                style={{
                  textShadow: '0 0 40px rgba(255,255,255,0.1)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                Track Token Migrations
              </motion.h1>
              <motion.p
                className="text-sm md:text-base text-white/50 tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                Complete price history across all pool transitions
              </motion.p>
            </motion.div>

            {/* Token Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-6xl"
            >
              <div
                className="grid gap-4 md:gap-6 lg:gap-8"
                style={{
                  gridTemplateColumns: projects.length <= 4
                    ? `repeat(${Math.min(projects.length, 4)}, 1fr)`
                    : 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
                }}
              >
                {projects.map((project, index) => (
                  <TokenCard
                    key={project.slug}
                    project={project}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-8 md:mt-12 text-center"
            >
              <p className="text-xs text-white/30 tracking-widest uppercase">
                Real-time data • Seamless tracking • Built for traders
              </p>
            </motion.div>
          </div>
      </div>
    </div>
  );
}

interface TokenCardProps {
  project: ProjectListItem;
  index: number;
}

function TokenCard({ project, index }: TokenCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/${project.slug}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative block aspect-square"
      >
        {/* Background Gradient */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${project.primaryColor}40 0%, transparent 50%)`,
          }}
        />

        {/* Spotlight Effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${project.primaryColor}20 0%, transparent 60%)`,
          }}
        />

        {/* Hover Glow Ring */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: `inset 0 0 80px ${project.primaryColor}25, 0 0 100px ${project.primaryColor}15`,
          }}
        />

        {/* Glassmorphic Border Frame */}
        <div
          className="absolute inset-0 border backdrop-blur-sm transition-all duration-500 bg-gradient-to-br from-white/5 to-transparent"
          style={{
            borderColor: isHovered ? `${project.primaryColor}CC` : '#262626',
            borderWidth: isHovered ? '2px' : '1px',
            boxShadow: isHovered ? `0 0 30px ${project.primaryColor}40` : 'none',
          }}
        />

        {/* Token Logo */}
        <div className="relative w-full h-full flex items-center justify-center p-8 md:p-10 lg:p-12">
          <motion.div
            animate={{
              scale: isHovered ? 1.15 : 1,
              filter: isHovered
                ? `drop-shadow(0 0 40px ${project.primaryColor}80) drop-shadow(0 0 80px ${project.primaryColor}40)`
                : 'drop-shadow(0 0 10px rgba(255,255,255,0.1))',
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-full"
          >
            <img
              src={project.loaderUrl}
              alt={project.name}
              className="w-full h-full object-contain"
              style={{
                filter: isHovered ? 'brightness(1.3) contrast(1.1)' : 'brightness(1.05)',
                transition: 'filter 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          </motion.div>
        </div>

        {/* Token Name Overlay on Hover */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-4 text-center backdrop-blur-xl bg-black/60 border-t"
          style={{
            borderColor: `${project.primaryColor}40`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="text-sm md:text-base font-bold tracking-wide"
            style={{
              color: project.primaryColor,
              textShadow: `0 0 20px ${project.primaryColor}60`,
            }}
          >
            {project.name}
          </p>
        </motion.div>

        {/* Scanline Effect on Hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Corner Accent */}
        <div
          className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${project.primaryColor}20 0%, transparent 100%)`,
          }}
        />
      </Link>
    </motion.div>
  );
}

function MigrateChartLogoLoading() {
  return (
    <svg
      className="w-32 h-32 md:w-40 md:h-40"
      viewBox="57 135 388 232"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Migrate Chart"
      style={{
        filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
      }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.g
        fill="#ffffff"
        filter="url(#glow)"
        animate={{
          opacity: [1, 0.6, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <path d="M135.423309,290.383972 C135.222244,292.157013 134.849457,293.929749 134.846222,295.703156 C134.806274,317.680511 134.820129,339.657990 134.820129,361.635437 C134.820129,363.432007 134.820129,365.228577 134.820129,367.319092 C108.857216,367.319092 83.287056,367.319092 57.352207,367.319092 C57.352207,341.704376 57.352207,316.037659 57.352207,289.918823 C83.140572,289.918823 108.899254,289.918823 135.063660,290.174957 C135.469360,290.431091 135.423309,290.383972 135.423309,290.383972z" />
        <path d="M290.364258,290.336945 C290.217560,292.805908 289.947449,295.274719 289.943604,297.743896 C289.910065,319.238007 289.924225,340.732239 289.924225,362.226410 C289.924225,363.852112 289.924225,365.477844 289.924225,367.357361 C263.907196,367.357361 238.310226,367.357361 211.965073,367.357361 C211.965073,341.967926 211.965073,316.566803 211.812134,290.761261 C211.659195,290.356812 211.589157,290.420380 211.589157,290.420380 C213.204071,290.267975 214.818726,289.985748 216.433914,289.982635 C240.827682,289.935608 265.221497,289.925293 290.014832,290.152710 C290.414307,290.399109 290.364258,290.336945 290.364258,290.336945z" />
        <path d="M445.290466,169.000153 C445.290466,183.634445 445.290466,197.768707 445.290466,212.257187 C419.463715,212.257187 393.941895,212.257187 368.161346,212.257187 C368.161346,186.667191 368.161346,161.109375 368.161346,135.257370 C393.655151,135.257370 419.195465,135.257370 445.290466,135.257370 C445.290466,146.339661 445.290466,157.419907 445.290466,169.000153z" />
        <path d="M135.497192,290.448730 C135.251816,289.392853 134.742188,288.319763 134.740173,287.245728 C134.695267,263.252930 134.703552,239.260025 134.718506,215.267151 C134.719009,214.463577 134.893936,213.660110 135.013840,212.631134 C160.586761,212.631134 186.014481,212.631134 212.069183,212.631134 C212.069183,238.286774 212.069183,263.867767 211.829163,289.934570 C211.589157,290.420380 211.659195,290.356812 211.677277,290.329926 C186.528381,290.218719 161.361404,290.134399 135.808868,290.217041 C135.423309,290.383972 135.469360,290.431091 135.497192,290.448730z" />
        <path d="M290.446106,290.423218 C290.253357,289.345978 289.834564,288.244904 289.832825,287.143219 C289.795258,263.321381 289.801147,239.499527 289.815552,215.677673 C289.816132,214.720184 289.982727,213.762787 290.090454,212.607132 C315.730774,212.607132 341.153046,212.607132 366.859802,212.607132 C366.859802,238.324921 366.859802,263.892670 366.859802,290.047455 C341.672607,290.047455 316.414978,290.047455 290.760803,290.192200 C290.364258,290.336945 290.414307,290.399109 290.446106,290.423218z" />
        <path d="M445.290466,302.007385 C445.290466,323.963470 445.290466,345.421448 445.290466,367.245850 C419.480499,367.245850 393.966675,367.245850 368.177490,367.245850 C368.177490,341.667480 368.177490,316.112549 368.177490,290.260376 C393.644684,290.260376 419.183838,290.260376 445.290466,290.260376 C445.290466,293.993011 445.290466,297.751160 445.290466,302.007385z" />
      </motion.g>
    </svg>
  );
}

function MigrateChartLogoHeader() {
  return (
    <svg
      className="w-16 h-16 md:w-20 md:h-20"
      viewBox="57 135 388 232"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Migrate Chart"
      style={{
        filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
      }}
    >
      <g fill="#ffffff">
        <path d="M135.423309,290.383972 C135.222244,292.157013 134.849457,293.929749 134.846222,295.703156 C134.806274,317.680511 134.820129,339.657990 134.820129,361.635437 C134.820129,363.432007 134.820129,365.228577 134.820129,367.319092 C108.857216,367.319092 83.287056,367.319092 57.352207,367.319092 C57.352207,341.704376 57.352207,316.037659 57.352207,289.918823 C83.140572,289.918823 108.899254,289.918823 135.063660,290.174957 C135.469360,290.431091 135.423309,290.383972 135.423309,290.383972z" />
        <path d="M290.364258,290.336945 C290.217560,292.805908 289.947449,295.274719 289.943604,297.743896 C289.910065,319.238007 289.924225,340.732239 289.924225,362.226410 C289.224225,363.852112 289.924225,365.477844 289.924225,367.357361 C263.907196,367.357361 238.310226,367.357361 211.965073,367.357361 C211.965073,341.967926 211.965073,316.566803 211.812134,290.761261 C211.659195,290.356812 211.589157,290.420380 211.589157,290.420380 C213.204071,290.267975 214.818726,289.985748 216.433914,289.982635 C240.827682,289.935608 265.221497,289.925293 290.014832,290.152710 C290.414307,290.399109 290.364258,290.336945 290.364258,290.336945z" />
        <path d="M445.290466,169.000153 C445.290466,183.634445 445.290466,197.768707 445.290466,212.257187 C419.463715,212.257187 393.941895,212.257187 368.161346,212.257187 C368.161346,186.667191 368.161346,161.109375 368.161346,135.257370 C393.655151,135.257370 419.195465,135.257370 445.290466,135.257370 C445.290466,146.339661 445.290466,157.419907 445.290466,169.000153z" />
        <path d="M135.497192,290.448730 C135.251816,289.392853 134.742188,288.319763 134.740173,287.245728 C134.695267,263.252930 134.703552,239.260025 134.718506,215.267151 C134.719009,214.463577 134.893936,213.660110 135.013840,212.631134 C160.586761,212.631134 186.014481,212.631134 212.069183,212.631134 C212.069183,238.286774 212.069183,263.867767 211.829163,289.934570 C211.589157,290.420380 211.659195,290.356812 211.677277,290.329926 C186.528381,290.218719 161.361404,290.134399 135.808868,290.217041 C135.423309,290.383972 135.469360,290.431091 135.497192,290.448730z" />
        <path d="M290.446106,290.423218 C290.253357,289.345978 289.834564,288.244904 289.832825,287.143219 C289.795258,263.321381 289.801147,239.499527 289.815552,215.677673 C289.816132,214.720184 289.982727,213.762787 290.090454,212.607132 C315.730774,212.607132 341.153046,212.607132 366.859802,212.607132 C366.859802,238.324921 366.859802,263.892670 366.859802,290.047455 C341.672607,290.047455 316.414978,290.047455 290.760803,290.192200 C290.364258,290.336945 290.414307,290.399109 290.446106,290.423218z" />
        <path d="M445.290466,302.007385 C445.290466,323.963470 445.290466,345.421448 445.290466,367.245850 C419.480499,367.245850 393.966675,367.245850 368.177490,367.245850 C368.177490,341.667480 368.177490,316.112549 368.177490,290.260376 C393.644684,290.260376 419.183838,290.260376 445.290466,290.260376 C445.290466,293.993011 445.290466,297.751160 445.290466,302.007385z" />
      </g>
    </svg>
  );
}

