'use client';

import { useEffect } from 'react';
import { type GitHubRepo, type GitHubPR } from '@/types/github';
import { PRList } from '@/components/features/pr-list/pr-list';
import { PRAnalysisPanel } from '@/components/features/pr-analysis/pr-analysis-panel';
import { RepositoryList } from '@/components/features/repository/repository-list';
import { DashboardHome } from '@/components/features/dashboard/dashboard-home';
import { AnalysisHistoryView } from '@/components/features/dashboard/analysis-history';
import { SettingsView } from '@/components/features/dashboard/settings-view';
import { useAI } from './layout';
import { useDashboard } from '@/components/features/dashboard/dashboard-context';
import { useRepositories } from '@/hooks/useRepositories';
import { usePullRequests } from '@/hooks/usePullRequests';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Github } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const {
    view,
    selectedRepo,
    setSelectedRepo,
    selectedPR,
    setSelectedPR,
    addToHistory,
    setView,
  } = useDashboard();

  const { state, analysis, isCached, startAnalysis, error: aiError } = useAI();
  const { repos, loading: isLoadingRepos } = useRepositories();
  const { pulls, loading: isLoadingPRs } = usePullRequests(
    selectedRepo?.owner.login,
    selectedRepo?.name
  );

  useEffect(() => {
    if (aiError) toast.error(aiError);
  }, [aiError]);

  useEffect(() => {
    if (state === 'completed' && analysis?.id && selectedRepo && selectedPR) {
      addToHistory({
        id: analysis.id,
        repoOwner: selectedRepo.owner.login,
        repoName: selectedRepo.name,
        prNumber: selectedPR.number,
        prTitle: selectedPR.title,
        riskLevel: analysis.riskLevel || 'LOW',
        overallScore: analysis.metrics?.overall || 100,
        analyzedAt: new Date().toISOString(),
      });
    }
  }, [state, analysis, selectedRepo, selectedPR, addToHistory]);

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
    setView('repositories');
  };

  if (view === 'dashboard') {
    return <DashboardHome />;
  }

  if (view === 'history') {
    return <AnalysisHistoryView />;
  }

  if (view === 'settings') {
    return <SettingsView />;
  }

  if (view === 'repositories' && !selectedRepo) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-2">Step 1</p>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Select a repository</h1>
            <p className="text-sm text-white/40 mt-1 max-w-lg">
              Connect a GitHub repository to begin PR risk analysis and test intelligence.
            </p>
          </motion.div>
          <RepositoryList
            repositories={repos as GitHubRepo[]}
            onSelect={handleSelectRepo}
            isLoading={isLoadingRepos}
          />
        </div>
      </div>
    );
  }

  if (view === 'repositories' && selectedRepo) {
    return (
    <div className="flex-1 min-h-0 h-full overflow-hidden flex flex-col">
      <div className="h-11 border-b border-white/[0.06] bg-[#050505] flex items-center px-4 justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToRepos}
            className="h-7 text-white/40 hover:text-white hover:bg-white/[0.04] text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Repositories
          </Button>
          <div className="h-3 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-2 text-xs">
            <Github className="w-3.5 h-3.5 text-white/30" />
            <span className="text-white/40">{selectedRepo?.owner.login}</span>
            <span className="text-white/20">/</span>
            <span className="text-white font-medium">{selectedRepo?.name}</span>
          </div>
        </div>
        {(state === 'analyzing' || state === 'fetching') && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/5 border border-cyan-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-medium text-cyan-400 uppercase tracking-wider">Agent Active</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex">
        <PRList
          prs={pulls as GitHubPR[]}
          selectedPR={selectedPR}
          onSelectPR={handleSelectPR}
          isLoading={isLoadingPRs}
        />
        <PRAnalysisPanel analysis={analysis} state={state} isCached={isCached} />
      </div>
    </div>
    );
  }

  return null;
}
