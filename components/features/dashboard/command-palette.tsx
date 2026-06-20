'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useDashboard } from './dashboard-context';
import { useRepositories } from '@/hooks/useRepositories';
import { usePullRequests } from '@/hooks/usePullRequests';
import { LayoutDashboard, GitBranch, History, Settings, Search, Github } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartAnalysis?: (owner: string, repo: string, number: number, sha: string) => void;
}

export function CommandPalette({ open, onOpenChange, onStartAnalysis }: CommandPaletteProps) {
  const { setView, openAnalysis, analysisHistory, selectedRepo, setSelectedRepo } = useDashboard();
  const { repos } = useRepositories();
  const { pulls } = usePullRequests(selectedRepo?.owner.login, selectedRepo?.name);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filteredRepos = useMemo(() => {
    const q = query.toLowerCase();
    return (repos || []).filter(
      (r) => r.name.toLowerCase().includes(q) || r.owner.login.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [repos, query]);

  const filteredPRs = useMemo(() => {
    const q = query.toLowerCase();
    return (pulls || []).filter(
      (p) => p.title.toLowerCase().includes(q) || String(p.number).includes(q)
    ).slice(0, 8);
  }, [pulls, query]);

  const run = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Command Palette" description="Search repositories, PRs, and actions">
      <CommandInput
        placeholder="Search repositories, pull requests, actions..."
        value={query}
        onValueChange={setQuery}
        className="border-white/[0.06]"
      />
      <CommandList className="max-h-[360px]">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => run(() => setView('dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-cyan-400" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => run(() => setView('repositories'))}>
            <Github className="mr-2 h-4 w-4 text-cyan-400" />
            Repositories
          </CommandItem>
          <CommandItem onSelect={() => run(() => setView('history'))}>
            <History className="mr-2 h-4 w-4 text-cyan-400" />
            Analysis History
          </CommandItem>
          <CommandItem onSelect={() => run(() => setView('settings'))}>
            <Settings className="mr-2 h-4 w-4 text-cyan-400" />
            Settings
          </CommandItem>
        </CommandGroup>

        {filteredRepos.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Repositories">
              {filteredRepos.map((repo) => (
                <CommandItem
                  key={repo.id}
                  onSelect={() =>
                    run(() => {
                      setSelectedRepo(repo);
                      setView('repositories');
                    })
                  }
                >
                  <Github className="mr-2 h-4 w-4 opacity-50" />
                  <span className="text-white/50">{repo.owner.login}/</span>
                  {repo.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {selectedRepo && filteredPRs.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`PRs in ${selectedRepo.name}`}>
              {filteredPRs.map((pr) => (
                <CommandItem
                  key={pr.id}
                  onSelect={() =>
                    run(() => {
                      openAnalysis(selectedRepo, pr);
                      onStartAnalysis?.(selectedRepo.owner.login, selectedRepo.name, pr.number, pr.head.sha);
                    })
                  }
                >
                  <GitBranch className="mr-2 h-4 w-4 opacity-50" />
                  #{pr.number} {pr.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {analysisHistory.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Analysis">
              {analysisHistory.slice(0, 5).map((h) => (
                <CommandItem
                  key={`${h.repoOwner}-${h.repoName}-${h.prNumber}`}
                  onSelect={() => run(() => setView('history'))}
                >
                  <Search className="mr-2 h-4 w-4 opacity-50" />
                  {h.repoOwner}/{h.repoName} #{h.prNumber}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
