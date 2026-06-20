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

// Mock Scenarios for the Interactive Product Demo Section
const SCENARIOS = [
  {
    id: 'security',
    label: '🔓 Security & Privileges',
    filename: 'lib/auth.ts',
    branch: 'feature/rbac-staff',
    description: 'Relaxing privilege access level validation in admin operations.',
    diff: [
      { type: 'normal', text: 'export async function getAdminSettings(req, res) {' },
      { type: 'normal', text: '  const session = await getSession(req);' },
      { type: 'deletion', text: '-  if (session.user.role !== "admin") {' },
      { type: 'addition', text: '+  if (session.user.role !== "admin" && session.user.role !== "staff") {' },
      { type: 'normal', text: '    return res.status(403).json({ error: "Unauthorized" });' },
      { type: 'normal', text: '  }' },
      { type: 'normal', text: '  return res.json(db.settings.findMany());' },
      { type: 'normal', text: '}' }
    ],
    aiFindings: {
      summary: 'Relaxes authorization controls by granting staff roles equivalent access to administrative database operations.',
      risks: [
        'Privilege escalation: staff roles can query and overwrite global configuration parameters.',
        'Broken Function Level Authorization (OWASP API1:2023).'
      ],
      recommendations: [
        'Enforce strict role verification via middleware parameters.',
        'Segregate settings endpoints into staff-read and admin-write schemas.'
      ],
      riskLevel: 'HIGH',
      blastRadius: {
        frontend: false,
        backend: true,
        database: true,
        infrastructure: false
      }
    },
    testStrategy: {
      strategy: 'Validate boundary checks specifically mapping role classifications against authorization returns.',
      tests: [
        {
          title: 'Assert ADMIN role can view configuration',
          category: 'SECURITY',
          priority: 'CRITICAL',
          scenario: 'Authenticate as admin, request settings, expect status code 200.',
          expected: 'Return value includes database settings structure.'
        },
        {
          title: 'Assert STAFF role cannot write settings',
          category: 'SECURITY',
          priority: 'CRITICAL',
          scenario: 'Authenticate as staff, attempt POST request to settings endpoint, expect status code 403.',
          expected: 'Return value contains Access Denied structure.'
        }
      ]
    },
    playwrightCode: `import { test, expect } from '@playwright/test';

test('staff user cannot retrieve administrative settings', async ({ request }) => {
  const response = await request.get('/api/admin/settings', {
    headers: { 'Cookie': 'session_token=staff_mock_cookie_129' }
  });
  
  expect(response.status()).toBe(403);
  const data = await response.json();
  expect(data.error).toContain('Unauthorized');
});`
  },
  {
    id: 'concurrency',
    label: '🔄 Concurrency Risk',
    filename: 'lib/db/token-refresh.ts',
    branch: 'fix/token-rotation-race',
    description: 'Preventing double-spend database lock during concurrent JWT rotation.',
    diff: [
      { type: 'normal', text: 'export async function rotateRefreshToken(token) {' },
      { type: 'normal', text: '  const stored = await db.tokens.findFirst({ token });' },
      { type: 'normal', text: '  if (stored.isUsed) {' },
      { type: 'normal', text: '    await revokeAllFamily(stored.familyId);' },
      { type: 'deletion', text: '-    throw new SecurityError("Token reuse detected!");' },
      { type: 'addition', text: '+    // Handle concurrent refresh overlap window' },
      { type: 'addition', text: '+    if (Date.now() - stored.usedAt < 500) return stored.newAccessToken;' },
      { type: 'addition', text: '+    throw new SecurityError("Token reuse detected!");' },
      { type: 'normal', text: '  }' }
    ],
    aiFindings: {
      summary: 'Mitigates token rotation race conditions where high-frequency duplicate requests trigger false-positive token family revoking.',
      risks: [
        'Race conditions under unstable HTTP connection retries.',
        'Denial of service for legitimate users experiencing overlapping token calls.'
      ],
      recommendations: [
        'Enforce atomic updates on token status changes.',
        'Limit the overlap grace window to exactly 300ms max.'
      ],
      riskLevel: 'MEDIUM',
      blastRadius: {
        frontend: false,
        backend: true,
        database: true,
        infrastructure: false
      }
    },
    testStrategy: {
      strategy: 'Simulate high concurrency JWT token requests within microsecond margins.',
      tests: [
        {
          title: 'Token Rotation Grace Window Validation',
          category: 'REGRESSION',
          priority: 'HIGH',
          scenario: 'Rotate same token twice in overlapping 50ms calls, verify second call receives the same Access Token without revoking session.',
          expected: 'Status returns successfully with matching access tokens.'
        }
      ]
    },
    playwrightCode: `import { test, expect } from '@playwright/test';

test('race condition token refresh is de-duplicated', async ({ request }) => {
  const [res1, res2] = await Promise.all([
    request.post('/api/auth/refresh', { data: { token: 'refresh_tk_99' } }),
    request.post('/api/auth/refresh', { data: { token: 'refresh_tk_99' } })
  ]);
  
  expect(res1.status()).toBe(200);
  expect(res2.status()).toBe(200);
  
  const d1 = await res1.json();
  const d2 = await res2.json();
  expect(d1.accessToken).toBe(d2.accessToken);
});`
  },
  {
    id: 'grpc',
    label: '📡 RPC Schema Impact',
    filename: 'services/user-service.ts',
    branch: 'refactor/grpc-exception-contract',
    description: 'Replacing raw text errors with standardized status mapping.',
    diff: [
      { type: 'normal', text: 'async function getUserData(call, callback) {' },
      { type: 'normal', text: '  try {' },
      { type: 'normal', text: '    const user = await db.users.find(call.request.id);' },
      { type: 'deletion', text: '-    if (!user) throw new Error("User index empty");' },
      { type: 'addition', text: '+    if (!user) {' },
      { type: 'addition', text: '+      return callback({ code: grpc.status.NOT_FOUND, message: "User not found" });' },
      { type: 'addition', text: '+    }' },
      { type: 'normal', text: '    callback(null, user);' },
      { type: 'normal', text: '  } catch (err) {' }
    ],
    aiFindings: {
      summary: 'Standardizes runtime user lookup failures from plain JS exceptions to mapped gRPC error statuses.',
      risks: [
        'Client-side crashes if calling integrations expect raw connection aborts rather than gRPC statuses.',
        'Incompatibility with existing JSON serializers in api-gateway modules.'
      ],
      recommendations: [
        'Run contract compatibility tests on API Gateway routes.',
        'Update documentation for integration dependencies.'
      ],
      riskLevel: 'LOW',
      blastRadius: {
        frontend: false,
        backend: true,
        database: false,
        infrastructure: false
      }
    },
    testStrategy: {
      strategy: 'Assert error response formats against RPC schemas.',
      tests: [
        {
          title: 'RPC contract status mapping',
          category: 'BUSINESS_FLOW',
          priority: 'HIGH',
          scenario: 'Query a non-existent user ID, expect response code NOT_FOUND (5).',
          expected: 'Response contains properly formatted gRPC status frame.'
        }
      ]
    },
    playwrightCode: `import { test, expect } from '@playwright/test';

test('gRPC gateway maps lookup miss to NOT_FOUND', async ({ request }) => {
  const response = await request.get('/api/users/missing_id_999');
  
  // Mapped from NOT_FOUND status
  expect(response.status()).toBe(404);
  const data = await response.json();
  expect(data.code).toBe('NOT_FOUND');
});`
  }
];

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

