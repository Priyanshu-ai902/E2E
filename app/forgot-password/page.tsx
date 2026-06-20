'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KryonLogo } from '@/components/layout/kryon-logo';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      console.log(`[PASSWORD RESET SIMULATION] Password reset request for ${email}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <KryonLogo size="md" />
          </div>
        </div>

        <div className="kryon-card rounded-xl p-8 border border-white/[0.06] bg-[#0c0c0c] relative overflow-hidden space-y-6">
          {!sent ? (
            <div className="space-y-4">
              <div className="space-y-1.5 text-center">
                <h1 className="text-xl font-semibold text-white tracking-tight">Reset password</h1>
                <p className="text-xs text-white/40 max-w-xs mx-auto">
                  Enter your email address and we'll simulate sending you a password reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="pl-10 h-11 bg-white/[0.02] border-white/[0.08] focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-lg text-sm text-white placeholder-white/20 transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center py-4 space-y-5">
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-medium text-white">Reset Link Sent</h2>
                <p className="text-xs text-white/40 leading-relaxed max-w-xs mx-auto">
                  If an account exists for <span className="text-white font-medium">{email}</span>, a simulated password reset link has been printed to the server logs.
                </p>
              </div>
            </div>
          )}

          <div className="text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-all underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
