'use client';

import { GitHubRepo } from '@/types/github';
import { Badge } from '@/components/ui/badge';
import { Star, Globe, Lock, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RepositoryCardProps {
  repository: GitHubRepo;
  onSelect: (repo: GitHubRepo) => void;
  isSelected?: boolean;
}

export function RepositoryCard({ repository, onSelect, isSelected }: RepositoryCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(repository)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'w-full text-left kryon-card kryon-card-hover rounded-lg p-5 transition-colors',
        isSelected && 'border-cyan-500/25 bg-cyan-500/5 kryon-glow-sm'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Code2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{repository.name}</h3>
            <p className="text-xs text-white/35">{repository.owner.login}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] border-white/[0.08] text-white/35 bg-transparent">
          {repository.private ? (
            <><Lock className="w-3 h-3 mr-1" />Private</>
          ) : (
            <><Globe className="w-3 h-3 mr-1" />Public</>
          )}
        </Badge>
      </div>

      <p className="text-xs text-white/40 line-clamp-2 h-8 mb-3">
        {repository.description || 'No description provided.'}
      </p>

      <div className="flex items-center gap-4 text-[11px] text-white/30">
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          {repository.stargazers_count}
        </span>
        {repository.language && (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            {repository.language}
          </span>
        )}
      </div>
    </motion.button>
  );
}
