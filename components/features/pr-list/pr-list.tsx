'use client';

import { type GitHubPR } from '@/types/github';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PRListProps {
  prs: GitHubPR[];
  selectedPR: GitHubPR | null;
  onSelectPR: (pr: GitHubPR) => void;
  isLoading?: boolean;
}

export function PRList({ prs, selectedPR, onSelectPR, isLoading }: PRListProps) {
  if (isLoading) {
    return (
      <div className="w-[280px] flex-shrink-0 border-r border-white/[0.06] flex flex-col min-h-0 bg-[#050505]">
        <div className="px-4 py-3.5 border-b border-white/[0.06]">
          <Skeleton className="h-4 w-32 bg-white/[0.06]" />
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-md bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  const pullRequests = prs || [];

  return (
    <div className="w-[280px] flex-shrink-0 border-r border-white/[0.06] flex flex-col min-h-0 bg-[#050505]">
      <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Pull Requests</h2>
        <Badge variant="outline" className="text-[10px] border-white/[0.08] text-white/40 bg-transparent">
          {pullRequests.length}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {pullRequests.length === 0 && (
          <div className="text-center py-16 px-4">
            <GitBranch className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-xs text-white/35">No open pull requests</p>
          </div>
        )}
        {pullRequests.map((pr, idx) => {
          const selected = selectedPR?.id === pr.id;
          return (
            <motion.button
              key={pr.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
              onClick={() => onSelectPR(pr)}
              className={cn(
                'w-full text-left p-3 rounded-md transition-all border',
                selected
                  ? 'bg-cyan-500/5 border-cyan-500/20 kryon-glow-sm'
                  : 'border-transparent hover:bg-white/[0.03] hover:border-white/[0.06] kryon-card-hover'
              )}
            >
              <p className={cn('text-sm font-medium leading-snug', selected ? 'text-white' : 'text-white/70')}>
                <span className="text-white/35">#{pr.number}</span> {pr.title}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                <span className="text-[10px] text-white/30">{pr.user.login}</span>
                <span className="text-[10px] text-white/25">{new Date(pr.created_at).toLocaleDateString()}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
