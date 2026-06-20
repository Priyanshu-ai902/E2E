'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KryonLogo } from '@/components/layout/kryon-logo';
import { Github, Mail, Lock, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshSession, status } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already authenticated, redirect them to dashboard
  useEffect(() => {
    if (status === 'authenticated' && user) {
      if (!user.githubConnected) {
        router.push('/connect-github');
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, user, router]);

  // Show error messages from OAuth callback if present
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'oauth_error') {
        toast.error('GitHub authentication failed.');
      } else if (errorParam === 'unauthorized_connection') {
        toast.error('GitHub connection was unauthorized.');
      } else {
        toast.error('An error occurred during authentication.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get CSRF token
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = csrfRes.ok ? await csrfRes.json() : { csrfToken: '' };

      // 2. Perform Login POST
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      toast.success('Signed in successfully');
      await refreshSession();
      // Router redirection is handled by useEffect above
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
      {/* Left side: Branding (Linear style) */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 relative overflow-hidden border-r border-white/[0.04] bg-[#020202]">
        {/* Glow elements */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="z-10">
          <KryonLogo size="lg" />
        </div>

        <div className="z-10 space-y-6 max-w-md">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-semibold tracking-tight leading-tight text-white"
          >
            Understand PR Risk Before Merge
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-white/40 text-sm leading-relaxed"
          >
            Mission control for pull request risk. Kryon provides real-time automated risk intelligence, Jest/Playwright test planning, and static safety checks before you hit merge.
          </motion.p>
        </div>

        <div className="z-10 text-xs text-white/20">
          &copy; {new Date().getFullYear()} Kryon Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 lg:col-span-7 flex flex-col items-center justify-center p-6 relative">
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-all bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] px-3 py-1.5 rounded-lg z-20"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none lg:hidden" />
        
        {/* Small branding header for mobile */}
        <div className="lg:hidden mb-8">
          <KryonLogo size="md" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.35 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-semibold text-white tracking-tight">Sign in to Kryon</h1>
            <p className="text-sm text-white/40">
              Enter your credentials to continue.
            </p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 flex items-start gap-2.5 text-xs text-red-400"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/60 text-xs">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 bg-white/[0.02] border-white/[0.08] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-lg text-sm text-white placeholder-white/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/60 text-xs">Password</Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Password reset is simulated. Check terminal logs if requested.');
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11 bg-white/[0.02] border-white/[0.08] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-lg text-sm text-white placeholder-white/20 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold tracking-wide transition-all duration-200 rounded-lg flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-white/40 pt-2">
              Don't have an account?{' '}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-all">
                Create Account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
