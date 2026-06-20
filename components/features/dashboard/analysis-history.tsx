'use client';

import { motion } from 'framer-motion';
import { History, Shield } from 'lucide-react';
import { useDashboard } from './dashboard-context';
import { cn } from '@/lib/utils';

export function AnalysisHistoryView() {
  const { analysisHistory } = useDashboard();

  if (analysisHistory.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <History className="w-10 h-10 text-white/15 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white">No analysis history</h2>
          <p className="text-sm text-white/40 mt-2">
            Completed PR analyses will appear here for quick reference.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <h1 className="text-xl font-semibold text-white mb-1">Analysis History</h1>
        <p className="text-sm text-white/40 mb-8">Recent pull request risk analyses</p>
        <div className="space-y-2">
          {analysisHistory.map((entry, idx) => (
            <motion.div
              key={`${entry.repoOwner}-${entry.repoName}-${entry.prNumber}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="kryon-card kryon-card-hover rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {entry.repoOwner}/{entry.repoName}
                    <span className="text-white/40 ml-1.5">#{entry.prNumber}</span>
                  </p>
                  <p className="text-xs text-white/40 mt-0.5 truncate max-w-md">{entry.prTitle}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase px-2 py-0.5 rounded border',
                    entry.riskLevel === 'HIGH'
                      ? 'text-red-400 border-red-500/20 bg-red-500/5'
                      : entry.riskLevel === 'MEDIUM'
                        ? 'text-amber-400 border-amber-500/20 bg-amber-500/5'
                        : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                  )}
                >
                  {entry.riskLevel}
                </span>
                <p className="text-[10px] text-white/30 mt-1">
                  Score {entry.overallScore} · {new Date(entry.analyzedAt).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
