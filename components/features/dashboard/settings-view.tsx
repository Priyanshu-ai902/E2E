'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAI } from '@/app/dashboard/layout';
import { Github, Cpu, CheckCircle2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SettingsView() {
  const { user, logout } = useAuth();
  const { state } = useAI();

  const agentStatus =
    state === 'analyzing' || state === 'fetching'
      ? { label: 'Processing', color: 'text-cyan-400', dot: 'bg-cyan-400 animate-pulse' }
      : state === 'completed'
        ? { label: 'Ready', color: 'text-emerald-400', dot: 'bg-emerald-400' }
        : state === 'failed'
          ? { label: 'Error', color: 'text-red-400', dot: 'bg-red-400' }
          : { label: 'Idle', color: 'text-white/40', dot: 'bg-white/30' };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto px-8 py-10 space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-white/40 mt-1">Workspace and integration status</p>
        </div>

        <section className="kryon-card rounded-lg p-5 space-y-4">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Connected GitHub Account</h2>
          {user && (
            <div className="flex items-center gap-3">
              {user.image ? (
                <img src={user.image} alt="" className="w-10 h-10 rounded-full border border-white/[0.08]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                  <Github className="w-5 h-5 text-white/40" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-white/40">{user.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Connected</span>
              </div>
            </div>
          )}
        </section>

        <section className="kryon-card rounded-lg p-5 space-y-4">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Agent Status</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Kryon Risk Agent</p>
              <p className={cn('text-xs font-medium', agentStatus.color)}>
                <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5', agentStatus.dot)} />
                {agentStatus.label}
              </p>
            </div>
          </div>
        </section>

        <section className="kryon-card rounded-lg p-5">
          <Button
            variant="outline"
            onClick={() => logout()}
            className="border-white/[0.08] text-white/60 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out of GitHub
          </Button>
        </section>
      </div>
    </div>
  );
}
