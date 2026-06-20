'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KryonLogo } from '@/components/layout/kryon-logo';
import { Mail, Lock, User, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const { user, refreshSession, status } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  // Live password validation
  const isPasswordValid = password.length >= 5;
  const isMatch = password === confirmPassword && password.length > 0;
  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && isPasswordValid && isMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Get CSRF token
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = csrfRes.ok ? await csrfRes.json() : { csrfToken: '' };

      // 2. Perform Register POST
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      toast.success('Registration successful!');
      if (data.verificationLink) {
        console.log('[DEV MODE] Verification Link:', data.verificationLink);
      }
      await refreshSession();
      // Redirection is handled by the useEffect above
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
      {/* Left side: Branding */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 relative overflow-hidden border-r border-white/[0.04] bg-[#020202]">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="z-10">
          <KryonLogo size="lg" />
        </div>

        <div className="z-10 space-y-6 max-w-md">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Step 1 of 2
          </span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-semibold tracking-tight leading-tight text-white mt-4"
          >
            Create Your Account
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-white/40 text-sm leading-relaxed"
          >
            Get started in seconds. Secure your account, verify your email, and connect your repositories to gain instant PR intelligence.
          </motion.p>
        </div>

        <div className="z-10 text-xs text-white/20">
          &copy; {new Date().getFullYear()} Kryon Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: Register form */}
      <div className="flex-1 lg:col-span-7 flex flex-col items-center justify-center p-6 py-12 relative">
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none lg:hidden" />
        
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
            <h1 className="text-2xl font-semibold text-white tracking-tight">Create your Kryon Account</h1>
            <p className="text-sm text-white/40">
              Sign up below to start analyzing pull request risk.
            </p>
          </div>

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
              <Label htmlFor="name" className="text-white/60 text-xs">Full name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-11 bg-white/[0.02] border-white/[0.08] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-lg text-sm text-white placeholder-white/20 transition-all"
                />
              </div>
            </div>

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
              <Label htmlFor="password" className="text-white/60 text-xs">Password</Label>
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
              
              {/* Password requirement check */}
              {password.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                  {isPasswordValid ? (
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className={isPasswordValid ? 'text-green-400/95 font-medium' : 'text-white/40'}>
                    Password must be at least 5 characters
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/60 text-xs">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-11 bg-white/[0.02] border-white/[0.08] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-lg text-sm text-white placeholder-white/20 transition-all"
                />
              </div>
              {confirmPassword.length > 0 && (
                <div className="text-[10px] text-right">
                  {isMatch ? (
                    <span className="text-green-400 font-medium">Passwords match</span>
                  ) : (
                    <span className="text-red-400 font-medium">Passwords do not match</span>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!canSubmit}
              className={`w-full h-11 font-semibold tracking-wide transition-all duration-200 rounded-lg flex items-center justify-center gap-1.5 ${
                canSubmit 
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/[0.04]'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-white/40">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-all">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
