import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Eye, 
  Mic, 
  MessageSquare, 
  FileText, 
  Volume2,
  LogOut,
  Info,
  Star,
  Settings,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface LandingPageProps {
  onEnterApp: () => void;
  onEnterPlans: () => void;
  user: UserSession | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isRealFirebase: boolean;
}

// Google "G" SVG for sign-in buttons
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

// Brand Logo SVG
const BrandLogo = ({ size = 10 }: { size?: number }) => (
  <div className={`w-${size} h-${size} rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/20 flex-shrink-0`}>
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="rgba(255,255,255,0.15)" />
      <path d="M8 9.5C8 8.12 9.12 7 10.5 7S13 8.12 13 9.5 11.88 12 10.5 12 8 10.88 8 9.5z" fill="white" />
      <path d="M15.5 7a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="rgba(255,255,255,0.7)" />
      <path d="M5 16c0-2.21 3.13-4 7-4s7 1.79 7 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="6" r="3" fill="#34D399" />
      <path d="M17 6l.8.8L19.5 5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

// Reusable 3D Tilt Card component
const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    setRotateX(-(mouseY / (rect.height / 2)) * 8);
    setRotateY((mouseX / (rect.width / 2)) * 8);
  };

  const handleMouseLeave = () => { setRotateX(0); setRotateY(0); };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      className="w-full transition-all duration-200"
    >
      <div
        style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, transformStyle: 'preserve-3d' }}
        className={`transition-all duration-200 bg-gray-800/70 border border-gray-700/50 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 p-6 rounded-2xl relative ${className}`}
      >
        <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Stars rating component
