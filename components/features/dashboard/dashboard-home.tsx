'use client';

import { motion } from 'framer-motion';
import { ArrowRight, GitBranch, Shield, Target, Beaker, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from './dashboard-context';

const workflow = [
  { step: 1, label: 'Repository', icon: GitBranch },
  { step: 2, label: 'Pull Request', icon: GitBranch },
  { step: 3, label: 'AI Risk Analysis', icon: Shield },
  { step: 4, label: 'Coverage Prediction', icon: Target },
  { step: 5, label: 'Test Planning', icon: Beaker },
  { step: 6, label: 'Prioritized Testing', icon: Target },
  { step: 7, label: 'Playwright Generation', icon: CheckCircle2 },
  { step: 8, label: 'Merge Decision', icon: CheckCircle2 },
];

export function DashboardHome() {
  const { setView, analysisHistory } = useDashboard();

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-2">Mission Control</p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Understand PR risk before merge
          </h1>
          <p className="text-white/45 mt-2 max-w-xl text-sm leading-relaxed">
            Kryon analyzes pull requests for security, architecture, and performance risk — then generates
            strategic test plans and Playwright specs.
          </p>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setView('repositories')}
              className="bg-cyan-500 hover:bg-cyan-400 text-[#050505] font-semibold kryon-glow-sm"
            >
              Connect Repository
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {analysisHistory.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setView('history')}
                className="border-white/[0.08] text-white/70 hover:bg-white/[0.04]"
              >
                View History
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="kryon-card rounded-lg p-6"
        >
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-5">Analysis Workflow</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {workflow.map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-3 p-3 rounded-md bg-white/[0.02] border border-white/[0.06] kryon-card-hover"
              >
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[10px] font-semibold text-cyan-400">
                  {item.step}
                </span>
                <span className="text-xs font-medium text-white/60">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {analysisHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="kryon-card rounded-lg p-6"
          >
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Recent Analysis</h2>
            <div className="space-y-2">
              {analysisHistory.slice(0, 5).map((h) => (
                <div
                  key={`${h.repoOwner}-${h.repoName}-${h.prNumber}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {h.repoOwner}/{h.repoName} <span className="text-white/40">#{h.prNumber}</span>
                    </p>
                    <p className="text-xs text-white/35 truncate max-w-md">{h.prTitle}</p>
                  </div>
                  <span className="text-xs text-white/30">{new Date(h.analyzedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
