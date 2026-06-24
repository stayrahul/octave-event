"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Crosshair, MapPin, Calendar, Trophy, FileText, CheckCircle, Flame, Zap, Instagram, Ticket, Share2 } from 'lucide-react';
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
  return (
    <div className={`px-4 py-2 rounded-full inline-flex items-center font-mono text-xs md:text-sm mb-6 md:mb-8 border ${className}`}>
      <Icon className="w-4 h-4 mr-2" />
      {count !== null ? `[${count}]/${max} ${label}` : "Loading live stats..."}
    </div>
  );
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'pubg' | 'ai'>('overview');
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">

      {/* Background Gradients */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-orange-600/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="fixed bottom-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none z-0"
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-12 h-20 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center justify-between w-full md:w-auto h-full">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-tr from-orange-500 to-purple-600 rounded-lg shrink-0"></div>
              <span className="text-sm md:text-xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent underline underline-offset-4 decoration-orange-500 whitespace-nowrap">
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
        <nav className="max-w-7xl mx-auto px-4 md:px-12 flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar border-t md:border-none border-white/5 py-3 md:py-0 md:absolute md:top-0 md:right-12 md:h-20 text-xs md:text-sm font-medium tracking-widest text-white/50 whitespace-nowrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`relative transition-colors uppercase py-1 ${activeTab === 'overview' ? 'text-white' : 'hover:text-white'}`}
          >
            Overview
            {activeTab === 'overview' && (
              <motion.div layoutId="nav-indicator" className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-white rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('pubg')}
            className={`relative transition-colors uppercase py-1 ${activeTab === 'pubg' ? 'text-orange-500' : 'hover:text-orange-500'}`}
          >
            PUBG Grid
            {activeTab === 'pubg' && (
              <motion.div layoutId="nav-indicator" className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`relative transition-colors uppercase py-1 ${activeTab === 'ai' ? 'text-purple-500' : 'hover:text-purple-500'}`}
          >
            AI Workshop
            {activeTab === 'ai' && (
              <motion.div layoutId="nav-indicator" className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-purple-500 rounded-full" />
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
      </header>

      {/* Main Content Area */}
      <main className="pt-36 md:pt-32 pb-24 px-4 md:px-12 relative z-10 min-h-[calc(100vh-80px)]">
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
                  <div className="flex justify-center md:justify-start mb-6">
                    <div className="inline-flex gap-1.5 items-center bg-white/5 hover:bg-white/10 transition-colors px-2.5 py-1 rounded-full border border-white/10 cursor-default shadow-lg">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                      </span>
                      <span className="text-[8px] text-white/60 font-mono tracking-wider mt-[1px]">LIVE SYNC ACTIVE</span>
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
                    ELEVATE YOUR SKILLS.<br className="hidden md:block" />
                    <span className="bg-gradient-to-r from-orange-500 via-white to-purple-500 bg-clip-text text-transparent italic"> DOMINATE THE GRID.</span>
                  </h1>
                  <p className="text-white/40 text-xs md:text-lg uppercase tracking-[0.2em] max-w-2xl mx-auto md:mx-0">
                    Welcome to Runway Career Connect • Choose your arena
                  </p>
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
                  <div className="relative bg-[#0A0A0A]/95 backdrop-blur-3xl rounded-[calc(2.5rem-2px)] p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 h-full overflow-hidden">

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

                      <h3 className="font-black text-3xl md:text-5xl uppercase tracking-tighter mb-4 bg-gradient-to-r from-amber-100 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-xl leading-none">
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
                    className="relative group border border-orange-500/20 bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all text-left cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5"
                    onClick={() => setActiveTab('pubg')}
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                      <Flame className="w-16 h-16 md:w-24 md:h-24 text-orange-500" />
                    </div>

                    <div className="relative z-10">
                      <div className="inline-block px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 text-[10px] font-bold tracking-widest uppercase mb-6">
                        Esports Tournament
                      </div>
                      <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">Winner Winner<br />Runway Dinner</h2>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-white/60">
                          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                          <span className="text-xs md:text-sm font-mono">2083 / 03 / 14</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/60">
                          <MapPin className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                          <span className="text-xs md:text-sm">NCMT COLLEGE CAMPUS</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 mt-8">
                      <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-between md:items-end mb-4">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Registration Status</p>
                          <p className="text-xl md:text-2xl font-black text-orange-500">🔥 {stats?.pubg ?? 0} / 32 <span className="text-xs md:text-sm font-normal text-white/60">SQUADS</span></p>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full md:w-auto px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-shadow shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] whitespace-nowrap">
                          JOIN GRID
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* AI Card (Overview) */}
                  <div
                    className="relative group border border-purple-500/20 bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all text-left cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5"
                    onClick={() => setActiveTab('ai')}
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12">
                      <Zap className="w-16 h-16 md:w-24 md:h-24 text-purple-500" />
                    </div>

                    <div className="relative z-10">
                      <div className="inline-block px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-500 text-[10px] font-bold tracking-widest uppercase mb-6">
                        Masterclass Workshop
                      </div>
                      <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">Digital Marketing<br />with AI</h2>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-white/60">
                          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                          <span className="text-xs md:text-sm font-mono">15 ASAR 2083</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/60">
                          <Crosshair className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                          <span className="text-xs md:text-sm uppercase">Startups & Upskilling</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 mt-8">
                      <div className="flex flex-col md:flex-row md:flex-wrap gap-4 justify-between md:items-end mb-4">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Available Capacity</p>
                          <p className="text-xl md:text-2xl font-black text-purple-500">⚡ {stats?.ai ?? 0} / 50 <span className="text-xs md:text-sm font-normal text-white/60">SEATS</span></p>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full md:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-shadow shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] whitespace-nowrap">
                          RESERVE
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* PUBG TAB */}
            {activeTab === 'pubg' && (
              <motion.div
                key="pubg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-5xl mx-auto"
              >
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                  <div className="md:w-1/3 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">PUBG Mobile Tournament</h2>

                    {/* Small Bonus Note */}
                    <div className="inline-flex items-start md:items-center gap-3 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 p-3 rounded-xl">
                      <Ticket className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 md:mt-0 animate-pulse" />
                      <p className="text-sm font-medium text-amber-100/90 leading-tight">
                        Includes a <strong className="text-amber-400 drop-shadow-sm">FREE TICKET</strong> to Nepal's biggest event on 2083/03/26!
                      </p>
                    </div>

                    <Countdown targetDate="2026-06-28T10:00:00" label="Tournament Starts In" />

                    <div className="mt-8">
                      <LiveCounter
                        count={stats?.pubg ?? null}
                        max={32}
                        label="Squads Registered"
                        icon={Flame}
                        className="bg-orange-500/10 text-orange-400 border-orange-500/20"
                      />
                    </div>

                    <div className="space-y-4 md:space-y-6 text-gray-300 mt-8">
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 text-orange-500 mr-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Date</p>
                          <p className="text-sm">2083/03/14</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-orange-500 mr-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Venue</p>
                          <p className="text-sm">NCMT College</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Trophy className="w-5 h-5 text-orange-500 mr-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Prize Pool</p>
                          <p className="text-sm">Rs. 10,000</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FileText className="w-5 h-5 text-orange-500 mr-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Rules</p>
                          <p className="text-sm">No emulators allowed. Fair play strictly enforced.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-2/3 flex items-center justify-center">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-sm text-center shadow-2xl shadow-orange-500/10 w-full max-w-md">
                      <Flame className="w-16 h-16 text-orange-500 mx-auto mb-6 opacity-80" />
                      <h3 className="text-2xl font-bold mb-4">Ready to Dominate?</h3>
                      <p className="text-white/60 mb-8">Click the button below to register your squad via Google Forms.</p>
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href="https://docs.google.com/forms/d/e/1FAIpQLSeXewi_CsfCyZS3eAERmMhceBDrQL7kYSoJULvT6WbsGdOZ6A/viewform?usp=dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full px-6 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-shadow shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] uppercase tracking-widest text-sm"
                      >
                        Open Registration Form
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI WORKSHOP TAB */}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-5xl mx-auto"
              >
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                  <div className="md:w-1/3 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-sm">Digital Marketing with AI</h2>

                    {/* Small Bonus Note */}
                    <div className="inline-flex items-start md:items-center gap-3 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 p-3 rounded-xl">
                      <Ticket className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 md:mt-0 animate-pulse" />
                      <p className="text-sm font-medium text-amber-100/90 leading-tight">
                        Includes a <strong className="text-amber-400 drop-shadow-sm">FREE TICKET</strong> to Nepal's biggest event on 2083/03/26!
                      </p>
                    </div>

                    <Countdown targetDate="2026-06-29T10:00:00" label="Workshop Starts In" />

                    <div className="mt-8">
                      <LiveCounter
                        count={stats?.ai ?? null}
                        max={50}
                        label="Seats Booked"
                        icon={Zap}
                        className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                      />
                    </div>

                    <div className="space-y-4 md:space-y-6 text-gray-300 mt-8">
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 text-purple-500 mr-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Date</p>
                          <p className="text-sm">15 Asar</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Crosshair className="w-5 h-5 text-purple-500 mr-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Target Audience</p>
                          <p className="text-sm">Startups, Family Businesses, Upskilling Professionals.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-purple-500 mr-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-white">Certification</p>
                          <p className="text-sm">Certificate provided upon completion.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-2/3 flex items-center justify-center">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-sm text-center shadow-2xl shadow-purple-500/10 w-full max-w-md">
                      <Zap className="w-16 h-16 text-purple-500 mx-auto mb-6 opacity-80" />
                      <h3 className="text-2xl font-bold mb-4">Secure Your Seat</h3>
                      <p className="text-white/60 mb-8">Click the button below to reserve your spot via Google Forms.</p>
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href="https://docs.google.com/forms/d/e/1FAIpQLSebp75J8vqd8JDnaXsa8DOjCApwh4mKZ13x3polyK1GojCD0A/viewform?usp=dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full px-6 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-shadow shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] uppercase tracking-widest text-sm"
                      >
                        Open Reservation Form
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Social Media Links Section */}
      <section className="py-4 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center justify-center">
          <p className="text-sm text-white/40 uppercase tracking-[0.3em] mb-6">Connect With Us</p>
          <div className="flex items-center gap-12 text-white/60">
            <a href="https://www.instagram.com/theoctavealliance?igsh=MWh5bGVhcGh3M3BjYQ==" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="https://www.tiktok.com/@the0ctave?_r=1&_t=ZS-97U33G1nWJb" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors"><Tiktok className="w-5 h-5" /></a>
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
              onClick={() => setActiveTab('overview')}
              className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl backdrop-blur-xl transition-all border group cursor-pointer ${activeTab === 'pubg'
                ? 'bg-orange-500/10 border-orange-500/50 hover:bg-orange-500/20 text-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.3)]'
                : 'bg-purple-500/10 border-purple-500/50 hover:bg-purple-500/20 text-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                }`}
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold tracking-widest uppercase text-xs">Back</span>
            </motion.button>
          )
        }
      </AnimatePresence>

    </div>
  );
}
