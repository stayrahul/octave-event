"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import Image from 'next/image';
import { ArrowLeft, Crosshair, MapPin, Calendar, Trophy, FileText, CheckCircle, Flame, Zap, Instagram, Ticket, Share2, Users, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'pubg' | 'ai' | 'faq' | 'sponsors'>('overview');
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const tabs: Array<'overview' | 'pubg' | 'ai' | 'faq' | 'sponsors'> = ['overview', 'pubg', 'ai', 'faq', 'sponsors'];

  const handleTabChange = useCallback((tab: 'overview' | 'pubg' | 'ai' | 'faq' | 'sponsors') => {
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
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-purple-500 origin-left z-[100]"
        style={{ scaleX }}
      />
      
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
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('overview')}>
                <Image
                  src="/logo.png"
                  alt="Runway Career Connect Logo"
                  width={36}
                  height={36}
                  className="w-7 h-7 md:w-9 md:h-9 rounded-lg shrink-0"
                  priority
                />
                <span className="text-sm md:text-xl font-display font-black tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent underline underline-offset-4 decoration-orange-500 whitespace-nowrap drop-shadow-md">
                  RUNWAY CAREER CONNECT
                </span>
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
              onClick={() => handleTabChange('pubg')}
              className={`relative px-4 py-2 transition-colors uppercase z-10 rounded-full ${activeTab === 'pubg' ? 'text-orange-400 font-bold' : 'hover:text-orange-400'}`}
            >
              PUBG Grid
              {activeTab === 'pubg' && (
                <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-orange-500/20 rounded-full -z-10" />
              )}
            </button>
            <button
              onClick={() => handleTabChange('ai')}
              className={`relative px-4 py-2 transition-colors uppercase z-10 rounded-full ${activeTab === 'ai' ? 'text-purple-400 font-bold' : 'hover:text-purple-400'}`}
            >
              AI Workshop
              {activeTab === 'ai' && (
                <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-purple-500/20 rounded-full -z-10" />
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
                        ELEVATE YOUR SKILLS.<br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-orange-400 via-amber-200 to-purple-400 bg-clip-text text-transparent italic drop-shadow-[0_0_15px_rgba(251,191,36,0.2)]"> DOMINATE THE GRID.</span>
                      </h1>
                      <p className="text-white/40 text-xs md:text-lg uppercase tracking-[0.2em] max-w-2xl mx-auto md:mx-0">
                        Welcome to Runway Career Connect • Choose your arena
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

                  {/* Main Note Banner */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                    className="mb-12 relative rounded-[2.5rem] p-[2px] overflow-hidden group shadow-[0_0_50px_rgba(251,191,36,0.15)]"
                  >
                    {/* Animated Border Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Inner Content */}
                    <div className="relative bg-[#0A0A0A]/80 backdrop-blur-[40px] rounded-[calc(2.5rem-2px)] p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 h-full overflow-hidden border-t border-white/10">

                      {/* Background Glow inside the card */}
                      <div className="absolute top-0 left-1/4 w-full h-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 blur-[100px] rounded-full pointer-events-none transition-all duration-700 group-hover:scale-110"></div>

                      {/* Icon Container with intense glow */}
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 animate-pulse"></div>
                        <div className="relative p-6 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-300/50 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-md">
                          <Ticket className="w-12 h-12 md:w-16 md:h-16 text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,1)] group-hover:-rotate-12 group-hover:scale-110 transition-all duration-500" />
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className="relative z-10 text-center md:text-left flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 rounded-full mb-4 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                          <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
                          <span className="text-amber-300 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">Guaranteed For All</span>
                        </div>

                        <h3 className="font-display font-black text-3xl md:text-6xl uppercase tracking-tighter mb-4 bg-gradient-to-r from-amber-100 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-2xl leading-none">
                          Free Event Ticket
                        </h3>

                        <p className="text-white/80 md:text-lg leading-[2.5] font-medium">
                          Every participant will receive a <strong className="relative inline-block px-3 py-1 mx-1 text-black font-black uppercase tracking-widest text-sm rounded-lg overflow-hidden group/ticket shadow-[0_0_15px_rgba(245,158,11,0.4)] align-middle">
                            <span className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 group-hover/ticket:scale-110 transition-transform duration-500"></span>
                            <span className="relative z-10 drop-shadow-sm">FREE TICKET</span>
                          </strong> to Nepal's biggest event happening on <strong className="text-amber-400 font-black tracking-widest text-lg bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-400/40 inline-block align-middle mx-1 shadow-inner">2083/03/26</strong>!
                        </p>
                      </div>

                      {/* Decorative Watermark */}
                      <Ticket className="absolute -right-12 -bottom-12 w-72 h-72 text-amber-500/10 rotate-12 pointer-events-none" />
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pb-4">
                    {/* PUBG Card (Overview) */}
                    <div
                      className="relative group border border-orange-500/30 bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 text-left cursor-pointer hover:border-orange-500/70 hover:bg-orange-500/10 hover:shadow-[0_0_40px_rgba(234,88,12,0.2)] hover:-translate-y-2"
                      onClick={() => handleTabChange('pubg')}
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                        <Flame className="w-16 h-16 md:w-24 md:h-24 text-orange-500" />
                      </div>

                      <div className="relative z-10">
                        <div className="inline-block px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 text-[10px] font-bold tracking-widest uppercase mb-6">
                          Esports Tournament
                        </div>
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-[1.1]">Winner Winner<br />Runway Dinner</h2>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-white/70">
                            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                            <span className="text-xs md:text-sm font-mono">2083 / 03 / 17</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/70">
                            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                            <span className="text-xs md:text-sm">NCMT COLLEGE, SAMAKHUSHI</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 mt-8">
                        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-between md:items-end mb-4">
                          <div>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Registration Status</p>
                            <p className="text-xl md:text-2xl font-black text-orange-500">🔥 {stats ? stats.pubg : '...'} / 32 <span className="text-xs md:text-sm font-normal text-white/60">SQUADS</span></p>
                          </div>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-display font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_40px_rgba(234,88,12,0.6)] whitespace-nowrap border border-orange-400/20">
                            JOIN GRID
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* AI Card (Overview) */}
                    <div
                      className="relative group border border-purple-500/30 bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 text-left cursor-pointer hover:border-purple-500/70 hover:bg-purple-500/10 hover:shadow-[0_0_40px_rgba(147,51,234,0.2)] hover:-translate-y-2"
                      onClick={() => handleTabChange('ai')}
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12">
                        <Zap className="w-16 h-16 md:w-24 md:h-24 text-purple-500" />
                      </div>

                      <div className="relative z-10">
                        <div className="inline-block px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-500 text-[10px] font-bold tracking-widest uppercase mb-6">
                          Masterclass Workshop
                        </div>
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-[1.1]">Digital Marketing<br />with AI</h2>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-white/70">
                            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                            <span className="text-xs md:text-sm font-mono">15 ASAR 2083</span>
                          </div>
                          <div className="flex items-center gap-3 text-white/70">
                            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                            <span className="text-xs md:text-sm">Venue: LBEF college, Maiti Devi</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 mt-8">
                        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-between md:items-end mb-4">
                          <div>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Available Capacity</p>
                            <p className="text-xl md:text-2xl font-black text-purple-500">⚡ {stats ? stats.ai : '...'} / 50 <span className="text-xs md:text-sm font-normal text-white/60">SEATS</span></p>
                          </div>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-display font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] whitespace-nowrap border border-purple-400/20">
                            RESERVE
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Venue Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-4 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all cursor-default group">
                      <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0 group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-orange-400 uppercase tracking-widest font-bold mb-1 font-mono">PUBG Tournament Venue</p>
                        <h3 className="text-base font-bold text-white mb-1">NCMT College, Samakhushi</h3>
                        <p className="text-xs text-white/50 leading-relaxed">Located in Samakhushi, Kathmandu. Features an open-air tournament arena with full setups. Parking and on-site support available.</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-4 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all cursor-default group">
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 shrink-0 group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold mb-1 font-mono">AI Workshop Venue</p>
                        <h3 className="text-lg font-display font-bold text-white mb-1">LBEF college, Maiti Devi</h3>
                        <p className="text-xs text-white/60 leading-relaxed">Located at LBEF college in Maiti Devi. Features a premium, tech-equipped environment. Location instructions via SMS/email.</p>
                      </div>
                    </div>
                  </motion.div>

                </motion.div>
              )}

              {/* PUBG TAB */}
              {activeTab === 'pubg' && (
                <motion.div
                  key="pubg"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, y: 10, transition: { duration: 0.2, ease: "easeOut" } },
                    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05, delayChildren: 0.1, duration: 0.4, ease: "easeOut" } }
                  } as any}
                  className="max-w-5xl mx-auto"
                >
                  <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    <div className="md:w-1/2 space-y-6">
                      <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black mb-4 leading-tight bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
                        PUBG Mobile Tournament
                      </motion.h2>

                      <motion.div variants={fadeUp} className="inline-flex items-start md:items-center gap-3 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 p-3 rounded-xl">
                        <Ticket className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 md:mt-0 animate-pulse" />
                        <p className="text-sm font-medium text-amber-100/90 leading-tight">
                          Includes a <strong className="text-amber-400 drop-shadow-sm">FREE TICKET</strong> to Nepal's biggest event on 2083/03/26!
                        </p>
                      </motion.div>

                      <motion.div variants={fadeUp}>
                        <Countdown targetDate="2026-07-01T10:00:00" label="Tournament Starts In" />
                      </motion.div>

                      <motion.div variants={fadeUp}>
                        <LiveCounter
                          count={stats?.pubg ?? null}
                          max={32}
                          label="Squads Registered"
                          icon={Flame}
                          className="bg-orange-500/10 text-orange-400 border-orange-500/20"
                        />
                      </motion.div>

                      <motion.div variants={fadeUp} className="space-y-4 md:space-y-6">
                        <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/30 transition-all cursor-default">
                          <Calendar className="w-6 h-6 text-orange-500 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-white text-lg">Event Schedule</p>
                            <div className="text-sm text-white/60 mt-2 space-y-1">
                              <p><span className="text-orange-400 font-mono">10:00 AM</span> - Check-in & Briefing</p>
                              <p><span className="text-orange-400 font-mono">11:00 AM</span> - Matches Commence</p>
                              <p><span className="text-orange-400 font-mono">04:00 PM</span> - Award Ceremony</p>
                            </div>
                          </div>
                        </div>

                        <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/30 transition-all cursor-default">
                          <Trophy className="w-6 h-6 text-orange-500 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-white text-lg">Prize Breakdown (Rs. 10,000)</p>
                            <div className="text-sm text-white/60 mt-2 space-y-1">
                              <p><span className="text-orange-400 font-bold">1st Place:</span> Rs. 5,000 + Trophy</p>
                              <p><span className="text-orange-400 font-bold">2nd Place:</span> Rs. 3,000</p>
                              <p><span className="text-orange-400 font-bold">3rd Place:</span> Rs. 2,000</p>
                            </div>
                          </div>
                        </div>

                        <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/30 transition-all cursor-default">
                          <MapPin className="w-6 h-6 text-orange-500 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-white text-lg">Tournament Venue</p>
                            <p className="text-sm text-white/60 mt-1">NCMT College, Samakhushi, Kathmandu</p>
                            <p className="text-xs text-white/40 mt-1">Physical check-in at the open-air arena. Please bring your QR registration code or email confirmation.</p>
                          </div>
                        </div>

                        <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/30 transition-all cursor-default">
                          <FileText className="w-6 h-6 text-orange-500 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-white text-lg">Rules & Requirements</p>
                            <ul className="text-sm text-white/60 mt-2 space-y-1 list-disc list-inside">
                              <li>Strictly Mobile only (No emulators).</li>
                              <li>Fair play enforcement in place.</li>
                              <li>Bring your own device and charger.</li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div variants={fadeUp} className="md:w-1/2 flex items-start justify-center pt-8 md:pt-0 md:sticky md:top-24 h-fit">
                      <div className="bg-[#0A0A0A]/60 border border-white/20 rounded-3xl p-8 md:p-12 backdrop-blur-[40px] text-center shadow-[0_0_50px_rgba(234,88,12,0.15)] w-full max-w-md relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Flame className="w-20 h-20 text-orange-500 mx-auto mb-6 opacity-80 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                        <h3 className="text-3xl font-black mb-4 relative z-10">Ready to Dominate?</h3>
                        <p className="text-white/60 mb-8 relative z-10">Secure your squad's position. Slots are extremely limited.</p>
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href="https://docs.google.com/forms/d/e/1FAIpQLSeXewi_CsfCyZS3eAERmMhceBDrQL7kYSoJULvT6WbsGdOZ6A/viewform?usp=dialog"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 inline-block w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_40px_rgba(234,88,12,0.6)] uppercase tracking-widest text-sm"
                        >
                          Register Squad Now
                        </motion.a>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* AI WORKSHOP TAB */}
              {activeTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, y: 10, transition: { duration: 0.2, ease: "easeOut" } },
                    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05, delayChildren: 0.1, duration: 0.4, ease: "easeOut" } }
                  } as any}
                  className="max-w-5xl mx-auto"
                >
                  <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    <div className="md:w-1/2 space-y-6">
                      <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black mb-4 leading-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
                        Digital Marketing with AI
                      </motion.h2>

                      <motion.div variants={fadeUp} className="inline-flex items-start md:items-center gap-3 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 p-3 rounded-xl">
                        <Ticket className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 md:mt-0 animate-pulse" />
                        <p className="text-sm font-medium text-amber-100/90 leading-tight">
                          Includes a <strong className="text-amber-400 drop-shadow-sm">FREE TICKET</strong> to Nepal's biggest event on 2083/03/26!
                        </p>
                      </motion.div>

                      <motion.div variants={fadeUp}>
                        <Countdown targetDate="2026-06-29T10:00:00" label="Workshop Starts In" />
                      </motion.div>

                      <motion.div variants={fadeUp}>
                        <LiveCounter
                          count={stats?.ai ?? null}
                          max={50}
                          label="Seats Booked"
                          icon={Zap}
                          className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                        />
                      </motion.div>

                      <motion.div variants={fadeUp} className="space-y-4 md:space-y-6">
                        <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 transition-all cursor-default">
                          <Calendar className="w-6 h-6 text-purple-500 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-white text-lg">Workshop Agenda</p>
                            <div className="text-sm text-white/60 mt-2 space-y-1">
                              <p><span className="text-purple-400 font-mono">Part 1</span> - Introduction to AI tools</p>
                              <p><span className="text-purple-400 font-mono">Part 2</span> - Hands-on Marketing Campaigns</p>
                              <p><span className="text-purple-400 font-mono">Part 3</span> - Q&A and Networking</p>
                            </div>
                          </div>
                        </div>

                        <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 transition-all cursor-default">
                          <MapPin className="w-6 h-6 text-purple-500 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold font-display text-white text-xl">Workshop Venue</p>
                            <p className="text-sm text-white/70 mt-1">LBEF college, Maiti Devi</p>
                            <p className="text-xs text-white/50 mt-1">State-of-the-art tech lab facility. Registered participants will receive location details via SMS/email soon.</p>
                          </div>
                        </div>

                        <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 transition-all cursor-default">
                          <Crosshair className="w-6 h-6 text-purple-500 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-white text-lg">Prerequisites</p>
                            <ul className="text-sm text-white/60 mt-2 space-y-1 list-disc list-inside">
                              <li>Basic understanding of social media.</li>
                              <li>Bring your laptop (fully charged).</li>
                              <li>An open mind to learn new AI workflows.</li>
                            </ul>
                          </div>
                        </div>

                        <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 transition-all cursor-default">
                          <CheckCircle className="w-6 h-6 text-purple-500 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="font-bold text-white text-lg">What You Will Learn</p>
                            <div className="text-sm text-white/60 mt-2 space-y-1">
                              <p>✔️ Content generation at scale using LLMs.</p>
                              <p>✔️ Automated scheduling and analytics.</p>
                              <p>✔️ Building a personal or brand voice with AI.</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div variants={fadeUp} className="md:w-1/2 flex items-start justify-center pt-8 md:pt-0 md:sticky md:top-24 h-fit">
                      <div className="bg-[#0A0A0A]/60 border border-white/20 rounded-3xl p-8 md:p-12 backdrop-blur-[40px] text-center shadow-[0_0_50px_rgba(147,51,234,0.15)] w-full max-w-md relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Zap className="w-20 h-20 text-purple-500 mx-auto mb-6 opacity-80 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500" />
                        <h3 className="text-3xl font-black mb-4 relative z-10">Secure Your Seat</h3>
                        <p className="text-white/60 mb-8 relative z-10">Capacity is capped at 50 to ensure hands-on learning.</p>
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href="https://docs.google.com/forms/d/e/1FAIpQLSebp75J8vqd8JDnaXsa8DOjCApwh4mKZ13x3polyK1GojCD0A/viewform?usp=dialog"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 inline-block w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-black rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] uppercase tracking-widest text-sm"
                        >
                          Reserve Your Spot
                        </motion.a>
                      </div>
                    </motion.div>
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
                    { q: "Where is the event located?", a: "The PUBG Mobile Tournament is held physically at NCMT College, Samakhushi, Kathmandu. The venue for the Digital Marketing with AI Workshop is LBEF college, Maiti Devi. Registered participants will receive exact location details and instructions via email and SMS." },
                    { q: "Do I need to pay to attend the AI Workshop or PUBG Tournament?", a: "No! Both events are completely free to attend, but registration is required. Slots are limited (50 seats for the AI workshop and 32 squads for PUBG), so please reserve early to secure your spot." },
                    { q: "What if I register my PUBG squad but one player can't make it last minute?", a: "No worries! You can substitute up to one player before the check-in on the event day. Just make sure the new player is ready with their mobile device at the registration desk." },
                    { q: "I'm a complete beginner to AI. Will I feel lost in the Digital Marketing workshop?", a: "Absolutely not! The workshop starts with the absolute basics of LLMs and AI tools. By the end, you'll be building automated marketing campaigns step-by-step. All you need is curiosity and a charged laptop." },
                    { q: "Is there any entry fee for spectators who just want to watch the PUBG matches?", a: "Spectator entry is absolutely free! Bring your friends to cheer for your squad or experience the gaming vibe. We'll have a dedicated viewing area set up." },
                    { q: "Will I get a certificate for attending the AI Workshop?", a: "Yes! All participants who complete the hands-on sessions of the AI Workshop will receive a digital Certificate of Participation from Runway Career Connect and The Octave Alliance." },
                    { q: "Can I participate in both the PUBG Tournament and the AI Workshop?", a: "Yes, you can register for both, provided the schedules do not overlap. The tournament check-in starts at 10:00 AM, so plan your time accordingly." },
                    { q: "Is the PUBG Tournament open to PC emulator or iPad players?", a: "No, the tournament is strictly for mobile devices (phones only) to ensure a level playing field. iPads, tablets, and emulators are strictly banned." },
                    { q: "What should I bring with me?", a: "For the PUBG tournament: your mobile phone, charger, and a power bank. For the AI Workshop: a fully charged laptop. Wi-Fi will be provided at the venue for all participants." },
                    { q: "Can I join the PUBG tournament as a solo player and find a squad there?", a: "We highly recommend registering as a full squad of 4 to secure your spot since registrations are competitive. However, if you are solo, reach out to us on Instagram (@theoctavealliance) and we will do our best to match you with other solo players looking for a team!" },
                    { q: "What if I get hungry during the event? Is food provided?", a: "We've got you covered! Registered participants will get free light snacks and refreshments. For heavier meals, there will be food stalls inside the campus offering hot snacks and drinks at student-friendly prices." },
                    { q: "How do I contact the organizers?", a: "You can reach us via our Instagram page @theoctavealliance or DM us on TikTok @the0ctave. For urgent queries on the event day, a helpdesk will be available at the entrance." }
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
                      { name: "NCMT College", role: "Venue Partner" },
                      { name: "Octave Cluster Crew", role: "Presented By" },
                      { name: "Runway Career Connect", role: "Supported By" }
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
                    Interested in sponsoring Runway Career Connect? <a href="https://www.instagram.com/theoctavealliance" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline underline-offset-4 transition-colors">Get in touch →</a>
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
        <footer className="py-2 px-4 md:px-12 flex flex-col md:flex-row items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-2xl border-t border-white/10 relative z-10 gap-4">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono">
              &copy; {new Date().getFullYear()} Organized by the <span className="text-white/80 font-bold">Octave Cluster Crew</span>
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
                className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl backdrop-blur-xl transition-all border group cursor-pointer ${activeTab === 'pubg' ? 'bg-orange-500/10 border-orange-500/50 hover:bg-orange-500/20 text-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.3)]'
                  : activeTab === 'ai' ? 'bg-purple-500/10 border-purple-500/50 hover:bg-purple-500/20 text-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                    : activeTab === 'faq' ? 'bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
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
