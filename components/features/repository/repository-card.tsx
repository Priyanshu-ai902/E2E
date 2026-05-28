'use client';

import { GitHubRepo } from '@/types/github';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Star, GitPullRequest, Globe, Lock, Code2 } from 'lucide-react';

interface RepositoryCardProps {
  repository: GitHubRepo;
  onSelect: (repo: GitHubRepo) => void;
  isSelected?: boolean;
}

export function RepositoryCard({ repository, onSelect, isSelected }: RepositoryCardProps) {
  return (
    <Card 
      onClick={() => onSelect(repository)}
      className={`relative group cursor-pointer transition-all duration-300 overflow-hidden ${
        isSelected 
          ? 'glass glow-neon-blue border-cyan-500/50 bg-cyan-500/10' 
          : 'glass-hover hover:bg-white/5 border-white/5'
      }`}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
              <Code2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                {repository.name}
              </h3>
              <p className="text-xs text-slate-500">{repository.owner.login}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-tighter bg-slate-800/50">
            {!repository.private ? (
              <Globe className="w-3 h-3 mr-1" />
            ) : (
              <Lock className="w-3 h-3 mr-1" />
            )}
            {repository.private ? 'Private' : 'Public'}
          </Badge>
        </div>

        <p className="text-sm text-slate-400 line-clamp-2 h-10">
          {repository.description || 'No description provided.'}
        </p>

        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Star className="w-3.5 h-3.5" />
            {repository.stargazers_count}
          </div>
          {repository.language && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              {repository.language}
            </div>
          )}
        </div>
      </div>
      
      {isSelected && (
        <div className="absolute top-0 right-0 p-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>
      )}
    </Card>
  );
}
