'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { KryonLogo } from '@/components/layout/kryon-logo';
import { Mail, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshSession, status } = useAuth();
  
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [devVerificationLink, setDevVerificationLink] = useState<string | null>(null);

  const token = searchParams.get('token');

  // If already verified, redirect to dashboard or connect github
  useEffect(() => {
    if (status === 'authenticated' && user?.emailVerified) {
      if (!user.githubConnected) {
        router.push('/connect-github');
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, user, router]);

  // Handle automatic verification if token is present
  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        setVerifying(true);
        setError(null);
        try {
          const res = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Verification failed');
          }
          setSuccess(true);
          toast.success('Email verified successfully!');
          await refreshSession();
        } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setVerifying(false);
        }
      };

      verifyToken();
    }
  }, [token, refreshSession]);

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend link');
      }
      toast.success('Verification link resent!');
      if (data.verificationLink) {
        setDevVerificationLink(data.verificationLink);
        console.log('[DEV MODE] Resent Verification Link:', data.verificationLink);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleProceed = () => {
    if (user && !user.githubConnected) {
      router.push('/connect-github');
    } else {
      router.push('/dashboard');
    }
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
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-semibold tracking-wide uppercase">
            Step 1 of 2: Email Verification
          </div>
        </div>

        <div className="kryon-card rounded-xl p-8 border border-white/[0.06] bg-[#0c0c0c] relative overflow-hidden space-y-6">
          {/* Automatic Verification State */}
          {token ? (
            <div className="text-center py-4 space-y-5">
              {verifying ? (
                <>
                  <div className="flex justify-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-medium text-white">Verifying your email</h2>
                    <p className="text-xs text-white/40">Please wait while we validate your token...</p>
                  </div>
                </>
              ) : success ? (
                <>
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-medium text-white">Verification complete</h2>
                    <p className="text-xs text-white/40">Your email has been verified. You can now proceed to the next step.</p>
                  </div>
                  <Button
                    onClick={handleProceed}
                    className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg flex items-center justify-center gap-1.5 mt-2"
                  >
                    Proceed to Connect GitHub
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <AlertTriangle className="w-12 h-12 text-red-400" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-medium text-white">Verification failed</h2>
                    <p className="text-xs text-red-400/80">{error || 'The verification link is invalid or has expired.'}</p>
                  </div>
                  <Button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full h-11 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white font-medium rounded-lg text-sm transition-all"
                  >
                    {resending ? 'Resending Link...' : 'Request a New Link'}
                  </Button>
                </>
              )}
            </div>
          ) : (
            /* Awaiting Verification State */
            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-cyan-400" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-lg font-medium text-white">Check your email</h2>
                <p className="text-xs text-white/40 leading-relaxed px-2">
                  We have simulated sending a verification email to your registered email address. Click the link inside to verify.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <Button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all"
                >
                  {resending ? 'Resending Link...' : 'Resend Verification Email'}
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-xs text-white/30 hover:text-white transition-all underline">
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Dev Helper Container (so user can verify easily without looking at stdout) */}
          {devVerificationLink && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/15 text-left text-xs space-y-2"
            >
              <p className="font-semibold text-yellow-400">Development Email Simulation Helper:</p>
              <p className="text-white/60 text-[10px] break-all leading-normal">
                Click this link to simulate clicking the email verification:
              </p>
              <a 
                href={devVerificationLink} 
                className="block text-cyan-400 hover:underline hover:text-cyan-300 font-medium break-all border-t border-white/[0.04] pt-2"
              >
                {devVerificationLink}
              </a>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
