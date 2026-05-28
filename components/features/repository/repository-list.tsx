'use client';

import { useState } from 'react';
import { GitHubRepo } from '@/types/github';
import { RepositoryCard } from './repository-card';
import { Input } from '@/components/ui/input';
import { Search, Rocket } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RepositoryListProps {
  repositories: GitHubRepo[];
  onSelect: (repo: GitHubRepo) => void;
  isLoading?: boolean;
}

export function RepositoryList({ repositories, onSelect, isLoading }: RepositoryListProps) {
  const [search, setSearch] = useState('');

  const filteredRepos = (repositories || []).filter(repo => 
    repo.name.toLowerCase().includes(search.toLowerCase()) ||
    repo.owner.login.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 rounded-xl glass border border-white/5 p-6 space-y-4">
            <div className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-lg bg-slate-800" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
                <Skeleton className="h-3 w-1/4 bg-slate-800" />
              </div>
            </div>
            <Skeleton className="h-10 w-full bg-slate-800" />
            <Skeleton className="h-4 w-1/2 bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search repositories..."
          className="pl-10 h-12 bg-slate-900/50 border-white/5 rounded-xl focus:ring-cyan-500/50 focus:border-cyan-500/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredRepos.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-white/5">
          <Rocket className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold text-slate-400">No repositories found</h3>
          <p className="text-slate-500">Try searching for a different name or owner.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredRepos.map((repo) => (
            <RepositoryCard
              key={repo.id}
              repository={repo}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
