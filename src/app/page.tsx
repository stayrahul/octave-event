"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import Image from 'next/image';
import { ArrowLeft, Crosshair, MapPin, Calendar, Trophy, FileText, CheckCircle, Flame, Zap, Instagram, Ticket, Share2, Users, ChevronDown, ChevronRight, AlertTriangle, Gamepad2, Lightbulb, MessageSquare, Mail, Rocket } from 'lucide-react';
import Countdown from './components/Countdown';

const Tiktok = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface Stats {
  pubg: number;
  ai: number;
}

function LiveCounter({ count, max, label, icon: Icon, className }: { count: number | null, max: number, label: string, icon: any, className: string }) {
  const pct = count !== null ? Math.min((count / max) * 100, 100) : 0;
  const urgent = pct >= 50;
  return (
    <div className={`px-4 py-3 rounded-2xl inline-flex flex-col gap-2 font-mono text-xs md:text-sm border w-full ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {count !== null ? `${count} / ${max} ${label}` : "Loading live stats..."}
        {urgent && count !== null && (
          <span className="ml-auto text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
            Filling Fast!
          </span>
        )}
      </div>
      {count !== null && (
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${urgent ? 'bg-red-400' : 'bg-current'}`}
          />
        </div>
      )}
    </div>
  );
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "tween" as const, duration: 0.15, ease: "easeOut" } }
};

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'faq' | 'sponsors'>('overview');
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for the splash screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll progress and parallax
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Cursor glow state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tabs: Array<'overview' | 'faq' | 'sponsors'> = ['overview', 'faq', 'sponsors'];

  const handleTabChange = useCallback((tab: 'overview' | 'faq' | 'sponsors') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Keyboard navigation: ArrowRight / ArrowLeft to switch tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        setActiveTab(prev => {
          const idx = tabs.indexOf(prev);
          const next = e.key === 'ArrowRight'
            ? tabs[(idx + 1) % tabs.length]
            : tabs[(idx - 1 + tabs.length) % tabs.length];
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleShare = async () => {
    // 1. Try native Web Share API (requires HTTPS)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Runway Career Connect',
          text: "Join me at Nepal's biggest event featuring a PUBG Mobile Tournament & AI Workshop!",
          url: window.location.href,
        });
        return; // If native share succeeds, exit early
      } catch (err) {
        console.error("Error with native share:", err);
      }
    }

    // 2. Try modern Clipboard API (requires HTTPS or localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (err) {
        console.error("Failed to copy via clipboard API:", err);
      }
    }

    // 3. Legacy Fallback (Works on insecure local network IPs like 192.168.x.x)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Legacy copy failed:", err);
      alert("Please copy the URL manually: " + window.location.href);
    }
  };

  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/stats')
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error("Error fetching stats:", err));
    };

    fetchStats(); // Fetch immediately on mount

    // Poll every 60 seconds for live updates
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const url = `/api/visitors?increment=true`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data.count === 'number') {
            setVisitorCount(data.count);
          }
        }
      } catch (error) {
        console.error('Error tracking visitor count:', error);
      }
    };

    trackVisitor();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-orange-500/30 overflow-x-hidden font-sans">

      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Elegant Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center"
            >
              {/* Image Container with elegant outer pulse */}
              <div className="relative mb-8">
                {/* Outer animating ring */}
                <motion.div
                  className="absolute inset-[-15px] rounded-full border border-orange-500/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative w-28 h-28 rounded-full overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-[0_0_40px_rgba(249,115,22,0.15)] flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="The Octave Alliance Logo"
                    fill
                    className="object-cover scale-105"
                    priority
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <h1 className="text-2xl md:text-4xl font-display font-black tracking-[0.2em] uppercase text-white mb-1">
                  The Octave Alliance
                </h1>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="h-px w-8 bg-white"></div>
                  <p className="text-[10px] md:text-xs uppercase tracking-widest font-mono">
                    By Runway Career Connect
                  </p>
                  <div className="h-px w-8 bg-white"></div>
                </div>
              </div>

              {/* Minimal Progress indicator */}
              <div className="mt-12 w-64 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-orange-500 to-orange-500 rounded-full"
                />
              </div>

              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="mt-4 text-[10px] text-white/30 uppercase tracking-[0.3em] font-mono"
              >
                Loading Experience
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Cursor Glow (Desktop Only) */}
      <div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300 hidden lg:block"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`
        }}
      />

      {/* Page Entrance Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="contents"
      >

        {/* Enhanced Background Gradients */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 60, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="fixed top-[-15%] left-[-10%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-orange-600/15 rounded-full blur-[120px] md:blur-[160px] pointer-events-none z-0 mix-blend-screen"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -60, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="fixed bottom-[-15%] right-[-10%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-purple-600/15 rounded-full blur-[120px] md:blur-[160px] pointer-events-none z-0 mix-blend-screen"
        />

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/50 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-4 md:px-12 h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center justify-between w-full md:w-auto h-full">
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('overview')}>
                  <Image
                    src="/logo.png"
                    alt="The Octave Alliance Logo"
                    width={36}
                    height={36}
                    className="w-7 h-7 md:w-9 md:h-9 rounded-full shrink-0 overflow-hidden object-cover"
                    priority
                  />
                  <div className="flex flex-col">
                    <span className="text-sm md:text-xl font-display font-black tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent underline underline-offset-4 decoration-orange-500 whitespace-nowrap drop-shadow-md leading-none">
                      THE OCTAVE ALLIANCE
                    </span>
                    <a href="https://www.runwaycareerconnect.com" target="_blank" rel="noopener noreferrer" className="text-[8px] md:text-[10px] text-white/50 uppercase tracking-widest font-bold mt-1.5 hover:text-orange-400 transition-colors leading-none hidden md:block">
                      By Runway Career Connect
                    </a>
                  </div>
                </div>
              </div>

              {/* Share Button (Mobile) */}
              <button
                onClick={handleShare}
                className="md:hidden flex items-center justify-center p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4 text-white/70" />}
              </button>
            </div>
          </div>

          {/* Mobile / Desktop Tab Navigation */}
          <div className="relative max-w-7xl mx-auto md:absolute md:top-0 md:right-12 md:h-20 flex items-center justify-end">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0A0A0A]/50 to-transparent pointer-events-none md:hidden z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A0A0A]/50 to-transparent pointer-events-none md:hidden z-10" />
            <nav className="flex-1 md:flex-none px-4 md:px-0 flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar border-t md:border-none border-white/5 pt-3 pb-4 md:py-0 text-xs md:text-sm font-medium tracking-widest text-white/50 whitespace-nowrap">
              <button
                onClick={() => handleTabChange('overview')}
                className={`relative px-4 py-2 transition-colors uppercase z-10 rounded-full ${activeTab === 'overview' ? 'text-white font-bold' : 'hover:text-white'}`}
              >
                Overview
                {activeTab === 'overview' && (
                  <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-white/20 rounded-full -z-10" />
                )}
              </button>

              <button
                onClick={() => handleTabChange('faq')}
                className={`relative px-4 py-2 transition-colors uppercase z-10 rounded-full ${activeTab === 'faq' ? 'text-blue-400 font-bold' : 'hover:text-blue-400'}`}
              >
                FAQ
                {activeTab === 'faq' && (
                  <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-blue-500/20 rounded-full -z-10" />
                )}
              </button>
              <button
                onClick={() => handleTabChange('sponsors')}
                className={`relative px-4 py-2 transition-colors uppercase z-10 rounded-full ${activeTab === 'sponsors' ? 'text-green-400 font-bold' : 'hover:text-green-400'}`}
              >
                Sponsors
                {activeTab === 'sponsors' && (
                  <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-green-500/20 rounded-full -z-10" />
                )}
              </button>

              {/* Share Button (Desktop) */}
              <button
                onClick={handleShare}
                className="hidden md:flex items-center gap-2 px-4 py-2 ml-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all shadow-lg"
              >
                {copied ? (
                  <><CheckCircle className="w-4 h-4 text-green-400" /> <span className="text-green-400">Copied!</span></>
                ) : (
                  <><Share2 className="w-4 h-4" /> <span>Share</span></>
                )}
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative pt-36 pb-20 md:pt-40 md:pb-24 px-4 md:px-12 max-w-7xl mx-auto relative z-10 min-h-screen">
          <div className="max-w-7xl mx-auto">

            <AnimatePresence mode="wait">

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-10 text-center md:text-left">
                    <div className="flex flex-wrap justify-center md:justify-start gap-2.5 mb-6">
                      <div className="inline-flex gap-1.5 items-center bg-white/5 hover:bg-white/10 transition-colors px-2.5 py-1 rounded-full border border-white/10 cursor-default shadow-lg">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                        </span>
                        <span className="text-[8px] text-white/60 font-mono tracking-wider mt-[1px]">LIVE SYNC ACTIVE</span>
                      </div>
                      {visitorCount !== null && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="inline-flex gap-1.5 items-center bg-white/5 hover:bg-white/10 transition-colors px-2.5 py-1 rounded-full border border-white/10 cursor-default shadow-lg"
                        >
                          <Users className="w-3.5 h-3.5 text-orange-500" />
                          <span className="text-[8px] text-white/60 font-mono tracking-wider mt-[0.5px]">
                            {visitorCount.toLocaleString()} VISITORS
                          </span>
                        </motion.div>
                      )}
                    </div>
                    <motion.div style={{ y: heroY, opacity: heroOpacity }}>
                      <h1 className="text-[2.5rem] leading-[1.05] md:leading-[1.1] md:text-7xl font-display font-black tracking-tighter mb-4 md:mb-6 drop-shadow-2xl">
                        EMPOWERING YOUTH THROUGH<br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-orange-400 via-amber-200 to-purple-400 bg-clip-text text-transparent italic drop-shadow-[0_0_15px_rgba(251,191,36,0.2)]"> TECH & ESPORTS</span>
                      </h1>
                      <p className="text-white/40 text-xs md:text-lg uppercase tracking-[0.2em] max-w-2xl mx-auto md:mx-0">
                        Welcome to The Octave Alliance
                      </p>
                    </motion.div>

                    {/* Scroll hint */}
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="flex justify-center md:justify-start pt-4"
                    >
                      <ChevronDown className="w-6 h-6 text-white/20" />
                    </motion.div>
                  </div>

                  {/* About Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mt-12 mb-16 max-w-6xl mx-auto px-4"
                  >
                    <div className="relative p-[1px] rounded-[2rem] overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-purple-500/10 to-amber-500/30 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <div className="relative bg-[#0A0A0A]/90 backdrop-blur-2xl rounded-[calc(2rem-1px)] p-6 md:p-12 border border-white/10 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">

                        {/* Glow effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-orange-500/10 to-purple-500/10 blur-[80px] pointer-events-none"></div>

                        {/* Text Side */}
                        <div className="flex-1 text-center lg:text-left z-10">
                          <div className="flex flex-col lg:flex-row items-center gap-3 mb-4 justify-center lg:justify-start">
                            <div className="inline-block px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(234,88,12,0.2)]">
                              Who We Are
                            </div>
                            <a href="https://www.runwaycareerconnect.com" target="_blank" rel="noopener noreferrer" className="group/parent inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs font-bold tracking-widest uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                              An initiative by Runway Career Connect
                            </a>
                          </div>
                          <h2 className="text-3xl md:text-5xl font-display font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-white leading-tight">
                            We Are <br className="hidden lg:block" />
                            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">The Octave Alliance</span>
                          </h2>
                          <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 font-medium">
                            Operating under <a href="https://www.runwaycareerconnect.com" target="_blank" rel="noopener noreferrer" className="text-white font-bold hover:text-orange-400 transition-colors underline underline-offset-2">Runway Career Connect</a>—Nepal's largest youth career mentorship platform—we are a community-driven organization dedicated to empowering the next generation. We bridge the gap between raw talent and real-world opportunities by curating high-impact tech masterclasses, competitive esports tournaments, and digital skill-building events.
                          </p>
                          <p className="text-white/50 text-sm md:text-base leading-relaxed">
                            Through our dynamic events, we aim to inspire creativity, foster leadership, and build a network of future innovators and digital leaders in Nepal.
                          </p>
                        </div>

                        {/* Features Side */}
                        <div className="w-full lg:w-[45%] flex flex-col gap-4 z-10">
                          <div className="group/item flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all duration-300">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 text-orange-400 shrink-0 group-hover/item:scale-110 group-hover/item:rotate-3 transition-transform shadow-[0_0_20px_rgba(234,88,12,0.15)]">
                              <Crosshair className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-white text-base mb-1">Esports Excellence</h3>
                              <p className="text-xs md:text-sm text-white/50">Organizing highly competitive grids and fostering raw gaming talent.</p>
                            </div>
                          </div>

                          <div className="group/item flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all duration-300">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/20 text-purple-400 shrink-0 group-hover/item:scale-110 group-hover/item:-rotate-3 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                              <Zap className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-white text-base mb-1">Tech Masterclasses</h3>
                              <p className="text-xs md:text-sm text-white/50">Hands-on workshops in AI, digital marketing, and emerging tech.</p>
                            </div>
                          </div>

                          <div className="group/item flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-green-500/40 hover:bg-green-500/5 transition-all duration-300">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 text-green-400 shrink-0 group-hover/item:scale-110 group-hover/item:rotate-3 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                              <Users className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-white text-base mb-1">Community First</h3>
                              <p className="text-xs md:text-sm text-white/50">Building a strong network of passionate youth and future leaders.</p>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>

                  {/* Our Impact Statistics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="max-w-6xl mx-auto px-4 mb-20"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      {[
                        { label: 'Students Impacted', value: '500+', icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                        { label: 'Masterclasses', value: '10+', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { label: 'Esports Events', value: '15+', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                        { label: 'Community Members', value: '2K+', icon: MessageSquare, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                      ].map((stat, i) => (
                        <div key={i} className="group flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:scale-105 transition-all duration-300 relative overflow-hidden">
                          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-20 ${stat.bg} group-hover:opacity-40 transition-opacity`}></div>
                          <stat.icon className={`w-8 h-8 mb-4 ${stat.color} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all`} />
                          <h3 className="text-3xl md:text-5xl font-display font-black text-white mb-2 tabular-nums tracking-tighter">{stat.value}</h3>
                          <p className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest font-bold text-center">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Upcoming Initiatives */}
                  <div className="mb-20 max-w-6xl mx-auto px-4">
                    <div className="text-center mb-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(234,88,12,0.2)]">
                        <Rocket className="w-3 h-3 animate-pulse" />
                        What's Next
                      </div>
                      <h2 className="text-3xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-white">
                        Upcoming Initiatives
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Upcoming Masterclass */}
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="group relative p-[1px] rounded-[2rem] overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/50 to-orange-500/10 opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-full bg-[#0A0A0A]/90 backdrop-blur-xl rounded-[calc(2rem-1px)] p-8 border border-white/10 overflow-hidden">
                          <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/20 rounded-full blur-[60px] group-hover:bg-amber-500/30 transition-colors"></div>
                          
                          <div className="inline-block px-3 py-1 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold tracking-widest uppercase mb-6 border border-amber-500/30">
                            Coming Soon
                          </div>
                          
                          <Lightbulb className="w-10 h-10 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
                          
                          <h3 className="text-2xl font-display font-black text-white mb-3">AI & Web3 Masterclass</h3>
                          <p className="text-sm text-white/50 mb-8 leading-relaxed">
                            Dive deep into the future of technology with industry leaders. Learn practical skills in artificial intelligence and decentralized web technologies.
                          </p>
                          
                          <button className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white/50 font-bold uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all cursor-not-allowed">
                            Registrations Opening Soon
                          </button>
                        </div>
                      </motion.div>

                      {/* Upcoming Esports */}
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="group relative p-[1px] rounded-[2rem] overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 to-pink-500/10 opacity-30 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-full bg-[#0A0A0A]/90 backdrop-blur-xl rounded-[calc(2rem-1px)] p-8 border border-white/10 overflow-hidden">
                          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-[60px] group-hover:bg-purple-500/30 transition-colors"></div>
                          
                          <div className="inline-block px-3 py-1 rounded-md bg-purple-500/20 text-purple-400 text-[10px] font-bold tracking-widest uppercase mb-6 border border-purple-500/30">
                            Planning Phase
                          </div>
                          
                          <Gamepad2 className="w-10 h-10 text-purple-500 mb-6 group-hover:scale-110 transition-transform" />
                          
                          <h3 className="text-2xl font-display font-black text-white mb-3">Valorant Open Cup</h3>
                          <p className="text-sm text-white/50 mb-8 leading-relaxed">
                            Gear up for the most intense tactical shooter tournament of the year. Gather your squad and compete for the ultimate prize pool and glory.
                          </p>
                          
                          <button className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white/50 font-bold uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all cursor-not-allowed">
                            Stay Tuned
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Past Events Section */}
                  <div className="mt-8 mb-12">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">Past Events</h2>
                      <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                      {/* PUBG Card (Past) */}
                      <div
                        className="relative group border border-orange-500/20 bg-[#0A0A0A]/40 backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-between overflow-hidden transition-all duration-500 text-left"
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-2 border-red-500/80 text-red-500/80 font-black text-2xl uppercase px-4 py-2 rounded-lg opacity-70 pointer-events-none z-50 whitespace-nowrap bg-[#0A0A0A]/50 backdrop-blur-sm">
                          CANCELED
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                          <Flame className="w-12 h-12 text-orange-500" />
                        </div>

                        <div className="relative z-10">
                          <div className="inline-block px-2 py-0.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500/80 text-[8px] font-bold tracking-widest uppercase mb-3">
                            Esports Tournament
                          </div>
                          <h3 className="text-xl font-display font-bold mb-2 leading-tight opacity-40">Winner Winner<br />Runway Dinner</h3>
                          <div className="space-y-1.5 opacity-40">
                            <div className="flex items-center gap-2 text-white/50">
                              <Calendar className="w-3 h-3 text-orange-500/80" />
                              <span className="text-[10px] font-mono">2083 / 03 / 17</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/50">
                              <MapPin className="w-3 h-3 text-orange-500/80" />
                              <span className="text-[10px]">NCMT COLLEGE, SAMAKHUSHI</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Card (Past) */}
                      <div
                        className="relative group border border-purple-500/20 bg-[#0A0A0A]/40 backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-between overflow-hidden transition-all duration-500 text-left"
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-2 border-green-500/80 text-green-500/80 font-black text-2xl uppercase px-4 py-2 rounded-lg opacity-70 pointer-events-none z-50 whitespace-nowrap bg-[#0A0A0A]/50 backdrop-blur-sm">
                          COMPLETED
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12">
                          <Zap className="w-12 h-12 text-purple-500" />
                        </div>

                        <div className="relative z-10">
                          <div className="inline-block px-2 py-0.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-500/80 text-[8px] font-bold tracking-widest uppercase mb-3">
                            Masterclass Workshop
                          </div>
                          <h3 className="text-xl font-display font-bold mb-2 leading-tight opacity-50">Digital Marketing<br />with AI</h3>
                          <div className="space-y-1.5 opacity-50">
                            <div className="flex items-center gap-2 text-white/50">
                              <Calendar className="w-3 h-3 text-purple-500/80" />
                              <span className="text-[10px] font-mono">15 ASAR 2083</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/50">
                              <MapPin className="w-3 h-3 text-purple-500/80" />
                              <span className="text-[10px]">Venue: LBEF college, Maiti Devi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>



                </motion.div>
              )}


              {/* FAQ TAB */}
              {activeTab === 'faq' && (
                <motion.div
                  key="faq"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, x: -10, transition: { duration: 0.1 } },
                    show: { opacity: 1, x: 0, transition: { staggerChildren: 0.02, delayChildren: 0, duration: 0.15 } }
                  } as any}
                  className="max-w-4xl mx-auto space-y-6"
                >
                  <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black mb-8 text-center bg-gradient-to-r from-blue-400 via-cyan-400 to-white bg-clip-text text-transparent">
                    Frequently Asked Questions
                  </motion.h2>

                  {[
                    { q: "What is The Octave Alliance?", a: "The Octave Alliance is a community-driven organization focused on empowering youth through tech workshops, esports tournaments, and digital skill-building events." },
                    { q: "Are your events free to attend?", a: "Yes! The majority of our events, including past esports tournaments and AI workshops, are completely free. However, spots are usually limited, so early registration is highly recommended." },
                    { q: "How can I participate in future events?", a: "The best way to stay updated on our upcoming tournaments, masterclasses, and workshops is to follow us on Instagram (@theoctavealliance) and TikTok (@the0ctave). We announce all our registrations there!" },
                    { q: "Do you provide certificates for your workshops?", a: "Yes! We provide digital Certificates of Participation for attendees who successfully complete our hands-on tech and marketing workshops." },
                    { q: "I'm a beginner. Can I still join your tech workshops?", a: "Absolutely. Our workshops are designed to be accessible to beginners. For instance, our Digital Marketing with AI workshop started from the absolute basics, requiring only curiosity and a laptop." },
                    { q: "Do I need to bring my own equipment?", a: "It depends on the event. For esports tournaments, we typically ask players to bring their own mobile devices and chargers. For tech workshops, bringing a fully charged laptop is usually required." },
                    { q: "Can I volunteer or join The Octave Alliance?", a: "We are always looking for passionate individuals to join our crew! If you're interested in volunteering at our events or joining the core team, DM us on our Instagram page." },
                    { q: "How do I contact the organizers?", a: "You can reach us via our Instagram page @theoctavealliance or DM us on TikTok @the0ctave." }
                  ].map((faq, i) => (
                    <motion.details key={i} variants={fadeUp} className="group bg-white/5 border border-white/10 rounded-2xl p-6 open:bg-blue-500/10 open:border-blue-500/30 transition-colors cursor-pointer">
                      <summary className="font-bold text-lg text-white group-open:text-blue-400 outline-none flex justify-between items-center list-none">
                        {faq.q}
                        <ChevronDown className="w-5 h-5 shrink-0 ml-4 group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-4 text-white/60 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.details>
                  ))}
                </motion.div>
              )}

              {/* SPONSORS TAB */}
              {activeTab === 'sponsors' && (
                <motion.div
                  key="sponsors"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, x: -10, transition: { duration: 0.1 } },
                    show: { opacity: 1, x: 0, transition: { staggerChildren: 0.05, delayChildren: 0, duration: 0.15 } }
                  } as any}
                  className="max-w-5xl mx-auto text-center"
                >
                  <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black mb-12 bg-gradient-to-r from-green-400 via-emerald-400 to-white bg-clip-text text-transparent">
                    Our Proud Partners
                  </motion.h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Title Sponsor */}
                    <motion.div variants={fadeUp} className="md:col-span-3 p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-300 group">
                      <p className="text-xs text-green-400 uppercase tracking-[0.3em] font-bold mb-4">Organized By</p>
                      <div className="h-32 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100">
                        <h3 className="text-4xl font-black tracking-tighter text-white"><span className="text-green-500">The Octave Alliance</span></h3>
                      </div>
                    </motion.div>

                    {/* Partners */}
                    {[
                      { name: "Octave Cluster Crew", role: "Presented By" },
                      { name: "The Octave Alliance", role: "Supported By" }
                    ].map((s, i) => (
                      <motion.div key={i} variants={fadeUp} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-300 group">
                        <p className="text-[10px] text-emerald-400 uppercase tracking-[0.2em] font-bold mb-4">{s.role}</p>
                        <div className="h-20 flex items-center justify-center">
                          <p className="text-xl font-bold text-white/60 group-hover:text-white transition-colors">{s.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.p variants={fadeUp} className="mt-10 text-white/30 text-sm">
                    Interested in sponsoring The Octave Alliance? <a href="https://www.instagram.com/theoctavealliance" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline underline-offset-4 transition-colors">Get in touch →</a>
                  </motion.p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>

        {/* Social Media Links Section */}
        <section className="py-8 border-t border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center justify-center">
            <p className="text-sm text-white/40 uppercase tracking-[0.3em] mb-6">Connect With Us</p>
            <div className="flex items-center gap-8 text-white/60">
              <a href="https://www.instagram.com/theoctavealliance?igsh=MWh5bGVhcGh3M3BjYQ==" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-gradient-to-br hover:from-pink-500/20 hover:to-orange-500/20 hover:text-white hover:border-pink-500/30 border border-transparent transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@the0ctave?_r=1&_t=ZS-97U33G1nWJb" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all border border-transparent hover:border-white/20">
                <Tiktok className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-4 px-4 md:px-12 flex flex-col md:flex-row items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-2xl border-t border-white/10 relative z-10 gap-4">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono">
              &copy; {new Date().getFullYear()} Organized by the <span className="text-white/80 font-bold">Octave Cluster Crew</span>
            </p>
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono">
              An Initiative by <a href="https://www.runwaycareerconnect.com" target="_blank" rel="noopener noreferrer" className="text-white/50 font-bold hover:text-white transition-colors underline underline-offset-2">Runway Career Connect</a>
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">

            <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest flex items-center gap-2">
              <span>Developed by</span>
              <a
                href="https://instagram.com/stayrahul"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all overflow-hidden flex items-center justify-center shadow-lg"
              >
                <span className="relative z-10 font-bold italic bg-gradient-to-r from-orange-400 via-white to-purple-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  SUSHANT
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
              </a>
            </div>
          </div>
        </footer>
        {/* Floating Back Button */}
        <AnimatePresence>
          {
            activeTab !== 'overview' && (
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                onClick={() => handleTabChange('overview')}
                className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl backdrop-blur-xl transition-all border group cursor-pointer ${activeTab === 'faq' ? 'bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                  }`}
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold tracking-widest uppercase text-xs">Back</span>
              </motion.button>
            )
          }
        </AnimatePresence>

        {/* Scroll to Top Button (Overview only) */}
        <AnimatePresence>
          {activeTab === 'overview' && showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] p-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/20 shadow-2xl transition-colors cursor-pointer"
              aria-label="Scroll to top"
            >
              <ChevronDown className="w-5 h-5 rotate-180" />
            </motion.button>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
