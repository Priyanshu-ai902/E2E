'use client';

import { motion } from 'framer-motion';
import { 
  Plus, 
  Link, 
  Clock, 
  GitBranch, 
  GitPullRequest, 
  AlertTriangle, 
  FileCode 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from './dashboard-context';
import { useRepositories } from '@/hooks/useRepositories';

export function DashboardHome() {
  const { setView, analysisHistory } = useDashboard();
  const { repos, loading: isLoadingRepos } = useRepositories();

  // Extract real findings from history entries
  const realFindings = analysisHistory
    .filter(h => h.findings && h.findings.length > 0)
    .flatMap(h => (h.findings || []).map(f => ({
      title: f.title,
      repo: `${h.repoOwner}/${h.repoName}`,
      severity: f.severity || 'LOW',
      description: f.description
    })))
    .slice(0, 5);

  // Dynamic Hero content based on State A, B, or C
  const hasRepos = repos && repos.length > 0;
  const hasAnalyses = analysisHistory && analysisHistory.length > 0;

  let heroTitle = "Connect your first repository";
  let heroDescription = "Link a GitHub repository to configure Kryon and start reviewing pull requests.";

  if (hasRepos && !hasAnalyses) {
    heroTitle = "Ready to analyze pull requests";
    heroDescription = "Repository connected successfully. Select a repository to begin code review and test generation.";
  } else if (hasAnalyses) {
    heroTitle = "Recent activity and risk intelligence";
    heroDescription = "Monitor overall security, performance, and coverage metrics across your codebases.";
  }

  // Calculate real metrics from application state
  const reposCount = repos ? repos.length : 0;
  const prsAnalyzedCount = analysisHistory ? analysisHistory.length : 0;
  const risksCount = analysisHistory 
    ? analysisHistory.filter(h => h.riskLevel === 'HIGH' || h.riskLevel === 'MEDIUM').length 
    : 0;
  const specsCount = analysisHistory ? analysisHistory.length : 0;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">
        
        {/* SECTION 1: Quick Actions Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.04] pb-6"
        >
          <div>
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Dashboard</p>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              {heroTitle}
            </h1>
            <p className="text-zinc-500 text-xs mt-1 max-w-xl font-light">
              {heroDescription}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={() => setView('repositories')}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs h-9 px-4 rounded shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Analyze New PR</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setView('repositories')}
              className="border-white/[0.08] text-white/80 hover:text-white hover:bg-white/[0.04] text-xs h-9 px-4 flex items-center gap-1.5 cursor-pointer"
            >
              <Link className="w-3.5 h-3.5 text-zinc-500" />
              <span>Connect Repository</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setView('history')}
              className="border-white/[0.08] text-white/80 hover:text-white hover:bg-white/[0.04] text-xs h-9 px-4 flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>View History</span>
            </Button>
          </div>
        </motion.div>

        {/* SECTION 2: Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Repositories Connected', value: reposCount, icon: GitBranch, color: 'text-cyan-400' },
            { label: 'PRs Analyzed', value: prsAnalyzedCount, icon: GitPullRequest, color: 'text-indigo-400' },
            { label: 'Risks Detected', value: risksCount, icon: AlertTriangle, color: 'text-amber-500' },
            { label: 'Playwright Specs Generated', value: specsCount, icon: FileCode, color: 'text-emerald-400' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                className="rounded-lg border border-white/[0.06] bg-[#070709]/40 hover:border-white/[0.1] transition-all p-4.5 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-md bg-white/[0.02] border border-white/[0.04] ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Columns: Analysis Table & Risk Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SECTION 3: Recent Analysis Table */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recent Analysis</h2>
            
            {!hasAnalyses ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01] text-center space-y-4 min-h-[220px]">
                <div className="p-3 rounded-full bg-white/[0.02] border border-white/[0.04]">
                  <GitPullRequest className="w-5 h-5 text-zinc-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">No analyses yet</h3>
                  <p className="text-xs text-zinc-500 max-w-xs">
                    Connect a repository and analyze your first pull request.
                  </p>
                </div>
                <Button 
                  onClick={() => setView('repositories')}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs h-8 px-4 cursor-pointer"
                >
                  Connect Repository
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-white/[0.06] bg-[#070709]/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.01] text-[10px] text-zinc-500 font-bold uppercase tracking-wider select-none">
                        <th className="py-2.5 px-4 font-semibold">Repository</th>
                        <th className="py-2.5 px-4 font-semibold">PR</th>
                        <th className="py-2.5 px-4 font-semibold">Risk Level</th>
                        <th className="py-2.5 px-4 font-semibold">Status</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] text-xs text-zinc-300">
                      {analysisHistory.slice(0, 5).map((h) => (
                        <tr key={h.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 px-4 font-medium text-white truncate max-w-[140px]" title={`${h.repoOwner}/${h.repoName}`}>
                            {h.repoOwner}/{h.repoName}
                          </td>
                          <td className="py-3 px-4 truncate max-w-[180px] text-zinc-400" title={h.prTitle}>
                            #{h.prNumber} {h.prTitle}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                              h.riskLevel === 'HIGH' 
                                ? 'text-red-400 bg-red-500/10 border-red-500/25' 
                                : h.riskLevel === 'MEDIUM'
                                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                                  : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25'
                            }`}>
                              {h.riskLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${h.riskLevel === 'HIGH' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                              <span className="text-[11px] text-zinc-400">
                                {h.riskLevel === 'HIGH' ? 'Risk Alert' : 'Analyzed'}
                              </span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-500 font-mono">
                            {new Date(h.analyzedAt).toISOString().split('T')[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Recent Risk Findings */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recent Risk Findings</h2>
            
            {realFindings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01] text-center space-y-3 min-h-[220px]">
                <div className="p-2.5 rounded-full bg-white/[0.02] border border-white/[0.04]">
                  <AlertTriangle className="w-5 h-5 text-zinc-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-white">No risk findings available</h3>
                  <p className="text-[11px] text-zinc-500 max-w-[200px] leading-relaxed">
                    Run an analysis to generate risk insights.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {realFindings.map((finding, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * idx }}
                    className={`rounded-lg border bg-[#070709]/30 p-3.5 text-left space-y-1.5 transition-all ${
                      finding.severity === 'HIGH' || finding.severity === 'CRITICAL'
                        ? 'border-l-2 border-l-red-500 border-white/[0.04] hover:border-l-red-400'
                        : finding.severity === 'MEDIUM'
                          ? 'border-l-2 border-l-amber-500 border-white/[0.04] hover:border-l-amber-400'
                          : 'border-l-2 border-l-cyan-500 border-white/[0.04] hover:border-l-cyan-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white tracking-tight truncate">
                        {finding.title}
                      </h4>
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase tracking-wider ${
                        finding.severity === 'HIGH' || finding.severity === 'CRITICAL'
                          ? 'text-red-400 bg-red-500/5 border-red-500/15'
                          : finding.severity === 'MEDIUM'
                            ? 'text-amber-400 bg-amber-500/5 border-amber-500/15'
                            : 'text-cyan-400 bg-cyan-500/5 border-cyan-500/15'
                      }`}>
                        {finding.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Repository: <span className="text-zinc-300 font-semibold">{finding.repo}</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-normal font-light">
                      {finding.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
