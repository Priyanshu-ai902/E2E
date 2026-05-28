'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BarChart3, Settings, LogOut, Github, History } from 'lucide-react';
import { AIActivityTimeline } from '../pr-analysis/ai-activity-timeline';
import { AIProcessingStep } from '@/types/pr';

interface SidebarProps {
  aiSteps?: AIProcessingStep[];
}

export function Sidebar({ aiSteps = [] }: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <div className="w-72 bg-slate-900/50 border-r border-slate-700/50 flex flex-col backdrop-blur-xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          CodeReview AI
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
              Main Menu
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 active:scale-95 transition-all"
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-slate-400 hover:bg-slate-800/50"
            >
              <Github className="w-4 h-4 mr-3" />
              Repositories
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-slate-400 hover:bg-slate-800/50"
            >
              <History className="w-4 h-4 mr-3" />
              Analysis History
            </Button>
          </div>

          {/* AI Activity Section */}
          <div className="pt-6 border-t border-slate-700/30">
            <AIActivityTimeline steps={aiSteps} />
          </div>
        </nav>
      </div>

      {/* User Section */}
      <div className="border-t border-slate-700/50 p-6 bg-slate-900/40">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-slate-800/30 border border-white/5">
          {user.image ? (
            <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full border border-white/10" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-200 truncate">{user.name}</div>
            <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="flex-1 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="flex-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
