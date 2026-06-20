'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { KryonLogo } from '@/components/layout/kryon-logo';
import {
  ArrowRight,
  Shield,
  Target,
  Beaker,
  Terminal,
  Check,
  Lock,
  RefreshCw,
  Zap,
  GitPullRequest,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Star,
  Copy,
  Code,
  Sparkles,
  GitBranch,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  Database,
  Network,
  GitMerge,
  Globe,
  Activity,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation, useInView, useMotionValue, useTransform, animate } from 'framer-motion';



// Custom ScrollReveal wrapper using Framer Motion
function ScrollReveal({ children, className, delay = 0, y = 30 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px 0px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      animate={controls}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Custom Magnetic Button wrapper for high-end SaaS feel
function MagneticButton({ children, className, onClick, ...props }: { children: React.ReactNode; className?: string; onClick?: () => void; [key: string]: any }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setCoords({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: coords.x, y: coords.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.1 }}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Custom animated counter component (counts up when in view)
function AnimatedCounter({ value, suffix = '', duration = 2.5 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, { duration, ease: 'easeOut' });
      return controls.stop;
    }
  }, [inView, motionValue, value, duration]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toLocaleString() + suffix;
      }
    });
  }, [rounded, suffix]);

  return <span ref={ref} className="font-display font-bold">0{suffix}</span>;
}