const Stars = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-0.5">
    {Array(count).fill(0).map((_, i) => (
      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
    ))}
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onEnterPlans,
  user,
  loading,
  login,
  logout,
  isRealFirebase
}) => {
  const [activeModel, setActiveModel] = useState<'flash' | 'pro'>('flash');
  const [selectedVoice, setSelectedVoice] = useState<'zephyr' | 'aoede'>('zephyr');
  const [waveformHeight, setWaveformHeight] = useState<number[]>(Array(14).fill(10));
  const [scrolled, setScrolled] = useState(false);

  // Interactive orb cursor tracking
  const orbRef = useRef<HTMLDivElement>(null);
  const [orbRotateX, setOrbRotateX] = useState(-10);
  const [orbRotateY, setOrbRotateY] = useState(15);

  const handleOrbMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!orbRef.current) return;
    const rect = orbRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    setOrbRotateX(-(mouseY / (rect.height / 2)) * 25);
    setOrbRotateY((mouseX / (rect.width / 2)) * 25);
  };

  const handleOrbMouseLeave = () => { setOrbRotateX(-10); setOrbRotateY(15); };

  // Waveform animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveformHeight(() => Array(14).fill(0).map(() => Math.floor(Math.random() * 48) + 6));
    }, 130);
    return () => clearInterval(interval);
  }, []);

  // Sticky nav scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const howItWorksSteps = [
    {
      number: '01',
      icon: <Settings className="w-5 h-5" />,
      title: 'Set Up Your Session',
      desc: 'Choose your target role, difficulty level, and pick an AI interviewer persona that suits your style.',
    },
    {
      number: '02',
      icon: <Mic className="w-5 h-5" />,
      title: 'Practice Live',
      desc: 'Speak naturally. The AI listens, responds, and adapts questions in real time — just like a real interviewer.',
    },
    {
      number: '03',
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Get Scored & Improve',
      desc: 'Receive a full performance breakdown with competency scores, strengths, and personalised coaching tips.',
    },
  ];

  const testimonials = [
    {
      initials: 'AS',
      color: 'from-indigo-500 to-violet-600',
      name: 'Aisha S.',
      role: 'Software Engineer — landed at Google',
      quote: 'I did 3 sessions before my Google loop and felt so much more confident. The real-time feedback on my filler words was a game changer.',
      stars: 5,
    },
    {
      initials: 'MR',
      color: 'from-pink-500 to-rose-500',
      name: 'Marcus R.',
      role: 'Product Manager — hired at Stripe',
      quote: 'The AI asked follow-up questions I\'d never considered. It caught gaps in my STAR answers that no practice partner ever would.',
      stars: 5,
    },
    {
      initials: 'PK',
      color: 'from-emerald-500 to-teal-600',
      name: 'Priya K.',
      role: 'Data Scientist — offer from Meta',
      quote: 'Uploading my JD and résumé made it incredibly tailored. Each question felt like it was built specifically for my target role.',
      stars: 5,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden relative text-white">
      {/* ─── Inline styles ─────────────────────────────────────────── */}
      <style>{`
        .bg-grid-glow {
          background-size: 42px 42px;
          background-image:
            linear-gradient(to right, rgba(99,102,241,0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99,102,241,0.07) 1px, transparent 1px);
        }
        @keyframes spinner-3d {
          0%   { transform: rotateX(70deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(70deg) rotateY(0deg) rotateZ(360deg); }
        }
        @keyframes spinner-3d-reverse {
          0%   { transform: rotateX(60deg) rotateY(45deg) rotateZ(360deg); }
          100% { transform: rotateX(60deg) rotateY(45deg) rotateZ(0deg); }
        }
        @keyframes ring-glow {
          0%,100% { border-color: rgba(99,102,241,0.3); box-shadow: 0 0 15px rgba(99,102,241,0.1); }
          50%     { border-color: rgba(236,72,153,0.5);  box-shadow: 0 0 25px rgba(236,72,153,0.2); }
        }
        .anim-ring-1 { animation: spinner-3d 6s linear infinite, ring-glow 4s ease-in-out infinite alternate; }
        .anim-ring-2 { animation: spinner-3d-reverse 9s linear infinite; }
        .text-glow   { text-shadow: 0 0 24px rgba(99,102,241,0.45); }
        @keyframes float-a {
          0%,100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50%     { transform: translateY(-22px) scale(1.08); opacity: 1; }
        }
        @keyframes float-b {
          0%,100% { transform: translateY(0px) scale(1); opacity: 0.5; }
          50%     { transform: translateY(-14px) scale(1.05); opacity: 0.9; }
        }
        @keyframes float-c {
          0%,100% { transform: translateY(0px); opacity: 0.4; }
          50%     { transform: translateY(-18px); opacity: 0.8; }
        }
        .particle-a { animation: float-a 7s ease-in-out infinite; }
        .particle-b { animation: float-b 9s ease-in-out infinite 1.5s; }
        .particle-c { animation: float-c 11s ease-in-out infinite 3s; }
        .nav-glass {
          background: rgba(10,10,20,0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(99,102,241,0.12);
          box-shadow: 0 4px 32px rgba(0,0,0,0.4);
        }
      `}</style>

      {/* ─── Background layers ──────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[700px] bg-grid-glow pointer-events-none z-0" />
      {/* Primary glow — top center */}
      <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-tr from-indigo-500/12 via-pink-500/6 to-transparent rounded-full blur-[110px] pointer-events-none z-0" />
      {/* Secondary glow — bottom left */}
      <div className="absolute top-[55%] left-[-100px] w-[380px] h-[380px] bg-gradient-to-br from-violet-600/10 to-transparent rounded-full blur-[90px] pointer-events-none z-0" />
      {/* Floating particles */}
      <div className="particle-a absolute top-32 left-[8%] w-2 h-2 rounded-full bg-indigo-400/50 pointer-events-none z-0" />
      <div className="particle-b absolute top-64 right-[10%] w-1.5 h-1.5 rounded-full bg-pink-400/40 pointer-events-none z-0" />
      <div className="particle-c absolute top-[45%] left-[18%] w-1 h-1 rounded-full bg-violet-400/50 pointer-events-none z-0" />
      <div className="particle-a absolute top-[60%] right-[20%] w-2 h-2 rounded-full bg-indigo-300/30 pointer-events-none z-0" style={{ animationDelay: '2s' }} />

      {/* ─── STICKY NAVIGATION ─────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'nav-glass' : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between py-3.5 px-6 max-w-6xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <BrandLogo size={9} />
            <div>
              <p className="text-sm font-bold text-white tracking-wide leading-none">InterviewForge</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">AI-Powered Interview Coach</p>
            </div>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onEnterPlans}
              className="text-xs font-semibold text-gray-400 hover:text-white transition-all px-3 py-1.5 rounded-xl hover:bg-gray-800/60 hidden sm:inline-flex"
            >
              Pricing
            </button>

            {loading ? (
              <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-2.5 bg-gray-900/80 px-3 py-1.5 rounded-2xl border border-gray-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-indigo-500/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-xs font-bold text-gray-300 hidden sm:inline max-w-[90px] truncate">
                  {user.displayName?.split(' ')[0]}
                </span>
                <button
                  onClick={onEnterApp}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  Open App
                </button>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="bg-gray-950 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 border border-gray-800 transition-all hover:border-gray-700 shadow-md"
              >
                <GoogleIcon />
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Sign in</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      <div className="space-y-28 py-8">

        {/* ─── HERO SECTION ──────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto px-6 relative z-10">
          {/* Left column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Powered by Gemini Live API</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Ace Your Next
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 text-glow">
                  Interview
                </span>
                {' '}with a Live AI Coach
              </h1>
              <p className="text-gray-400 text-sm sm:text-base max-w-lg leading-relaxed">
                Practice with a real-time AI interviewer that listens, responds, and scores you — just like the real thing. No scheduling, no awkwardness.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <button
                    onClick={onEnterApp}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-500/35 hover:scale-[1.02] transform transition-all cursor-pointer"
                  >
                    <span>Start Practicing Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={login}
                    disabled={loading}
                    className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-2xl text-sm flex items-center gap-2.5 shadow-xl shadow-white/5 hover:scale-[1.02] transform transition-all cursor-pointer disabled:opacity-60"
                  >
                    <GoogleIcon />
                    <span>Sign in with Google — It's Free</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                <button
                  onClick={onEnterPlans}
                  className="px-6 py-4 bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/70 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  View Plans & Pricing
                </button>
              </div>

              {!isRealFirebase && (
                <div className="text-[11px] bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 rounded-2xl px-4 py-3 flex items-start gap-2.5 mt-1 max-w-xl">
                  <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5 animate-pulse" />
                  <span>
                    <strong>Sandbox Mode:</strong> Demo simulation is active. Connect your Firebase project to enable live authentication and Firestore.
                  </span>
                </div>
              )}
            </div>

            {/* Trust stats */}
            <div className="pt-6 border-t border-gray-800/70 grid grid-cols-3 gap-6 max-w-md">
              <div className="space-y-1">
                <div className="text-indigo-400 font-black text-2xl font-mono">10k+</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sessions Done</div>
              </div>
              <div className="space-y-1">
                <div className="text-indigo-400 font-black text-2xl font-mono">4</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">AI Personas</div>
              </div>
              <div className="space-y-1">
                <div className="text-indigo-400 font-black text-2xl font-mono">0.1s</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Audio Latency</div>
              </div>
            </div>
          </div>

          {/* Right column: 3D Orb */}
          <div className="lg:col-span-5 flex justify-center items-center relative min-h-[320px] lg:min-h-[380px]">
            <div
              ref={orbRef}
              onMouseMove={handleOrbMouseMove}
              onMouseLeave={handleOrbMouseLeave}
              style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
              className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex items-center justify-center cursor-grab active:cursor-grabbing group"
            >
              <div
                style={{ transform: `rotateX(${orbRotateX}deg) rotateY(${orbRotateY}deg)`, transformStyle: 'preserve-3d' }}
                className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
              >
                {/* Rings */}
                <div className="absolute w-[88%] h-[88%] border border-dashed rounded-full pointer-events-none anim-ring-1" />
                <div className="absolute w-[70%] h-[70%] border border-indigo-500/20 rounded-full pointer-events-none anim-ring-2" />

                {/* Sphere core */}
                <div className="absolute w-36 h-36 sm:w-40 sm:h-40 bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 rounded-full flex items-center justify-center shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                  <div className="w-10 h-10 rounded-full bg-gray-900/80 border border-white/20 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Cpu className="w-4 h-4 text-indigo-300 animate-pulse" />
                  </div>
                  <span className="absolute -top-2.5 left-10 w-2.5 h-2.5 rounded-full bg-pink-400 animate-ping" />
                  <span className="absolute bottom-5 right-5 w-2 h-2 rounded-full bg-indigo-300 animate-pulse" />
                </div>

                {/* Human-readable labels */}
                <div
                  style={{ transform: 'translateZ(60px)' }}
                  className="absolute bg-gray-950/90 border border-gray-800 text-[10px] font-semibold px-3 py-1.5 rounded-xl text-green-400 shadow-xl flex items-center gap-1.5 -top-4 whitespace-nowrap"
                >
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                  <span>🎙 Listening...</span>
                </div>

                <div
                  style={{ transform: 'translateZ(-40px)' }}
                  className="absolute bg-gray-950/90 border border-gray-800 text-[10px] font-semibold px-3 py-1.5 rounded-xl text-indigo-300 shadow-xl bottom-2 whitespace-nowrap"
                >
                  <span>AI Scoring Live ✦</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-bold text-violet-300 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Simple 3-Step Process
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How It Works</h2>
            <p className="text-gray-400 text-sm">From setup to offer letter — we've got you covered at every stage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-indigo-500/30 via-violet-500/50 to-pink-500/30 z-0" />

            {howItWorksSteps.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center p-8 bg-gray-800/40 border border-gray-700/50 rounded-2xl hover:border-indigo-500/30 hover:bg-gray-800/60 transition-all group">
                {/* Number badge */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xs font-black text-white">{step.number}</span>
                </div>
                <div className="text-indigo-400 mb-3">{step.icon}</div>
                <h3 className="text-sm font-bold text-white mb-2 tracking-wide">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── LIVE TELEMETRY CONSOLE ────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="bg-gray-800/35 border border-gray-700/50 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[280px] h-[280px] bg-gradient-to-bl from-pink-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: controls */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  <Volume2 className="w-3.5 h-3.5" /> Live Signal Simulator
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                  Sub-second AI responses.<br />Every time.
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Toggle between AI models and coach personas to see how the system adapts. Our platform delivers truly conversational speech processing with no perceptible lag.
                </p>

                <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800/80 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Interviewer Model</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['flash', 'pro'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setActiveModel(m)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            activeModel === m
                              ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
                              : 'bg-transparent border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {m === 'flash' ? 'Gemini 2.5 Flash' : 'Gemini 2.0 Pro'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Coach Persona</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['zephyr', 'aoede'] as const).map(v => (
                        <button
                          key={v}
                          onClick={() => setSelectedVoice(v)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            selectedVoice === v
                              ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
                              : 'bg-transparent border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {v === 'zephyr' ? '⚡ Zephyr — Energetic' : '🎓 Aoede — Academic'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: console */}
              <div className="lg:col-span-7">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="text-[10px] text-gray-500 font-mono ml-2">interview_session.live</span>
                    </div>
                    <span className="text-[10px] text-indigo-400 font-mono">● ACTIVE</span>
                  </div>

                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Response Time</span>
                        <p className="text-xl font-extrabold text-white font-mono">{activeModel === 'flash' ? '92ms' : '210ms'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Voice Stream</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                          <span className="text-xs text-white font-semibold">Ready</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Scoring Engine</span>
                        <p className="text-xs text-indigo-400 font-semibold mt-1">Armed & Ready</p>
                      </div>
                    </div>

                    {/* Waveform */}
                    <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-3">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Live Audio Stream</span>
                      <div className="h-14 flex items-end justify-center gap-1 pt-2">
                        {waveformHeight.map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}px` }}
                            className="flex-1 max-w-[12px] bg-gradient-to-t from-indigo-600 to-violet-400 rounded-full transition-all duration-100 relative"
                          >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-20 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Terminal */}
                    <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
                      <div className="text-[10px] font-mono space-y-1">
                        <p className="text-indigo-400">&gt; [SESSION] Connection established — cluster ready</p>
                        <p className="text-green-400">&gt; [MODEL] {activeModel === 'flash' ? 'Gemini 2.5 Flash' : 'Gemini 2.0 Pro'} loaded · persona: {selectedVoice}</p>
                        <p className="text-gray-500">&gt; [COACH] Awaiting candidate input...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CORE CAPABILITIES ─────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Built for Serious Candidates</h2>
            <p className="text-gray-400 text-sm">
              Every feature is designed around one goal: getting you the offer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Mic className="w-5 h-5" />, title: 'Real-Time Voice', desc: 'Ultra-low latency audio that captures every pause, filler word, and pacing pattern.' },
              { icon: <Eye className="w-5 h-5" />, title: 'Body Language Scoring', desc: 'Video frame analysis tracking posture, eye contact, and confidence signals live.' },
              { icon: <FileText className="w-5 h-5" />, title: 'JD-Aligned Questions', desc: 'Paste any job description and get questions tailored to that exact role and seniority.' },
              { icon: <MessageSquare className="w-5 h-5" />, title: 'Zephyr AI Coach', desc: 'A dedicated AI coach that breaks down every answer and coaches your weaknesses post-session.' },
            ].map((card, i) => (
              <TiltCard key={i}>
                <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl w-fit mb-4">
                  {card.icon}
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide mb-2">{card.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ─── TESTIMONIALS ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Trusted by Job Seekers
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Real Candidates. Real Offers.</h2>
            <p className="text-gray-400 text-sm">
              Thousands of candidates have used InterviewForge to land roles at top companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 flex flex-col gap-4 hover:border-gray-600/60 hover:bg-gray-800/70 transition-all"
              >
                <Stars />
                <p className="text-sm text-gray-300 leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-700/50">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${t.color} flex items-center justify-center text-xs font-black text-white flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FINAL CTA BANNER ──────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600/20 via-violet-600/15 to-pink-600/10 border border-indigo-500/20 p-10 sm:p-16 text-center">
            <div className="absolute inset-0 bg-grid-glow pointer-events-none opacity-30" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to Land Your Dream Role?</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Join thousands of candidates who are sharpening their skills with AI-powered mock interviews — for free.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {user ? (
                  <button
                    onClick={onEnterApp}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transform transition-all"
                  >
                    Start Practicing Now <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={login}
                    className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-2xl text-sm flex items-center gap-2.5 shadow-xl hover:scale-[1.02] transform transition-all"
                  >
                    <GoogleIcon />
                    Get Started Free <ArrowRight className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                <button
                  onClick={onEnterPlans}
                  className="px-7 py-4 bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/70 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 hover:scale-[1.02]"
                >
                  Explore Pro Plans
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ────────────────────────────────────────────────── */}
        <footer className="max-w-6xl mx-auto px-6 pb-10">
          {/* Gradient separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mb-10" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center sm:items-start gap-1.5">
              <div className="flex items-center gap-2.5">
                <BrandLogo size={7} />
                <p className="text-sm font-bold text-white">InterviewForge</p>
              </div>
              <p className="text-[11px] text-gray-500 italic">Built for serious candidates who want the edge.</p>
              <p className="text-[10px] text-gray-600">&copy; 2026 InterviewForge. All rights reserved.</p>
            </div>

            <div className="flex gap-6 text-xs text-gray-400">
              <button onClick={user ? onEnterApp : login} className="hover:text-white transition-colors cursor-pointer">Workspace</button>
              <button onClick={onEnterPlans} className="hover:text-white transition-colors cursor-pointer">Pricing</button>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;
