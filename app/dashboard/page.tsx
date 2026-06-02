'use client';

import { useState, useEffect } from 'react';
import { type GitHubRepo, type GitHubPR } from '@/types/github';
import { PRList } from '@/components/features/pr-list/pr-list';
import { PRAnalysisPanel } from '@/components/features/pr-analysis/pr-analysis-panel';
import { RepositoryList } from '@/components/features/repository/repository-list';
import { useAI } from './layout';
import { useRepositories } from '@/hooks/useRepositories';
import { usePullRequests } from '@/hooks/usePullRequests';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Github } from 'lucide-react';

export default function Dashboard() {
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const { state, analysis, isCached, startAnalysis, error: aiError } = useAI();
  const [selectedPR, setSelectedPR] = useState<GitHubPR | null>(null);
  
  const { repos, loading: isLoadingRepos } = useRepositories();
  const { pulls, loading: isLoadingPRs } = usePullRequests(
    selectedRepo?.owner.login,
    selectedRepo?.name
  );

  useEffect(() => {
    if (aiError) {
      toast.error(aiError);
    }
  }, [aiError]);

  const handleSelectPR = (pr: GitHubPR) => {
    if (pr.number === selectedPR?.number) return;
    setSelectedPR(pr);
    if (selectedRepo) {
      startAnalysis(selectedRepo.owner.login, selectedRepo.name, pr.number, pr.head.sha);
    }
  };

  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setSelectedPR(null);
    toast.success(`Connected to ${repo.name}`);
  };

  const handleBackToRepos = () => {
    setSelectedRepo(null);
    setSelectedPR(null);
  };

  if (!selectedRepo) {
    return (
      <div className="flex-1 overflow-y-auto p-8 animate-in fade-in duration-700">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest">
              <Github className="w-4 h-4" /> Step 1: Select a Repository
            </div>
            <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">
              Connect your <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">GitHub Projects</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Choose a repository to begin the AI-powered code review. 
              Our agent will scan your PRs for risks and improvements.
            </p>
          </div>
          
          <RepositoryList 
            repositories={repos as any} 
            onSelect={handleSelectRepo as any} 
            isLoading={isLoadingRepos} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 h-full overflow-hidden flex flex-col animate-in fade-in duration-700 bg-slate-950">
      {/* Repo Sub-header */}
      <div className="h-14 bg-slate-900/60 border-b border-white/5 flex items-center px-6 justify-between flex-shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToRepos}
            className="text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-4 h-4 mr-1.5" /> Back to Repos
          </Button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-3 text-sm">
             <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center border border-white/5">
                <Github className="w-3.5 h-3.5 text-slate-400" />
             </div>
            <span className="text-slate-400 font-medium">{selectedRepo.owner.login}</span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-bold tracking-tight">{selectedRepo.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Agent Active</span>
           </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex">
        {/* PR List */}
        <PRList 
          prs={pulls as any} 
          selectedPR={selectedPR as any} 
          onSelectPR={handleSelectPR as any} 
          isLoading={isLoadingPRs}
        />

        {/* Analysis Panel */}
        <PRAnalysisPanel 
          analysis={analysis} 
          state={state} 
          isCached={isCached}
        />
      </div>
    </div>
  );
}
