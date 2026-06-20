'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { KryonLogo } from '@/components/layout/kryon-logo';
import { Github, Shield, Sparkles, LineChart, FileCode, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

function ConnectGithubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status } = useAuth();
  const error = searchParams.get('error');

  // Redirect if they shouldn't be here
  useEffect(() => {
    if (status === 'authenticated' && user) {
      if (user.githubConnected) {
        router.push('/dashboard');
      }
    }
  }, [status, user, router]);

  const handleConnect = () => {
    // Triggers /api/github/connect which redirects to GitHub authorize URL
    window.location.href = '/api/github/connect';
  };

  const benefits = [
    {
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      title: 'PR Intelligence',
      description: 'Receive automated risk scoring and architectural analysis.',
    },
    {
      icon: <LineChart className="w-4 h-4 text-cyan-400" />,
      title: 'Coverage Prediction',
      description: 'Estimate code test coverage gaps before merging changes.',
    },
    {
      icon: <FileCode className="w-4 h-4 text-cyan-400" />,
      title: 'Test Generation',
      description: 'Automatically generate high-quality Jest & Playwright test cases.',
    },
    {
      icon: <Shield className="w-4 h-4 text-cyan-400" />,
      title: 'Risk Analysis',
      description: 'Find regressions and edge cases across code boundaries.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <KryonLogo size="md" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-semibold tracking-wide uppercase">
            Step 2 of 2: Onboarding
          </div>
        </div>

        <div className="kryon-card rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-8 space-y-8 relative overflow-hidden">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold text-white tracking-tight">Connect your GitHub Account</h1>
            <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
              Kryon requires GitHub access to retrieve repositories and analyze pull requests on your behalf.
            </p>
          </div>

          {error === 'already_connected' && (
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/15 flex items-start gap-2.5 text-xs text-red-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 animate-pulse" />
              <span className="leading-normal">This GitHub account is already connected to another Kryon account.</span>
            </div>
          )}

          {/* Connect Button */}
          <div className="space-y-3">
            <Button
              onClick={handleConnect}
              className="w-full h-12 bg-white text-black hover:bg-white/90 font-semibold rounded-lg flex items-center justify-center gap-3 transition-all duration-200"
            >
              <Github className="w-5 h-5 text-black" />
              Connect GitHub Account
            </Button>
            
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/30">
              <CheckCircle className="w-3.5 h-3.5 text-green-400/70" />
              <span>Read-only repository and user scope</span>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-6 space-y-4">
            <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              What you get with Kryon
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, i) => (
                <div 
                  key={i} 
                  className="p-3.5 rounded-lg bg-white/[0.01] border border-white/[0.04] space-y-1.5 hover:border-white/[0.08] hover:bg-white/[0.02] transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    {benefit.icon}
                    <h3 className="text-xs font-semibold text-white/80">{benefit.title}</h3>
                  </div>
                  <p className="text-[10px] text-white/30 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ConnectGithubPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <ConnectGithubContent />
    </Suspense>
  );
}