// Custom FAQ Accordion Item component
function FAQAccordionItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-white/[0.04] py-5">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between text-left py-2 font-medium text-white hover:text-cyan-400 transition-colors duration-300"
      >
        <span className="font-display text-base md:text-lg font-semibold tracking-tight">{question}</span>
        <div className={`w-8 h-8 rounded-full border border-white/[0.04] bg-white/[0.02] flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 border-cyan-500/25 bg-cyan-950/20 text-cyan-400' : 'text-zinc-500'}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed pt-3 pb-2 pr-10">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Landing() {
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [activeTab, setActiveTab] = useState<'risk' | 'strategy' | 'code'>('risk');
  const [isScanning, setIsScanning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Custom states for tracking scroll
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Mouse coords for glow follow effect
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

  // Custom states for live-ticking pipeline metrics
  const [pipelineStep, setPipelineStep] = useState(0);
  const [liveLatency, setLiveLatency] = useState(-8.4);
  const [liveRiskScore, setLiveRiskScore] = useState(14);

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

  // Sync interactive console scan loading state
  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 800);
    return () => clearTimeout(timer);
  }, [selectedScenario]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedScenario.playwrightCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
            <Button
              onClick={() => router.push('/auth')}
              variant="ghost"
              className="text-zinc-400 hover:text-white text-xs font-semibold px-4 cursor-pointer"
            >
              Dashboard
            </Button>
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
      <section className="relative max-w-7xl mx-auto px-6 pt-16 md:pt-28 pb-20 text-center">
        
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
        <ScrollReveal delay={0.1} y={20}>
          <h1 className="font-display text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.05] text-gradient-white max-w-5xl mx-auto">
            Understand PR Risk <br className="hidden sm:inline" /> Before Merge
          </h1>
        </ScrollReveal>

        {/* Subtitle Description */}
        <ScrollReveal delay={0.2} y={20}>
          <p className="text-zinc-400 font-sans text-base sm:text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed">
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

        {/* Hero Interactive Visualization Console */}
        <ScrollReveal delay={0.4} y={35} className="mt-20">
          <div className="relative rounded-2xl border border-white/[0.06] bg-zinc-950/40 p-2 shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-md max-w-5xl mx-auto overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/[0.03] via-transparent to-purple-500/[0.03] rounded-2xl pointer-events-none" />
            
            {/* Mock Header Controls */}
            <div className="flex items-center justify-between border-b border-white/[0.04] bg-zinc-950/80 px-5 py-3.5 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/40" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/40" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/40" />
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 font-mono ml-3 select-none">kryon-pipeline-visualizer.sh</span>
              </div>
              <div className="text-[10px] sm:text-xs text-cyan-400 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Live Intelligence Engine Scanning</span>
              </div>
            </div>

            {/* Inner Dashboard visual */}
            <div className="p-6 md:p-8 bg-black/60 rounded-b-xl grid md:grid-cols-12 gap-8 text-left items-stretch">
              
              {/* Left Column: Visual Pipeline Steps */}
              <div className="md:col-span-6 space-y-5">
                <div className="text-[11px] text-zinc-500 font-bold font-mono tracking-wider uppercase mb-2">Analysis Processing Queue</div>
                
                <div className="space-y-4">
                  {PIPELINE_PHASES.map((phase, idx) => {
                    const isActive = idx === pipelineStep;
                    return (
                      <div 
                        key={phase.id} 
                        className={`relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-500 ${isActive ? 'bg-zinc-900/50 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.06)] translate-x-2' : 'bg-transparent border-transparent opacity-50'}`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${isActive ? `${phase.bg} ${phase.border} ring-2 ring-cyan-500/20` : 'bg-zinc-900 border-white/[0.04]'}`}>
                          <phase.icon className={`w-5 h-5 ${isActive ? phase.color : 'text-zinc-500'}`} />
                        </div>
                        <div>
                          <div className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-zinc-400'}`}>{phase.label}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {isActive ? 'Synthesizing data delta...' : 'Processed successfully'}
                          </div>
                        </div>
                        
                        {/* Connecting moving node line indicator */}
                        {idx < 4 && (
                          <div className="absolute left-[29px] top-[46px] w-0.5 h-7 bg-zinc-900 pointer-events-none">
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
              <div className="hidden md:block col-span-1 flex justify-center items-center">
                <div className="h-full w-px bg-white/[0.04]" />
              </div>

              {/* Right Column: Live Floating Metrics */}
              <div className="md:col-span-5 flex flex-col justify-between gap-6">
                <div>
                  <div className="text-[11px] text-zinc-500 font-bold font-mono tracking-wider uppercase mb-4">Risk Telemetry Indicators</div>
                  
                  <div className="space-y-4">
                    {/* Security Check Card */}
                    <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:border-cyan-500/20 transition-all duration-300 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                          <Shield className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="text-[11px] text-zinc-500 font-semibold font-mono">SECURITY INTEGRITY</div>
                          <div className="text-sm font-bold text-white mt-0.5">Access Boundary Violation</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">HIGH RISK</span>
                    </div>

                    {/* Architecture Impact Card */}
                    <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:border-cyan-500/20 transition-all duration-300 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                          <Layers className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="text-[11px] text-zinc-500 font-semibold font-mono">ARCHITECTURAL SCHEMAS</div>
                          <div className="text-sm font-bold text-white mt-0.5">gRPC Endpoint Added</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">STABLE</span>
                    </div>

                    {/* Performance Latency Card */}
                    <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:border-cyan-500/20 transition-all duration-300 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <Zap className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="text-[11px] text-zinc-500 font-semibold font-mono">PERFORMANCE DRIFT</div>
                          <div className="text-sm font-bold text-white mt-0.5">Estimated Change</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20 transition-all duration-300 w-[72px] text-center">{liveLatency}ms</span>
                    </div>
                  </div>
                </div>

                {/* Overall Score Banner */}
                <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/15 flex items-center justify-between shadow-[0_0_20px_rgba(34,211,238,0.02)]">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <div>
                      <div className="text-[11px] text-cyan-500 font-bold font-mono tracking-wider">OVERALL BRANCH FAILURE RISK</div>
                      <div className="text-xs text-zinc-400 mt-0.5">Aggregated mutation vulnerability score</div>
                    </div>
                  </div>
                  <span className="text-lg font-mono font-black text-cyan-400 transition-all duration-500">{liveRiskScore}%</span>
                </div>
              </div>

            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Workflow Section Container */}
      <section id="workflow" className="relative border-t border-white/[0.04] bg-[#070707] py-24 scroll-mt-20">
        
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Connect Repository', desc: 'Link your GitHub codebase to Kryon through secure OAuth in three clicks.' },
              { step: '02', title: 'Select Pull Request', desc: 'Select active pull request to scan and process branch differences.' },
              { step: '03', title: 'AI Risk Analysis', desc: 'Analyze structural AST logic changes to flag privilege or logic regressions.' },
              { step: '04', title: 'Coverage Prediction', desc: 'Map changes to predict coverage gaps inside the newly modified paths.' },
              { step: '05', title: 'Test Prioritization', desc: 'Isolate files to prioritize executing test modules only where risk is high.' },
              { step: '06', title: 'Strategic Test Planning', desc: 'Synthesize detailed verification roadmaps targeting code changes.' },
              { step: '07', title: 'Playwright Generation', desc: 'Synthesize runnable, fully parameterized browser spec code blocks.' },
              { step: '08', title: 'Merge Decision Intelligence', desc: 'Equip reviewers with structured risk telemetry indicators before landing.' }
            ].map((node, index) => (
              <ScrollReveal key={node.step} delay={index * 0.08} className="relative group">
                {/* Horizontal connections */}
                {index % 4 !== 3 && (
                  <div className="hidden lg:block absolute top-[52px] left-[90%] w-[25%] h-px bg-gradient-to-r from-cyan-500/25 to-transparent z-0 pointer-events-none group-hover:from-cyan-400 group-hover:to-teal-400 transition-all duration-300" />
                )}
                
                {/* Visual Card */}
                <div className="relative z-10 p-px rounded-xl bg-zinc-800/80 hover:bg-gradient-to-b hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-500 h-full">
                  <div className="bg-[#050505] p-6 rounded-[11px] flex flex-col justify-between h-full space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)] group-hover:shadow-[0_4px_40px_rgba(34,211,238,0.03)] transition-all duration-500 border border-white/[0.01]">
                    
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full border border-white/[0.06] bg-white/[0.02] flex items-center justify-center font-mono text-xs font-bold text-zinc-500 group-hover:text-cyan-400 group-hover:border-cyan-500/20 group-hover:bg-cyan-950/20 transition-all duration-300">
                        {node.step}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-cyan-500 group-hover:shadow-[0_0_8px_#22d3ee] transition-all duration-300" />
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-white text-base tracking-tight group-hover:text-cyan-400 transition-colors duration-300">{node.title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-2">{node.desc}</p>
                    </div>

                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* Features Section Container */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24 scroll-mt-20">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <ScrollReveal>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3.5 py-1.5 rounded-full">Core Capabilities</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
              Built For Engineering Teams
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-zinc-400 mt-3 text-sm sm:text-base leading-relaxed">
              SaaS infrastructure designed to optimize speed, visibility, and codebase reliability.
            </p>
          </ScrollReveal>
        </div>

        {/* Feature Cards Grid (8 items) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Shield,
              title: 'PR Risk Intelligence',
              desc: 'Inspect privilege levels, concurrency leaks, and database mutations in real time on incoming code commits.',
              color: 'group-hover:text-cyan-400'
            },
            {
              icon: Target,
              title: 'Coverage Prediction',
              desc: 'Identify untested execution pathways and branch boundaries in newly modified logic before merging.',
              color: 'group-hover:text-purple-400'
            },
            {
              icon: Beaker,
              title: 'Test Prioritization',
              desc: 'Optimize CI run paths to compile and execute only tests impacted by changes, reducing run costs.',
              color: 'group-hover:text-teal-400'
            },
            {
              icon: Activity,
              title: 'Strategic Testing',
              desc: 'Derive clear assertions blueprints targeting high-risk areas of the code changes, saving writer time.',
              color: 'group-hover:text-cyan-400'
            },
            {
              icon: Terminal,
              title: 'Playwright Generation',
              desc: 'Auto-synthesize end-to-end browser spec scripts to verify routing, redirections, and client-side states.',
              color: 'group-hover:text-purple-400'
            },
            {
              icon: CheckCircle2,
              title: 'Merge Readiness',
              desc: 'Translate architectural threat data into a clean, actionable status indicator check checklist inside reviews.',
              color: 'group-hover:text-teal-400'
            },
            {
              icon: Network,
              title: 'Architecture Impact',
              desc: 'Flag breaking schema changes, gRPC parameter mismatches, and downstream endpoint compatibility failures.',
              color: 'group-hover:text-cyan-400'
            },
            {
              icon: Lock,
              title: 'Security Intelligence',
              desc: 'Detect broken function authentication or access control bypasses within your modified logical methods.',
              color: 'group-hover:text-purple-400'
            }
          ].map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 0.05} className="group">
              {/* Premium Glow Rotating Card */}
              <div className="relative p-px rounded-xl bg-zinc-800/80 hover:bg-gradient-to-tr hover:from-cyan-500 hover:via-teal-500 hover:to-purple-500 transition-all duration-500 h-full">
                <div className="bg-[#050505] p-6 rounded-[11px] h-full flex flex-col justify-between space-y-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] border border-white/[0.01]">
                  <div>
                    {/* Glowing Accent Icon container */}
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-zinc-400 group-hover:text-cyan-400 group-hover:border-cyan-500/20 group-hover:bg-cyan-950/20 transition-all duration-300">
                      <item.icon className="w-5 h-5" />
                    </div>
                    
                    <h3 className="font-display font-bold text-white text-base tracking-tight mt-5 group-hover:text-white transition-colors duration-200">{item.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-2.5">{item.desc}</p>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-cyan-500 font-bold uppercase tracking-wider cursor-pointer group-hover:text-cyan-400 transition-colors duration-200">
                    <span>Explore details</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Product Demo Interactive Section */}
      <section className="relative border-t border-white/[0.04] bg-[#070707] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3.5 py-1.5 rounded-full">Interactive Sandbox</span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
                Experience the Platform
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-zinc-400 mt-3 text-sm sm:text-base leading-relaxed">
                Interact with the mock workspace below to test how Kryon structures pull requests, maps code changes, and writes Playwright spec files.
              </p>
            </ScrollReveal>
          </div>

          {/* Interactive Core Simulator Console */}
          <ScrollReveal delay={0.25} y={35}>
            <div className="grid lg:grid-cols-12 gap-6 items-stretch max-w-6xl mx-auto">
              
              {/* Left Panel - Workspace Browser (SaaS Sidebar) */}
              <div className="lg:col-span-3 rounded-xl border border-white/[0.06] bg-[#050505] p-4 flex flex-col justify-between space-y-6 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
                <div>
                  <div className="text-[10px] text-zinc-500 font-bold font-mono tracking-wider uppercase mb-3">Repositories</div>
                  <div className="space-y-1">
                    {[
                      { id: 'vercel/next.js', active: true },
                      { id: 'facebook/react', active: false },
                      { id: 'trpc/trpc', active: false }
                    ].map((repo) => (
                      <div 
                        key={repo.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono ${repo.active ? 'bg-white/[0.03] text-white border border-white/[0.05]' : 'text-zinc-500 hover:text-zinc-300 transition-colors'}`}
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>{repo.id}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-zinc-500 font-bold font-mono tracking-wider uppercase mt-6 mb-3">Risk Vectors in PR</div>
                  <div className="space-y-1.5">
                    {SCENARIOS.map((scenario) => {
                      const isSel = scenario.id === selectedScenario.id;
                      return (
                        <button
                          key={scenario.id}
                          onClick={() => setSelectedScenario(scenario)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all border ${
                            isSel 
                              ? 'bg-cyan-950/20 text-cyan-400 border-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.05)]' 
                              : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200'
                          }`}
                        >
                          <span className="truncate pr-2">{scenario.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold leading-none ${
                            scenario.aiFindings.riskLevel === 'HIGH' 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : scenario.aiFindings.riskLevel === 'MEDIUM' 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-teal-500/10 text-teal-400'
                          }`}>{scenario.aiFindings.riskLevel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] rounded-lg border border-white/[0.04]">
                  <div className="text-[9px] text-zinc-500 font-semibold font-mono tracking-wider uppercase">Active Scan Engine</div>
                  <div className="text-xs font-bold text-white mt-1">Kryon-v1.1-Local</div>
                  <div className="text-[9px] text-zinc-400 mt-0.5">Ollama Model Failover Active</div>
                </div>
              </div>

              {/* Main Panel Frame (Split between Diff and Outputs) */}
              <div className="lg:col-span-9 flex flex-col rounded-xl border border-white/[0.06] bg-[#0a0a0c] shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden">
                
                {/* Console tabs headers */}
                <div className="flex border-b border-white/[0.06] bg-zinc-950/60 justify-between items-center px-4">
                  <div className="flex">
                    {[
                      { id: 'risk', label: '🔍 AI Findings', icon: Shield },
                      { id: 'strategy', label: '📋 Strategic Tests', icon: Beaker },
                      { id: 'code', label: '💻 Playwright Code', icon: Terminal }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 py-4 px-5 text-xs font-semibold border-b-2 transition-all relative ${
                          activeTab === tab.id
                            ? 'border-cyan-400 text-cyan-400 bg-white/[0.01]'
                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    <GitBranch className="w-3 h-3 text-zinc-600" />
                    <span className="text-zinc-400">{selectedScenario.branch}</span>
                  </div>
                </div>

                {/* Dashboard body grid (Split view Code vs Output) */}
                <div className="grid md:grid-cols-12 items-stretch flex-1 min-h-[460px]">
                  
                  {/* Left Half: Active Code Diff explorer */}
                  <div className="md:col-span-6 border-r border-white/[0.05] flex flex-col justify-between bg-black/40">
                    <div className="p-4 border-b border-white/[0.04] flex items-center justify-between text-xs font-mono text-zinc-500 bg-black/25">
                      <span className="text-zinc-300 font-semibold">{selectedScenario.filename}</span>
                      <span>Target Delta Diff</span>
                    </div>

                    <div className="p-5 font-mono text-[11px] sm:text-xs leading-relaxed flex-1 overflow-x-auto relative min-h-[220px]">
                      {/* Scanning visual sweep */}
                      <AnimatePresence>
                        {isScanning && (
                          <motion.div
                            initial={{ top: '0%' }}
                            animate={{ top: '100%' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] z-10 pointer-events-none"
                          />
                        )}
                      </AnimatePresence>

                      <div className="space-y-1">
                        {selectedScenario.diff.map((line, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start -mx-5 px-5 ${
                              line.type === 'addition'
                                ? 'bg-emerald-950/20 text-emerald-400 border-l-2 border-emerald-500'
                                : line.type === 'deletion'
                                ? 'bg-rose-950/20 text-rose-400 border-l-2 border-rose-500'
                                : 'text-zinc-500'
                            }`}
                          >
                            <span className="w-8 select-none text-zinc-700 text-right pr-3 font-mono">{idx + 1}</span>
                            <span className="font-mono whitespace-pre">{line.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-950/60 border-t border-white/[0.04] text-[11px] text-zinc-500 font-mono">
                      <span className="font-semibold text-zinc-400">AST Target:</span> {selectedScenario.description}
                    </div>
                  </div>

                  {/* Right Half: Output panel content based on activeTab */}
                  <div className="md:col-span-6 p-6 flex flex-col justify-between bg-black/10">
                    <div className="flex-1">
                      
                      {activeTab === 'risk' && (
                        <motion.div
                          key="risk"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-5 text-left"
                        >
                          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                            <div>
                              <span className="text-[10px] text-zinc-500 font-bold font-mono uppercase">Telemetry Output</span>
                              <h4 className="text-white text-base font-bold tracking-tight">Vulnerability Vector Scan</h4>
                            </div>
                            <span className={`text-[10px] font-mono font-bold border px-2 py-0.5 rounded leading-none ${
                              selectedScenario.aiFindings.riskLevel === 'HIGH'
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                : selectedScenario.aiFindings.riskLevel === 'MEDIUM'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                : 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                            }`}>{selectedScenario.aiFindings.riskLevel} RISK</span>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-[11px] text-zinc-400 font-bold block">Executive Summary</span>
                              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{selectedScenario.aiFindings.summary}</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <span className="text-[11px] text-zinc-300 font-bold block mb-1">Muted Risks</span>
                                <ul className="space-y-1">
                                  {selectedScenario.aiFindings.risks.map((risk, idx) => (
                                    <li key={idx} className="text-[11px] text-zinc-400 flex items-start gap-1 leading-normal">
                                      <span className="text-cyan-500">•</span>
                                      <span>{risk}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="text-[11px] text-zinc-300 font-bold block mb-1">Suggested Steps</span>
                                <ul className="space-y-1">
                                  {selectedScenario.aiFindings.recommendations.map((rec, idx) => (
                                    <li key={idx} className="text-[11px] text-zinc-400 flex items-start gap-1 leading-normal">
                                      <span className="text-emerald-500">✓</span>
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'strategy' && (
                        <motion.div
                          key="strategy"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-5 text-left"
                        >
                          <div className="border-b border-white/[0.04] pb-3">
                            <span className="text-[10px] text-zinc-500 font-bold font-mono uppercase">AI Strategy Synthesis</span>
                            <p className="text-zinc-300 text-xs mt-1 leading-relaxed italic">
                              "{selectedScenario.testStrategy.strategy}"
                            </p>
                          </div>

                          <div className="space-y-3">
                            <span className="text-[11px] text-zinc-400 font-bold block">Target Spec Test Cases</span>
                            <div className="space-y-2">
                              {selectedScenario.testStrategy.tests.map((test, idx) => (
                                <div key={idx} className="border border-white/[0.05] bg-white/[0.01] p-3 rounded-lg text-xs space-y-1.5 shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-zinc-200">{test.title}</span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/45 text-cyan-400 border border-cyan-800/20">{test.category}</span>
                                  </div>
                                  <p className="text-zinc-400 text-[11px] leading-relaxed"><span className="text-zinc-500 font-bold">Scenario:</span> {test.scenario}</p>
                                  <p className="text-zinc-400 text-[11px] leading-relaxed"><span className="text-zinc-500 font-bold">Expected:</span> {test.expected}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'code' && (
                        <motion.div
                          key="code"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500 font-mono">playwright.spec.ts</span>
                            <button
                              onClick={handleCopy}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.05] text-zinc-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                            >
                              {copiedCode ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                            </button>
                          </div>

                          <div className="relative rounded-lg bg-black/50 p-4 font-mono text-[11px] sm:text-xs overflow-x-auto text-zinc-300 border border-white/[0.04] leading-relaxed max-h-[300px]">
                            <pre className="font-mono whitespace-pre">{selectedScenario.playwrightCode}</pre>
                          </div>
                        </motion.div>
                      )}

                    </div>

                    {/* Blast Radius Visual Foot */}
                    <div className="mt-6 pt-4 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-[10px] text-zinc-500 font-mono">
                      <span>IMPACT BLAST RADIUS:</span>
                      <div className="flex items-center gap-3">
                        {Object.entries(selectedScenario.aiFindings.blastRadius).map(([key, val]) => (
                          <span
                            key={key}
                            className={`flex items-center gap-1.5 ${val ? 'text-cyan-400 font-bold' : 'text-zinc-700'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${val ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-zinc-800'}`} />
                            <span className="uppercase text-[9px] tracking-wider">{key}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Intelligence Metric Counters Section */}
      <section id="intelligence" className="relative border-t border-white/[0.04] py-24 scroll-mt-20">
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <ScrollReveal>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3.5 py-1.5 rounded-full">Engineering Analytics</span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
                Why Teams Use Kryon
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-zinc-400 mt-3 text-sm sm:text-base leading-relaxed">
                Quantitative infrastructure efficiency parameters verified across modern engineering pipelines.
              </p>
            </ScrollReveal>
          </div>

          {/* Cards metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Faster Review Cycles', value: 73, suffix: '%', desc: 'Average reduction in Pull Request review cycle duration.' },
              { label: 'Earlier Risk Detection', value: 98, suffix: '%', desc: 'Regressions and security violations intercepted before production.' },
              { label: 'Smarter Testing Integration', value: 10, suffix: 'x', desc: 'Compute resources optimization mapping only changed dependencies.' },
              { label: 'Reduced Production Bugs', value: 94, suffix: '%', desc: 'Decrease in logic escape bugs hitting public systems.' }
            ].map((stat, idx) => (
              <ScrollReveal key={stat.label} delay={idx * 0.08} className="text-center">
                <div className="p-px rounded-xl bg-zinc-800/80 hover:bg-gradient-to-tr hover:from-cyan-500 hover:to-purple-500 transition-all duration-300 h-full">
                  <div className="bg-[#050505] p-8 rounded-[11px] h-full flex flex-col justify-between space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)] border border-white/[0.01]">
                    
                    <div className="text-4xl md:text-6xl font-display font-black text-cyan-400 tracking-tight">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>

                    <div>
                      <h3 className="font-display font-semibold text-white text-base tracking-tight">{stat.label}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-2">{stat.desc}</p>
                    </div>

                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* Large Get Started Call-To-Action Section */}
      <section className="relative border-t border-white/[0.04] py-24">
        
        {/* Neon glowing center decoration */}
        <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[380px] h-[380px] bg-cyan-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <ScrollReveal>
            <div className="relative rounded-2xl border border-white/[0.05] bg-gradient-to-b from-[#0a0a0c] to-black p-8 sm:p-14 md:p-20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-w-5xl mx-auto">
              
              {/* Internal absolute drifting grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#16161c_1px,transparent_1px),linear-gradient(to_bottom,#16161c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none animate-grid-drift opacity-60" />

              <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">Continuous Risk Control</span>
                <h2 className="font-display text-3xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                  Ship Safer Code With <br /> AI Risk Intelligence
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                  Integrate Kryon into your GitHub pipeline in under 3 minutes. Stop regressions, secure credentials, and auto-synthesize test specs before landing in production.
                </p>

                {/* Counter Stats checks */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-4 text-xs font-mono text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Free Open-Source Tier</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Self-Hosted Local Engine Options</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>SOC-2 Type II Compliant Architectures</span>
                  </span>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 max-w-sm mx-auto sm:max-w-none">
                  <MagneticButton
                    onClick={() => router.push('/auth')}
                    className="w-full sm:w-auto px-8 h-12.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_35px_rgba(34,211,238,0.4)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>Connect GitHub Repository</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </MagneticButton>

                  <Button
                    onClick={() => router.push('/auth')}
                    variant="outline"
                    className="w-full sm:w-auto border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 h-12.5 px-8 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer"
                  >
                    Start Free Analysis
                  </Button>
                </div>

              </div>

            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Animated Accordion FAQ Section Container */}
      <section id="faq" className="relative border-t border-white/[0.04] py-24 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <ScrollReveal>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3.5 py-1.5 rounded-full">Knowledge Base</span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
                Frequently Asked Questions
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="text-zinc-400 mt-2 text-sm sm:text-base leading-relaxed">
                Everything you need to know about the AI risk prediction and testing pipeline.
              </p>
            </ScrollReveal>
          </div>

          {/* Accordion Questions container */}
          <ScrollReveal delay={0.2}>
            <div className="border-t border-white/[0.04]">
              {[
                {
                  question: 'What does Kryon analyze?',
                  answer: 'Kryon analyzes pull requests across three distinct vectors: security privileges (access control and privilege escalations), architectural impact (breaking changes in API gateways, database schemas, or RPC contracts), and performance characteristics. By parsing your AST and running diff analysis, Kryon models code risk before tests even run.'
                },
                {
                  question: 'How is this different from code review tools?',
                  answer: 'Standard code review tools check style guidelines and lint rules. Kryon is a deep-risk intelligence engine. It understands code semantics, predicts failure paths, and synthesizes target verification test specifications specifically to cover changes in the PR, functioning like an automated staff engineer on your team.'
                },
                {
                  question: 'Does Kryon generate tests?',
                  answer: 'Yes. Kryon maps the exact delta of your code changes, detects coverage gaps in the modified logical paths, and generates precise Jest unit and integration tests. This allows developers to immediately write assertions targeting the code they just wrote, without writing boilerplate.'
                },
                {
                  question: 'Can Kryon generate Playwright specs?',
                  answer: 'Absolutely. For changes affecting key business flows, API gateways, or UI endpoints, Kryon synthesizes ready-to-run Playwright end-to-end specifications. It mocks user states, configures routing boundary conditions, and generates complete test files that you can directly copy into your test suites.'
                },
                {
                  question: 'How does risk prediction work?',
                  answer: 'Kryon runs your code changes through a multi-tiered pipeline: first, a static AST parser maps structural modifications; second, a local rule engine flags known code anti-patterns; third, an AI orchestration layer maps these changes against runtime dependencies, estimating blast radius and assigning a risk score from 0 to 100.'
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

      {/* Professional Multi-Column Footer Container */}
      <footer className="border-t border-white/[0.04] bg-[#050505] py-20 text-xs text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand Col column */}
          <div className="col-span-2 space-y-6">
            <KryonLogo size="md" />
            <p className="max-w-sm leading-relaxed text-zinc-400">
              Kryon is the risk intelligence platform for modern engineering teams. Understand risk, predict coverage gaps, and write Playwright specs before merging.
            </p>
            <div className="text-[10px] text-zinc-600 font-mono">
              © {new Date().getFullYear()} Kryon Systems, Inc. All rights reserved.
            </div>
          </div>

          {/* Product Section columns */}
          <div className="space-y-4 text-left">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase font-display">Product</h4>
            <ul className="space-y-2.5">
              <li><button onClick={() => smoothScrollTo('features')} className="hover:text-zinc-300 transition-colors text-left cursor-pointer">Features</button></li>
              <li><button onClick={() => smoothScrollTo('workflow')} className="hover:text-zinc-300 transition-colors text-left cursor-pointer">Pipeline Workflow</button></li>
              <li><button onClick={() => smoothScrollTo('intelligence')} className="hover:text-zinc-300 transition-colors text-left cursor-pointer">Intelligence Analytics</button></li>
              <li><a href="/auth" className="hover:text-zinc-300 transition-colors">Start Analysis</a></li>
            </ul>
          </div>

          {/* Company Section columns */}
          <div className="space-y-4 text-left">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase font-display">Company</h4>
            <ul className="space-y-2.5">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">About Us</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">Security Index</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">Careers</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Resources & Compliance columns */}
          <div className="space-y-4 text-left">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase font-display">Resources</h4>
            <ul className="space-y-2.5">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">GitHub Repository</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">API Documents</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">Privacy Policy</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>
      </footer>

    </div>
  );
}
