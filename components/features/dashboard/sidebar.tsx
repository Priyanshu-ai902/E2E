'use client';

import { useAuth } from '@/hooks/useAuth';
import { KryonLogo } from '@/components/layout/kryon-logo';
import { useDashboard, type DashboardView } from './dashboard-context';
import { useAI } from '@/app/dashboard/layout';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Github,
  History,
  Settings,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

const navItems: { id: DashboardView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'repositories', label: 'Repositories', icon: Github },
  { id: 'history', label: 'Analysis History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { user } = useAuth();
  const { view, setView, setSelectedRepo, setSelectedPR } = useDashboard();
  const { state } = useAI();

  if (!user) return null;

  const agentStatus =
    state === 'analyzing' || state === 'fetching'
      ? { label: 'Processing', active: true }
      : state === 'completed'
        ? { label: 'Ready', active: false }
        : state === 'failed'
          ? { label: 'Error', active: false }
          : { label: 'Idle', active: false };

  return (
    <aside className="w-[260px] flex-shrink-0 border-r border-white/[0.06] bg-[#050505] flex flex-col">
      <div className="h-[72px] px-6 border-b border-white/[0.06] flex items-center">
        <KryonLogo size="md" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'repositories') {
                  setSelectedRepo(null);
                  setSelectedPR(null);
                }
                setView(item.id);
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-white/[0.06] text-white'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/[0.03]'
              )}
            >
              <Icon className={cn('w-4 h-4', active ? 'text-cyan-400' : 'text-white/35')} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-4 space-y-3">
        <div className="px-2">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-2">Workspace</p>
        </div>

        <div className="kryon-card rounded-md px-3 py-2.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-white/70 truncate">{user.name}</p>
              <p className="text-[10px] text-white/30 truncate">GitHub connected</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="flex items-center gap-1.5">
              {agentStatus.active && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
              <p className="text-[10px] text-white/40">
                Agent <span className="text-white/60">{agentStatus.label}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
