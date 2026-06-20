'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { KryonLogo } from '@/components/layout/kryon-logo';
import { Github, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Auth() {
  const { login, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch {
      toast.error('GitHub connection failed');
      setIsLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <KryonLogo size="lg" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Sign in to Kryon</h1>
          <p className="text-sm text-white/40 mt-2">
            Connect your GitHub account to begin PR risk analysis.
          </p>
        </div>

        <div className="kryon-card rounded-lg p-6 space-y-6">
          <Button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full h-11 bg-white text-[#050505] hover:bg-white/90 font-semibold"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Github className="w-5 h-5 mr-2" />
                Continue with GitHub
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
              <ShieldCheck className="w-4 h-4 text-cyan-400 mb-2" />
              <p className="text-[11px] font-medium text-white/70">Secure OAuth</p>
              <p className="text-[10px] text-white/30 mt-0.5">GitHub authentication</p>
            </div>
            <div className="p-3 rounded-md bg-white/[0.02] border border-white/[0.06]">
              <Zap className="w-4 h-4 text-cyan-400 mb-2" />
              <p className="text-[11px] font-medium text-white/70">Read-only</p>
              <p className="text-[10px] text-white/30 mt-0.5">Repository access only</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
