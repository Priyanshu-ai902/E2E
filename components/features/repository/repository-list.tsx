'use client';

import { useState, useEffect, useMemo } from 'react';
import { GitHubRepo } from '@/types/github';
import { RepositoryCard } from './repository-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 6;

interface RepositoryListProps {
  repositories: GitHubRepo[];
  onSelect: (repo: GitHubRepo) => void;
  isLoading?: boolean;
}

export function RepositoryList({ repositories, onSelect, isLoading }: RepositoryListProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filteredRepos = useMemo(
    () =>
      (repositories || []).filter(
        (repo) =>
          repo.name.toLowerCase().includes(search.toLowerCase()) ||
          repo.owner.login.toLowerCase().includes(search.toLowerCase())
      ),
    [repositories, search]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRepos.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedRepos = filteredRepos.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [search]);

  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 max-w-sm rounded-md bg-white/[0.04]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <Input
            placeholder="Search repositories..."
            className="pl-9 h-9 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/25 focus-visible:ring-cyan-500/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {filteredRepos.length > 0 && (
          <p className="text-xs text-white/35 tabular-nums">
            {filteredRepos.length} {filteredRepos.length === 1 ? 'repository' : 'repositories'}
          </p>
        )}
      </div>

      {filteredRepos.length === 0 ? (
        <div className="kryon-card rounded-lg p-12 text-center">
          <p className="text-sm text-white/40">No repositories found</p>
        </div>
      ) : (
        <div className="flex items-stretch gap-3 md:gap-4">
            <PaginationArrow
              direction="left"
              onClick={goPrev}
              disabled={safePage === 0}
              label="Previous repositories"
            />

            <div className="flex-1 min-w-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={safePage}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {paginatedRepos.map((repo) => (
                    <RepositoryCard key={repo.id} repository={repo} onSelect={onSelect} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <PaginationArrow
              direction="right"
              onClick={goNext}
              disabled={safePage >= totalPages - 1}
              label="Next repositories"
            />
        </div>
      )}
    </div>
  );
}

function PaginationArrow({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex flex-shrink-0 self-center h-9 w-9 md:h-10 md:w-10 rounded-full',
        'border-white/[0.08] bg-white/[0.02] text-white/50',
        'hover:bg-white/[0.05] hover:text-white hover:border-white/[0.12]',
        'disabled:opacity-25 disabled:pointer-events-none',
        'transition-colors duration-200'
      )}
    >
      <Icon className="w-5 h-5" />
    </Button>
  );
}