// Custom FAQ Accordion Item component (Card Redesign)
function FAQAccordionItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div 
      className={`rounded-xl border transition-all duration-300 relative overflow-hidden ${
        isOpen 
          ? 'border-cyan-500/30 bg-cyan-950/10 shadow-[0_0_30px_rgba(6,182,212,0.08)]' 
          : 'border-zinc-800 bg-zinc-950/20 hover:border-cyan-500/20 hover:bg-cyan-950/5'
      }`}
    >
      {/* Subtle hover glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.005] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <button
        onClick={onClick}
        className="w-full flex items-center justify-between text-left p-5 md:p-6 font-medium text-white cursor-pointer group"
      >
        <span className="font-display text-sm md:text-base font-semibold tracking-tight pr-4 transition-colors duration-300 group-hover:text-cyan-400">
          {question}
        </span>
        <div className={`w-7 h-7 rounded-full border border-white/[0.04] bg-white/[0.02] flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
          isOpen ? 'rotate-180 border-cyan-500/30 bg-cyan-950/30 text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'
        }`}>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 md:px-6 md:pb-6 pt-0 border-t border-white/[0.02]">
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed whitespace-pre-line text-left">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Connect GitHub Repository',
    desc: 'Securely authorize Kryon using GitHub OAuth to access repositories and pull requests.',
    metadata: ['OAuth Connected', 'Repository Synced']
  },
  {
    step: '02',
    title: 'Select Pull Request',
    desc: 'Choose the pull request that requires intelligence analysis and testing validation.',
    metadata: ['PR #142', '24 Files Changed']
  },
  {
    step: '03',
    title: 'Understand Code Changes',
    desc: 'Kryon analyzes modified files, dependencies, execution paths, and architectural impact.',
    metadata: ['Files: 24', 'Services: 3', 'Dependencies: 8']
  },
  {
    step: '04',
    title: 'Detect Hidden Risk',
    desc: 'Identify security vulnerabilities, regressions, access-control issues, and business logic risks.',
    metadata: ['Security: 2', 'Regression: 5', 'Critical: 1']
  },
  {
    step: '05',
    title: 'Predict Coverage Gaps',
    desc: 'Forecast which code paths are not covered by existing tests before deployment.',
    metadata: ['Coverage: 81%', 'Gaps Found: 4']
  },
  {
    step: '06',
    title: 'Build Test Strategy',
    desc: 'Generate deterministic Security, Regression, and Business Flow validation plans.',
    metadata: ['Security Plan', 'Regression Plan', 'Business Flow Plan']
  },
  {
    step: '07',
    title: 'Generate Playwright Specs',
    desc: 'Convert testing intelligence into executable Playwright test suites.',
    metadata: ['Specs: 3', 'Scenarios: 12', 'Assertions: 47']
  },
  {
    step: '08',
    title: 'Review Merge Readiness',
    desc: 'Provide risk scoring, deployment confidence, and merge recommendations.',
    metadata: ['Risk Score: 18%', 'Confidence: High']
  }
];

const STEP_ICONS = [
  GitBranch,
  GitPullRequest,
  Code,
  Shield,
  Beaker,
  Target,
  Terminal,
  CheckCircle2
];

const TABLET_ORDERS = [
  'md:order-1',
  'md:order-2',
  'md:order-4',
  'md:order-3',
  'md:order-5',
  'md:order-6',
  'md:order-8',
  'md:order-7'
];

const DESKTOP_ORDERS = [
  'lg:order-1',
  'lg:order-2',
  'lg:order-3',
  'lg:order-4',
  'lg:order-8',
  'lg:order-7',
  'lg:order-6',
  'lg:order-5'
];


export default function Landing() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Custom states for tracking scroll
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Mouse coords for glow follow effect
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

  // Custom states for live-ticking pipeline metrics
  const [pipelineStep, setPipelineStep] = useState(0);
  const [liveLatency, setLiveLatency] = useState(-8.4);
  const [liveRiskScore, setLiveRiskScore] = useState(14);
  const [workflowStep, setWorkflowStep] = useState(0);
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);

  // Custom FAQ active index
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  // Pipeline phases definition
  const PIPELINE_PHASES = [
    { id: 'pr', label: 'Pull Request', icon: GitPullRequest, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'risk', label: 'Risk Detection', icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { id: 'strategy', label: 'Test Strategy', icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'coverage', label: 'Coverage Prediction', icon: Beaker, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 'playwright', label: 'Playwright Spec', icon: Terminal, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' }
  ];

  // Set up mouse move tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Live update simulation triggers
  useEffect(() => {
    const scrollHandler = () => {
      setIsScrolled(window.scrollY > 20);

      // Section highlighters
      const sections = ['features', 'workflow', 'intelligence', 'faq'];
      let current = 'hero';
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            current = section;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  // Interval for ticking metric simulations
  useEffect(() => {
    const timer = setInterval(() => {
      // Loop pipeline step
      setPipelineStep((prev) => (prev + 1) % 5);
      
      // Jitter metrics slightly
      setLiveLatency((prev) => {
        const offset = (Math.random() - 0.5) * 0.4;
        return parseFloat((prev + offset).toFixed(1));
      });
      setLiveRiskScore((prev) => {
        const jitter = Math.random() > 0.5 ? 1 : -1;
        const nextVal = prev + jitter;
        return nextVal >= 8 && nextVal <= 18 ? nextVal : prev;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Interval for workflow pipeline revamp animation loop (8 steps + merge ready = 9 states)
  useEffect(() => {
    const timer = setInterval(() => {
      setWorkflowStep((prev) => (prev + 1) % 9);
    }, 850);
    return () => clearInterval(timer);
  }, []);



  const smoothScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#050505] text-[#fafafa] font-sans selection:bg-cyan-500/25 selection:text-white overflow-x-hidden relative"
      style={{
        '--mouse-x': `${mouseCoords.x}px`,
        '--mouse-y': `${mouseCoords.y}px`
      } as React.CSSProperties}
    >
      {/* Glow Follow Mouse Overlay (only on desktop screen bounds for CPU performance) */}
      <div className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-500 opacity-0 lg:opacity-100 bg-[radial-gradient(1000px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(34,211,238,0.04),rgba(168,85,247,0.015)_50%,transparent_80%)]" />

      {/* Background Animated Drift Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111115_1px,transparent_1px),linear-gradient(to_bottom,#111115_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_65%_60%_at_50%_0%,#000_65%,transparent_100%)] pointer-events-none animate-grid-drift" />

      {/* Floating Gradient Orbs */}
      <motion.div
        animate={{
          x: [0, 40, -40, 0],
          y: [0, 60, -30, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-[8%] left-[10%] w-[380px] h-[380px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"
      />
      
      <motion.div
        animate={{
          x: [0, -50, 50, 0],
          y: [0, -40, 70, 0],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-[35%] right-[8%] w-[450px] h-[450px] bg-purple-500/4 rounded-full blur-[140px] pointer-events-none"
      />

      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -60, 40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute bottom-[20%] left-[15%] w-[420px] h-[420px] bg-teal-500/4 rounded-full blur-[130px] pointer-events-none"
      />

      {/* Navbar Container */}
      <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'backdrop-blur-xl bg-[#050505]/75 border-white/[0.05] py-3' : 'backdrop-blur-md bg-[#050505]/40 border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <KryonLogo size="md" className="cursor-pointer" onClick={() => router.push('/')} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-zinc-400">
            {[
              { id: 'features', label: 'Features' },
              { id: 'workflow', label: 'Workflow' },
              { id: 'intelligence', label: 'Intelligence' },
              { id: 'faq', label: 'FAQ' }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => smoothScrollTo(link.id)}
                className={`relative px-2 py-1.5 transition-colors duration-200 hover:text-white cursor-pointer ${activeSection === link.id ? 'text-white' : ''}`}
              >
                <span>{link.label}</span>
                {activeSection === link.id && (
                  <motion.div
                    layoutId="activeNavbarIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* CTA Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            
            <MagneticButton
              onClick={() => router.push('/auth')}
              className="relative px-5 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_30px_rgba(34,211,238,0.45)] transition-all duration-300 cursor-pointer"
            >
              Get Started
            </MagneticButton>
          </div>

          {/* Mobile Menu Action */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-white/[0.05] bg-[#050505] px-6 py-6 flex flex-col gap-4 text-zinc-400 text-sm font-semibold"
            >
              <button onClick={() => { setMobileMenuOpen(false); smoothScrollTo('features'); }} className="text-left py-1 hover:text-white">Features</button>
              <button onClick={() => { setMobileMenuOpen(false); smoothScrollTo('workflow'); }} className="text-left py-1 hover:text-white">Workflow</button>
              <button onClick={() => { setMobileMenuOpen(false); smoothScrollTo('intelligence'); }} className="text-left py-1 hover:text-white">Intelligence</button>
              <button onClick={() => { setMobileMenuOpen(false); smoothScrollTo('faq'); }} className="text-left py-1 hover:text-white">FAQ</button>
              
              <div className="h-px bg-white/[0.04] my-2" />

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => { setMobileMenuOpen(false); router.push('/auth'); }}
                  variant="outline"
                  className="w-full border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 text-xs font-semibold py-2.5"
                >
                  Dashboard
                </Button>
                <Button
                  onClick={() => { setMobileMenuOpen(false); router.push('/auth'); }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold text-xs py-2.5"
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section Container */}
      <section className="relative max-w-[1440px] mx-auto px-6 md:px-10 xl:px-16 pt-16 md:pt-28 pb-20 text-center flex flex-col items-center overflow-x-hidden">
        
        {/* Section 1: Hero Centered Copy Content */}
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto w-full">
          {/* Subtitle Badge */}
          <ScrollReveal delay={0} y={15}>
            <div 
              onClick={() => router.push('/auth')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-950/30 text-cyan-400 text-[11px] font-bold tracking-wide uppercase mb-8 cursor-pointer hover:border-cyan-500/40 transition-all duration-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Risk Intelligence Platform</span>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-500" />
            </div>
          </ScrollReveal>

          {/* Enterprise Title */}
          <ScrollReveal delay={0.1} y={20} className="w-full">
            <h1 className="font-display font-extrabold tracking-tight leading-[1.05] text-gradient-white text-center text-6xl md:text-8xl max-w-5xl mx-auto">
              <span className="block">Understand PR Risk</span>
              <span className="block">Before Merge</span>
            </h1>
          </ScrollReveal>

          {/* Subtitle Description */}
          <ScrollReveal delay={0.2} y={20}>
            <p className="text-zinc-400 font-sans text-base sm:text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed text-center">
              Kryon analyzes pull requests, predicts hidden risk, generates testing intelligence, and creates Playwright specifications before bugs reach production.
            </p>
          </ScrollReveal>

          {/* Action CTAs */}
          <ScrollReveal delay={0.3} y={20}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
              <MagneticButton
                onClick={() => router.push('/auth')}
                className="w-full sm:w-auto px-8 h-13 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold text-sm tracking-wide shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Start Free Analysis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>

              <Button
                onClick={() => smoothScrollTo('workflow')}
                variant="outline"
                className="w-full sm:w-auto border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:text-white text-zinc-300 h-13 px-8 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer"
              >
                View Workflow
              </Button>
            </div>
          </ScrollReveal>

          {/* Security Indicator */}
          <ScrollReveal delay={0.35} y={0}>
            <div className="text-xs text-zinc-500 mt-5 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-500/70" />
              <span>Zero-Trust security. We process code transiently; no storage.</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Section 2: Full Width Dashboard Preview Showcase Container */}
        <div className="w-full max-w-[1280px] md:max-w-[1400px] mt-16 md:mt-24 overflow-hidden relative flex justify-center items-center">
          <ScrollReveal delay={0.4} y={35} className="w-full">
            <div 
              className="relative rounded-2xl border border-white/[0.06] bg-zinc-950/40 p-4 md:p-6 shadow-[0_0_100px_rgba(0,0,0,0.9)] backdrop-blur-md w-full overflow-hidden group aspect-[16/10] flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/[0.03] via-transparent to-purple-500/[0.03] rounded-2xl pointer-events-none" />
              
              {/* Mock Header Controls */}
              <div className="flex items-center justify-between border-b border-white/[0.04] bg-zinc-950/80 px-6 py-4.5 md:px-8 md:py-6 rounded-t-xl flex-none">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500/40" />
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500/40" />
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/40" />
                  </div>
                  <span className="text-[11px] md:text-sm text-zinc-500 font-mono ml-4 select-none">kryon-pipeline-visualizer.sh</span>
                </div>
                <div className="text-[11px] md:text-sm text-cyan-400 font-mono flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Live Intelligence Engine Scanning</span>
                </div>
              </div>

              {/* Inner Dashboard visual */}
              <div className="p-4 md:p-8 bg-black/60 rounded-b-xl grid grid-cols-12 gap-6 md:gap-10 text-left items-stretch flex-1 overflow-hidden">
                
                {/* Left Column: Visual Pipeline Steps */}
                <div className="col-span-12 md:col-span-6 flex flex-col justify-between h-full">
                  <div className="text-xs md:text-sm text-zinc-500 font-bold font-mono tracking-wider uppercase mb-3 flex-none">Analysis Processing Queue</div>
                  
                  <div className="flex-1 flex flex-col justify-between gap-3 md:gap-4">
                    {PIPELINE_PHASES.map((phase, idx) => {
                      const isActive = idx === pipelineStep;
                      return (
                        <div 
                          key={phase.id} 
                          className={`relative flex items-center gap-3 md:gap-4 p-2 md:p-3.5 rounded-xl md:rounded-2xl border transition-all duration-500 flex-1 min-h-0 ${isActive ? 'bg-zinc-900/50 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.06)] translate-x-2' : 'bg-transparent border-transparent opacity-50'}`}
                        >
                          <div className={`w-8 md:w-12 h-8 md:h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${isActive ? `${phase.bg} ${phase.border} ring-2 ring-cyan-500/20` : 'bg-zinc-900 border-white/[0.04]'}`}>
                            <phase.icon className={`w-4 md:w-6 h-4 md:h-6 ${isActive ? phase.color : 'text-zinc-500'}`} />
                          </div>
                          <div>
                            <div className={`text-[10px] md:text-sm lg:text-base font-bold transition-colors ${isActive ? 'text-white' : 'text-zinc-400'}`}>{phase.label}</div>
                            <div className="text-[8px] md:text-xs text-zinc-500 font-mono mt-0.5">
                              {isActive ? 'Synthesizing data delta...' : 'Processed successfully'}
                            </div>
                          </div>
                          
                          {/* Connecting moving node line indicator */}
                          {idx < 4 && (
                            <div className="absolute left-[24px] md:left-[38px] top-[40px] md:top-[62px] w-0.5 h-6 md:h-10 bg-zinc-900 pointer-events-none">
                              {isActive && (
                                <motion.div
                                  initial={{ top: 0 }}
                                  animate={{ top: '100%' }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                  className="absolute left-0 w-full h-2.5 bg-cyan-400 rounded-full"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Middle Border line */}
                <div className="hidden md:flex col-span-1 justify-center items-center">
                  <div className="h-full w-px bg-white/[0.04]" />
                </div>

                {/* Right Column: Live Floating Metrics */}
                <div className="col-span-12 md:col-span-5 flex flex-col justify-between h-full">
                  <div className="text-xs md:text-sm text-zinc-500 font-bold font-mono tracking-wider uppercase mb-3 flex-none">Risk Telemetry Indicators</div>
                  
                  <div className="flex-1 grid grid-rows-5 gap-3 md:gap-4 min-h-0">
                    {/* 1. Security Check Card */}
                    <div className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-cyan-500/20 transition-all duration-300 flex items-center justify-between min-h-0">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 md:w-12 h-8 md:h-12 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-400 flex-none">
                          <Shield className="w-4 md:w-6 h-4 md:h-6" />
                        </div>
                        <div>
                          <div className="text-[9px] md:text-xs text-zinc-500 font-semibold font-mono tracking-wider uppercase">SECURITY</div>
                          <div className="text-[10px] md:text-sm lg:text-base font-bold text-white mt-0.5">Access Boundary Violation</div>
                        </div>
                      </div>
                      <span className="text-[8px] md:text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 md:px-3 py-0.5 md:py-1 rounded border border-rose-500/20 flex-none">HIGH RISK</span>
                    </div>

                    {/* 2. Schema Check Card */}
                    <div className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-cyan-500/20 transition-all duration-300 flex items-center justify-between min-h-0">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 md:w-12 h-8 md:h-12 rounded-xl flex items-center justify-center bg-teal-500/10 border border-teal-500/20 text-teal-400 flex-none">
                          <Layers className="w-4 md:w-6 h-4 md:h-6" />
                        </div>
                        <div>
                          <div className="text-[9px] md:text-xs text-zinc-500 font-semibold font-mono tracking-wider uppercase">SCHEMA</div>
                          <div className="text-[10px] md:text-sm lg:text-base font-bold text-white mt-0.5">gRPC Endpoint Added</div>
                        </div>
                      </div>
                      <span className="text-[8px] md:text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 md:px-3 py-0.5 md:py-1 rounded border border-teal-500/20 flex-none">STABLE</span>
                    </div>

                    {/* 3. Performance Latency Card */}
                    <div className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-cyan-500/20 transition-all duration-300 flex items-center justify-between min-h-0">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 md:w-12 h-8 md:h-12 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex-none">
                          <Zap className="w-4 md:w-6 h-4 md:h-6" />
                        </div>
                        <div>
                          <div className="text-[9px] md:text-xs text-zinc-500 font-semibold font-mono tracking-wider uppercase">PERFORMANCE</div>
                          <div className="text-[10px] md:text-sm lg:text-base font-bold text-white mt-0.5">Estimated Change</div>
                        </div>
                      </div>
                      <span className="text-[8px] md:text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 md:px-3 py-0.5 md:py-1 rounded border border-cyan-500/20 transition-all duration-300 w-[44px] md:w-[60px] text-center flex-none">{liveLatency}ms</span>
                    </div>

                    {/* 4. Playwright Generation Card */}
                    <div className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-cyan-500/20 transition-all duration-300 flex items-center justify-between min-h-0">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 md:w-12 h-8 md:h-12 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex-none">
                          <FileCode className="w-4 md:w-6 h-4 md:h-6" />
                        </div>
                        <div>
                          <div className="text-[9px] md:text-xs text-zinc-500 font-semibold font-mono tracking-wider uppercase">PLAYWRIGHT GENERATION</div>
                          <div className="text-[10px] md:text-sm lg:text-base font-bold text-white mt-0.5">Generated Specs: 3</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 text-[8px] md:text-xs font-mono text-zinc-400 items-start flex-none">
                        <div className="flex items-center gap-1 text-cyan-400">
                          <Check className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                          <span>Security</span>
                        </div>
                        <div className="flex items-center gap-1 text-cyan-400">
                          <Check className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                          <span>Regression</span>
                        </div>
                        <div className="flex items-center gap-1 text-cyan-400">
                          <Check className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                          <span>Business Flow</span>
                        </div>
                      </div>
                    </div>

                    {/* 5. Vulnerability Score Banner */}
                    <div className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl border border-cyan-500/20 bg-cyan-950/15 flex items-center justify-between shadow-[0_0_15px_rgba(34,211,238,0.02)] min-h-0">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 md:w-12 h-8 md:h-12 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex-none">
                          <Activity className="w-4 md:w-6 h-4 md:h-6 animate-pulse" />
                        </div>
                        <div>
                          <div className="text-[9px] md:text-xs text-cyan-500 font-bold font-mono tracking-wider uppercase">VULNERABILITY</div>
                          <div className="text-[8px] md:text-xs text-zinc-400 mt-0.5">Branch risk telemetry score</div>
                        </div>
                      </div>
                      <span className="text-base md:text-xl lg:text-2xl font-mono font-black text-cyan-400 transition-all duration-500 flex-none">{liveRiskScore}%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </ScrollReveal>
        </div>

      </section>

      {/* Workflow Section Container */}
      <section id="workflow" className="relative border-t border-white/[0.04] bg-[#070707] py-24 scroll-mt-20 overflow-hidden">
        
        {/* Subtle grid line decoration */}
        <div className="absolute top-0 bottom-0 left-[50%] -translate-x-[50%] w-px bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <ScrollReveal>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3.5 py-1.5 rounded-full">Execution Pipeline</span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
                How Kryon Works
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-zinc-400 mt-3 text-sm sm:text-base leading-relaxed">
                A seamless sequence translating code changes into deep actionable testing intelligence.
              </p>
            </ScrollReveal>
          </div>

          {/* Workflow Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
            {WORKFLOW_STEPS.map((node, index) => {
              const Icon = STEP_ICONS[index];
              const isActive = workflowStep === index;
              const isLineActive = workflowStep === index;
              const tabletOrder = TABLET_ORDERS[index];
              const desktopOrder = DESKTOP_ORDERS[index];

              return (
                <ScrollReveal 
                  key={node.step} 
                  delay={index * 0.05} 
                  className={`relative group flex flex-col h-full order-${index + 1} ${tabletOrder} ${desktopOrder}`}
                >
                  {/* Right Line (flows right) */}
                  {index !== 3 && index !== 7 && (
                    <div 
                      className={`absolute top-1/2 right-0 h-[2px] bg-zinc-900 pointer-events-none translate-x-full -translate-y-1/2 z-0 overflow-hidden ${
                        (index === 0 || index === 1 || index === 2) ? 'lg:block lg:w-8' : 'lg:hidden'
                      } ${
                        (index === 0 || index === 4) ? 'md:block md:w-6 lg:w-8' : 'md:hidden'
                      } hidden`}
                    >
                      {isLineActive && (
                        <motion.div
                          initial={{ left: '-100%' }}
                          animate={{ left: '100%' }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-teal-400"
                        />
                      )}
                    </div>
                  )}

                  {/* Left Line (flows left) */}
                  {index !== 0 && index !== 4 && (
                    <div 
                      className={`absolute top-1/2 left-0 h-[2px] bg-zinc-900 pointer-events-none -translate-x-full -translate-y-1/2 z-0 overflow-hidden ${
                        (index === 4 || index === 5 || index === 6) ? 'lg:block lg:w-8' : 'lg:hidden'
                      } ${
                        (index === 2 || index === 6) ? 'md:block md:w-6 lg:w-8' : 'md:hidden'
                      } hidden`}
                    >
                      {isLineActive && (
                        <motion.div
                          initial={{ right: '-100%' }}
                          animate={{ right: '100%' }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-l from-transparent via-cyan-400 to-teal-400"
                        />
                      )}
                    </div>
                  )}

                  {/* Down Line (flows down) */}
                  {index !== 7 && (
                    <div 
                      className={`absolute bottom-0 left-1/2 w-[2px] bg-zinc-900 pointer-events-none translate-y-full -translate-x-1/2 z-0 overflow-hidden ${
                        index === 3 ? 'lg:block lg:h-8' : 'lg:hidden'
                      } ${
                        (index === 1 || index === 3 || index === 5) ? 'md:block md:h-6 lg:h-8' : 'md:hidden'
                      } block h-6`}
                    >
                      {isLineActive && (
                        <motion.div
                          initial={{ top: '-100%' }}
                          animate={{ top: '100%' }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-cyan-400 to-teal-400"
                        />
                      )}
                    </div>
                  )}

                  {/* Visual Card */}
                  <div className={`relative z-10 p-px rounded-xl transition-all duration-500 h-full flex flex-col ${
                    isActive 
                      ? 'bg-gradient-to-b from-cyan-500/50 to-teal-500/50 shadow-[0_0_30px_rgba(34,211,238,0.15)] scale-[1.02]' 
                      : 'bg-zinc-800/80 hover:bg-gradient-to-b hover:from-cyan-500/20 hover:to-teal-500/20 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(34,211,238,0.05)]'
                  }`}>
                    <div className={`bg-[#050507]/90 p-6 rounded-[11px] flex flex-col justify-between flex-1 h-full shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-500 border border-white/[0.01] ${isActive ? 'bg-[#060b11]/90' : ''}`}>
                      
                      <div className="flex items-start justify-between gap-3.5 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 flex-none ${
                          isActive 
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                            : 'bg-zinc-900 border-white/[0.04] text-zinc-500 group-hover:text-zinc-300 group-hover:border-white/[0.08]'
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                        </div>
                        <div className="flex flex-col items-end flex-none">
                          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee] scale-125' : 'bg-zinc-800'}`} />
                          <span className="font-mono text-[9px] text-zinc-600 mt-1.5">NODE_0{node.step}</span>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className={`font-display font-bold text-sm tracking-tight transition-colors duration-300 ${
                            isActive ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
                          }`}>{node.title}</h3>
                          <p className="text-xs text-zinc-400 leading-relaxed mt-2.5 mb-4">
                            {node.desc}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-white/[0.02]">
                          {node.metadata.map((meta, i) => (
                            <span 
                              key={i} 
                              className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors duration-300 ${
                                isActive 
                                  ? 'text-cyan-400 bg-cyan-950/20 border-cyan-500/20 shadow-[0_0_8px_rgba(34,211,238,0.05)]' 
                                  : 'text-zinc-500 bg-white/[0.01] border-white/[0.03] group-hover:text-zinc-400 group-hover:border-white/[0.06]'
                              }`}
                            >
                              {meta}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Merge Ready Indicator Banner */}
          <div className="h-16 mt-16 flex justify-center items-center">
            <div 
              className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full border transition-all duration-500 backdrop-blur-sm ${
                workflowStep === 8 
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)] opacity-100 scale-100' 
                  : 'border-white/[0.02] bg-white/[0.01] text-zinc-600 opacity-40 scale-95'
              }`}
            >
              <CheckCircle2 className={`w-5 h-5 ${workflowStep === 8 ? 'animate-bounce text-emerald-400' : ''}`} />
              <span className="text-sm font-bold tracking-wider uppercase font-mono">
                {workflowStep === 8 ? 'Merge Ready — Pipeline Successful' : 'Processing Pipeline Stages...'}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section Container (Bento Grid Redesign) */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24 scroll-mt-20">
        
        <div className="text-center max-w-4xl mx-auto mb-24">
          <ScrollReveal>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3.5 py-1.5 rounded-full">Core Capabilities</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mt-4">
              Engineering Intelligence For Every Pull Request
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-zinc-400 mt-4 text-base sm:text-lg md:text-xl leading-relaxed">
              Kryon transforms pull requests into risk analysis, testing intelligence, architecture insights, and merge confidence before code reaches production.
            </p>
          </ScrollReveal>
        </div>

        {/* Bento Grid (Asymmetric Grid Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          
          {/* 1. Risk Intelligence (Row 1, Col 1-2 - Wide Card) */}
          <ScrollReveal delay={0.05} className="h-full md:col-span-2">
            <div className="group relative p-px rounded-3xl bg-zinc-900/40 hover:bg-gradient-to-tr hover:from-cyan-500/20 hover:to-teal-500/20 transition-all duration-500 h-full shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
              <div className="bg-[#050507]/90 p-8 rounded-[23px] h-full flex flex-col justify-between border border-white/[0.02] hover:bg-[#060b11]/90 transition-colors duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 h-full">
                  {/* Left Column */}
                  <div className="flex flex-col justify-between flex-1 space-y-4 text-left">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-950/20 border border-cyan-500/10 flex items-center justify-center text-cyan-400">
                          <Shield className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="text-base font-bold text-zinc-100 tracking-tight">Risk Intelligence</h3>
                      </div>
                      <p className="text-zinc-400 text-xs font-light leading-relaxed mt-2.5">
                        Detect hidden security, regression and business logic risks.
                      </p>
                    </div>

                    <div className="border-t border-white/[0.04] pt-4">
                      <div className="bg-zinc-950/40 rounded-xl p-3 border border-white/[0.02] space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">Security Risks</span>
                          <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                          <span className="text-zinc-300 font-semibold">3</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">Regression Risks</span>
                          <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                          <span className="text-zinc-300 font-semibold">5</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">Logic Risks</span>
                          <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                          <span className="text-zinc-300 font-semibold">2</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Primary Metric) */}
                  <div className="flex flex-col items-start md:items-end justify-center md:border-l md:border-white/[0.04] md:pl-8 min-w-[140px]">
                    <div className="text-5xl md:text-6xl font-black text-white tracking-tighter font-mono bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                      87%
                    </div>
                    <div className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase mt-2">
                      Detection Accuracy
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </ScrollReveal>

          {/* 2. Coverage Intelligence (Row 1, Col 3 - Medium Card) */}
          <ScrollReveal delay={0.1} className="h-full md:col-span-1">
            <div className="group relative p-px rounded-3xl bg-zinc-900/40 hover:bg-gradient-to-tr hover:from-cyan-500/20 hover:to-teal-500/20 transition-all duration-500 h-full shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
              <div className="bg-[#050507]/90 p-6 md:p-8 rounded-[23px] h-full flex flex-col justify-between border border-white/[0.02] hover:bg-[#060b11]/90 transition-colors duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex flex-col justify-between h-full space-y-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950/20 border border-cyan-500/10 flex items-center justify-center text-cyan-400">
                        <Beaker className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="text-base font-bold text-zinc-100 tracking-tight">Coverage Intelligence</h3>
                    </div>
                    <p className="text-zinc-400 text-xs font-light leading-relaxed">
                      Predict untested execution paths before code reaches production.
                    </p>
                  </div>

                  <div className="border-t border-white/[0.04] pt-4">
                    <div className="bg-zinc-950/40 rounded-xl p-3 border border-white/[0.02] space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-500">Coverage Gap</span>
                        <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                        <span className="text-zinc-300 font-semibold">14%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-500">Untested Files</span>
                        <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                        <span className="text-zinc-300 font-semibold">7</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-500">Critical Paths</span>
                        <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                        <span className="text-zinc-300 font-semibold">2</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.04] pt-4">
                    <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter leading-none">14%</div>
                    <div className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase mt-1.5">Coverage Gap Found</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* 3. Merge Intelligence (Row 2, Col 1-2 - Wide Card) */}
          <ScrollReveal delay={0.15} className="h-full md:col-span-2">
            <div className="group relative p-px rounded-3xl bg-zinc-900/40 hover:bg-gradient-to-tr hover:from-cyan-500/20 hover:to-teal-500/20 transition-all duration-500 h-full shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
              <div className="bg-[#050507]/90 p-8 rounded-[23px] h-full flex flex-col justify-between border border-white/[0.02] hover:bg-[#060b11]/90 transition-colors duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 h-full">
                  {/* Left Column */}
                  <div className="flex flex-col justify-between flex-1 space-y-4 text-left">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-950/20 border border-cyan-500/10 flex items-center justify-center text-cyan-400">
                          <GitMerge className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="text-base font-bold text-zinc-100 tracking-tight">Merge Intelligence</h3>
                      </div>
                      <p className="text-zinc-400 text-xs font-light leading-relaxed mt-2.5">
                        Know when a pull request is safe to merge.
                      </p>
                    </div>

                    <div className="border-t border-white/[0.04] pt-4">
                      <div className="bg-zinc-950/40 rounded-xl p-3 border border-white/[0.02] space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">Confidence</span>
                          <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                          <span className="text-cyan-400 font-semibold">92%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">Risk Level</span>
                          <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                          <span className="text-emerald-400 font-semibold">Low</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">Ready To Merge</span>
                          <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                          <span className="text-emerald-400 font-semibold">Yes</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Primary Metric) */}
                  <div className="flex flex-col items-start md:items-end justify-center md:border-l md:border-white/[0.04] md:pl-8 min-w-[140px]">
                    <div className="text-5xl md:text-6xl font-black text-white tracking-tighter font-mono bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                      92%
                    </div>
                    <div className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase mt-2">
                      Merge Confidence
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </ScrollReveal>

          {/* 4. Testing Intelligence (Row 2, Col 3 - Medium Card) */}
          <ScrollReveal delay={0.2} className="h-full md:col-span-1">
            <div className="group relative p-px rounded-3xl bg-zinc-900/40 hover:bg-gradient-to-tr hover:from-cyan-500/20 hover:to-teal-500/20 transition-all duration-500 h-full shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
              <div className="bg-[#050507]/90 p-6 md:p-8 rounded-[23px] h-full flex flex-col justify-between border border-white/[0.02] hover:bg-[#060b11]/90 transition-colors duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex flex-col justify-between h-full space-y-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950/20 border border-cyan-500/10 flex items-center justify-center text-cyan-400">
                        <Terminal className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="text-base font-bold text-zinc-100 tracking-tight">Testing Intelligence</h3>
                    </div>
                    <p className="text-zinc-400 text-xs font-light leading-relaxed">
                      Automatically create Security, Regression and Business Flow validation plans.
                    </p>
                  </div>

                  <div className="border-t border-white/[0.04] pt-4">
                    <div className="bg-zinc-950/40 rounded-xl p-3 border border-white/[0.02] space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-500">Security Tests</span>
                        <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                        <span className="text-zinc-300 font-semibold">4</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-500">Regression Tests</span>
                        <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                        <span className="text-zinc-300 font-semibold">3</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-zinc-500">Business Flows</span>
                        <div className="flex-1 border-b border-dashed border-zinc-800/40 mx-2" />
                        <span className="text-zinc-300 font-semibold">2</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.04] pt-4">
                    <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tighter leading-none">3</div>
                    <div className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase mt-1.5">Test Plans Generated</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Product Demo Interactive Section */}
      <section id="sandbox" className="relative border-t border-white/[0.04] bg-[#070707] pt-24 pb-20">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-cyan-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3.5 py-1.5 rounded-full">INTERACTIVE SANDBOX</span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
                See Kryon In Action
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-zinc-400 mt-3 text-sm sm:text-base leading-relaxed">
                Explore the actual Kryon workspace used to analyze pull requests, detect risk, and generate testing intelligence.
              </p>
            </ScrollReveal>
          </div>

          {/* PRODUCT PREVIEW */}
          <ScrollReveal delay={0.25} y={35}>
            <div className="relative rounded-xl border border-white/[0.08] bg-[#070709] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] hover:border-cyan-500/10 transition-colors duration-500 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-stretch">
                {/* Sidebar Image */}
                <div className="w-full md:w-[220px] flex-shrink-0 border-r border-white/[0.04] bg-black/25">
                  <img 
                    src="/sidenav.png" 
                    alt="Kryon Sidebar" 
                    className="w-full h-auto object-cover select-none pointer-events-none" 
                  />
                </div>
                {/* Main Dashboard Panel Image */}
                <div className="flex-1 bg-black/40">
                  <img 
                    src="/main.png" 
                    alt="Kryon Main Dashboard" 
                    className="w-full h-auto object-cover select-none pointer-events-none" 
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Product Generates Capabilities Grid Section */}
      <section id="intelligence" className="relative border-t border-white/[0.04] py-24 scroll-mt-20">
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <ScrollReveal>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3.5 py-1.5 rounded-full">Outputs</span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
                What Kryon Generates
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-zinc-400 mt-3 text-sm sm:text-base leading-relaxed">
                Every analysis run produces structured engineering intelligence before code reaches production.
              </p>
            </ScrollReveal>
          </div>

          {/* 3x2 Grid of Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Risk Analysis', desc: 'Detect security, regression and business logic risks.', icon: Shield },
              { title: 'Coverage Prediction', desc: 'Identify untested execution paths.', icon: Beaker },
              { title: 'Test Strategy', desc: 'Generate targeted validation plans.', icon: Target },
              { title: 'Playwright Specs', desc: 'Create executable browser testing scenarios.', icon: Terminal },
              { title: 'Architecture Impact', desc: 'Understand downstream service and schema effects.', icon: Network },
              { title: 'Merge Intelligence', desc: 'Determine release confidence before deployment.', icon: GitMerge }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={idx * 0.05}>
                  <div className="group relative p-px rounded-2xl bg-zinc-900/40 hover:bg-gradient-to-tr hover:from-cyan-500/20 hover:to-teal-500/20 transition-all duration-300 h-full shadow-lg">
                    <div className="bg-[#050507]/90 p-6 rounded-[15px] h-full flex flex-col justify-between border border-white/[0.02] hover:bg-[#060b11]/90 transition-colors duration-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      <div className="space-y-4 text-left">
                        <div className="w-8 h-8 rounded-lg bg-cyan-950/20 border border-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/30 transition-colors duration-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-display font-semibold text-white text-base tracking-tight">{feature.title}</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">{feature.desc}</p>
                      </div>

                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* Large Get Started Call-To-Action Section */}
      <section className="relative border-t border-white/[0.04] py-24">
        
        {/* Neon glowing center decoration */}
        <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[380px] h-[380px] bg-cyan-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <ScrollReveal>
            <div className="relative rounded-2xl border border-white/[0.05] bg-gradient-to-b from-[#0a0a0c] to-black p-8 sm:p-14 md:p-20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-w-5xl mx-auto">
              
              {/* Internal absolute drifting grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#16161c_1px,transparent_1px),linear-gradient(to_bottom,#16161c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none animate-grid-drift opacity-60" />

              <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">ENGINEERING INTELLIGENCE</span>
                
                <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
                  Understand Pull Request Risk Before Merge
                </h2>
                
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
                  Connect your repository, analyze pull requests, identify hidden risk, predict coverage gaps, and generate targeted testing intelligence before code reaches production.
                </p>

                {/* Feature Chips */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-4 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Pull Request Risk Analysis</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Coverage Gap Prediction</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Playwright Test Generation</span>
                  </span>
                </div>

                {/* Primary and Secondary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 max-w-md mx-auto sm:max-w-none">
                  <MagneticButton
                    onClick={() => router.push('/auth')}
                    className="w-full sm:w-auto px-8 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_35px_rgba(34,211,238,0.4)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>Connect GitHub Repository</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </MagneticButton>

                  <button
                    onClick={() => smoothScrollTo('sandbox')}
                    className="w-full sm:w-auto px-8 h-12 rounded-lg border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.01] hover:bg-white/[0.03] text-white font-medium text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View Demo Analysis</span>
                  </button>
                </div>

              </div>

            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Animated Accordion FAQ Section Container */}
      <section id="faq" className="relative border-t border-white/[0.04] py-24 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="text-center max-w-5xl mx-auto mb-24">
            <ScrollReveal>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3.5 py-1.5 rounded-full">Knowledge Base</span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mt-4 md:whitespace-nowrap">
                Frequently Asked Questions
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-zinc-400 mt-4 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
                Everything you need to know about the risk prediction and testing pipeline.
              </p>
            </ScrollReveal>
          </div>

          {/* Accordion Questions container */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                {
                  question: 'What does Kryon analyze?',
                  answer: 'Kryon analyzes pull requests to identify security risks, regression risks, architectural changes, coverage gaps, and areas that may require additional validation before merge.'
                },
                {
                  question: 'How is Kryon different from code review tools?',
                  answer: 'Traditional code review tools focus on code quality, style rules, and static analysis.\n\nKryon focuses on pull request intelligence by identifying risk, predicting coverage gaps, and generating targeted testing recommendations based on code changes.'
                },
                {
                  question: 'Can Kryon generate Playwright specs?',
                  answer: 'Yes. Kryon can generate Playwright testing specifications based on the behavior affected by a pull request, helping teams validate critical user flows faster.'
                },
                {
                  question: 'Does Kryon modify my code?',
                  answer: 'No. Kryon only analyzes pull requests and generates risk reports, testing intelligence, and recommendations.\n\nYour source code is never modified automatically.'
                },
                {
                  question: 'When should teams use Kryon?',
                  answer: 'Kryon is designed to be used before code review and before merge, helping engineers identify risks and testing gaps early in the development cycle.'
                }
              ].map((faq, index) => (
                <FAQAccordionItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQIndex === index}
                  onClick={() => setOpenFAQIndex(openFAQIndex === index ? null : index)}
                />
              ))}
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Refactored Developer-focused Centered Footer */}
      <footer className="border-t border-white/[0.04] bg-[#030303] py-10 text-xs text-zinc-500 relative z-10">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          
          {/* Main 2-Column Content Section */}
          <div className="w-full flex flex-col md:flex-row items-start justify-between gap-8">
            
            {/* LEFT SIDE: Branding */}
            <div className="flex flex-col items-start text-left space-y-3 max-w-md">
              <KryonLogo size="lg" />
              <div className="space-y-1.5">
                <h3 className="font-display text-sm font-semibold tracking-tight text-zinc-200">
                  Engineering Intelligence For Every Pull Request
                </h3>
                <p className="text-zinc-500 text-xs font-light leading-relaxed">
                  Analyze risk before merge. <br className="hidden sm:inline" />
                  Generate testing intelligence automatically.
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: Navigation */}
            <nav className="flex flex-row md:flex-col items-center md:items-end flex-wrap gap-x-6 gap-y-2 text-sm font-semibold pt-1">
              <button 
                onClick={() => smoothScrollTo('features')} 
                className="text-zinc-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-300 cursor-pointer"
              >
                Features
              </button>
              <button 
                onClick={() => smoothScrollTo('workflow')} 
                className="text-zinc-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-300 cursor-pointer"
              >
                Workflow
              </button>
              <button 
                onClick={() => smoothScrollTo('faq')} 
                className="text-zinc-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-300 cursor-pointer"
              >
                FAQ
              </button>
              <a 
                href="https://github.com/Priyanshu-ai902/E2E" 
                target="_blank" 
                rel="noreferrer" 
                className="text-zinc-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-300 inline-flex items-center gap-1"
              >
                GitHub ↗
              </a>
            </nav>

          </div>

          {/* Compact Inline Badges Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
            {[
              'Risk Analysis',
              'Coverage Prediction',
              'Playwright Generation',
              'Merge Intelligence'
            ].map((badge) => (
              <span 
                key={badge}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-cyan-950/20 text-cyan-400 border border-cyan-500/10 hover:border-cyan-500/20 hover:bg-cyan-950/30 transition-all duration-300 cursor-default select-none"
              >
                <span className="w-1 h-1 rounded-full bg-cyan-500" />
                {badge}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full border-t border-white/[0.04]" />

          {/* Bottom Row */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-600">
            <div className="font-mono">
              <span>© 2026 Kryon</span>
            </div>
            
            <div className="text-zinc-500 font-sans tracking-wide text-xs text-center md:text-left">
              Built for developers shipping production code.
            </div>
            
            <div>
              <a 
                href="https://github.com/Priyanshu-ai902/E2E" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-cyan-400 hover:drop-shadow-[0_0_6px_rgba(34,211,238,0.6)] transition-all duration-300 font-medium"
              >
                GitHub ↗
              </a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
