'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Github, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const { login, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (err) {
      toast.error('GitHub connection failed');
      setIsLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-xl">
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Secure Agent Access
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight">
            CodeReview <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI Agent</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Authorize our AI agent to access your GitHub repositories and begin automated PR reviews.
          </p>
        </div>

        {/* Action Card */}
        <div className="glass-morphism rounded-3xl p-10 border border-white/5 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          <div className="space-y-4">
            <Button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full h-16 bg-white text-black hover:bg-slate-200 transition-all text-lg font-bold rounded-2xl flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Github className="w-6 h-6" />
                  Continue with GitHub
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
            
            <p className="text-[10px] text-center text-slate-500 font-medium uppercase tracking-widest">
              By connecting, you agree to our terms and privacy policy
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200">Secure OAuth</h3>
              <p className="text-[10px] text-slate-500">Industry standard secure authentication via GitHub.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-bold text-slate-200">Read-Only</h3>
              <p className="text-[10px] text-slate-500">We only request read access to your repositories.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
