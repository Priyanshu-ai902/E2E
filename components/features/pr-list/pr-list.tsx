'use client';

import { type GitHubPR } from '@/types/github';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

interface PRListProps {
  prs: GitHubPR[];
  selectedPR: GitHubPR | null;
  onSelectPR: (pr: GitHubPR) => void;
  isLoading?: boolean;
}

export function PRList({ prs, selectedPR, onSelectPR, isLoading }: PRListProps) {
  if (isLoading) {
    return (
      <div className="w-96 flex-shrink-0 border-r border-white/5 flex flex-col min-h-0 bg-slate-900/20">
        <div className="p-6 border-b border-white/5 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
             Pull Requests
             <Badge variant="outline" className="text-[10px] uppercase tracking-tighter bg-slate-800/50">Loading</Badge>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 rounded-xl glass border border-white/5 space-y-3">
              <Skeleton className="h-5 w-3/4 bg-slate-800" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-12 bg-slate-800" />
                <Skeleton className="h-4 w-12 bg-slate-800" />
              </div>
              <Skeleton className="h-3 w-1/2 bg-slate-800/50" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pullRequests = prs || [];

  return (
    <div className="w-96 flex-shrink-0 border-r border-white/5 flex flex-col min-h-0 bg-slate-900/20">
      <div className="p-6 border-b border-white/5 flex-shrink-0 bg-slate-900/40">
        <h2 className="text-lg font-bold text-slate-100 flex items-center justify-between">
          Pull Requests
          <Badge variant="outline" className="text-[10px] uppercase tracking-tighter bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            {pullRequests.length} Open
          </Badge>
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        {pullRequests.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-white/5">
               <Info className="w-6 h-6 text-slate-600" />
            </div>
            <div className="text-slate-500 text-sm font-medium">No active pull requests</div>
            <div className="text-slate-600 text-[10px] uppercase tracking-widest mt-1">Check another repo</div>
          </div>
        )}
        {pullRequests.map((pr) => (
          <button
            key={pr.id}
            onClick={() => onSelectPR(pr)}
            className={`w-full text-left p-4 rounded-xl transition-all relative overflow-hidden group border ${
              selectedPR?.id === pr.id
                ? 'glass glow-neon-blue border-cyan-500/50 bg-cyan-500/10'
                : 'glass-hover hover:bg-slate-800/50 border-white/5'
            }`}
          >
            {selectedPR?.id === pr.id && (
              <div className="absolute top-0 right-0 p-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
            )}
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-semibold text-sm transition-colors ${
                selectedPR?.id === pr.id ? 'text-white' : 'text-slate-300 group-hover:text-slate-100'
              }`}>
                #{pr.number} {pr.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]" variant="outline">
                {pr.state}
              </Badge>
              <div className="h-1 w-1 rounded-full bg-slate-700" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">PR Branch</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-3">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-white/10" />
                {pr.user.login}
              </div>
              <div>{new Date(pr.created_at).toLocaleDateString()}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
