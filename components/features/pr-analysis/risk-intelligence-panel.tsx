'use client';

import { motion } from 'framer-motion';
import { type AnalysisResult } from '@/types/github';
import { RiskScoreRing } from './risk-score-ring';
import { Badge } from '@/components/ui/badge';
import { Database, Server, Monitor, Cloud, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskIntelligencePanelProps {
  analysis: AnalysisResult | null;
  state: string;
  isOpen?: boolean;
}

const blastItems = [
  { key: 'frontend' as const, label: 'Frontend', icon: Monitor },
  { key: 'backend' as const, label: 'Backend', icon: Server },
  { key: 'database' as const, label: 'Database', icon: Database },
  { key: 'infrastructure' as const, label: 'Infrastructure', icon: Cloud },
];

function riskBadgeClass(level: string) {
  switch (level) {
    case 'HIGH':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    default:
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }
}

export function RiskIntelligencePanel({ analysis, state, isOpen = true }: RiskIntelligencePanelProps) {
  if (!isOpen) return null;
  const metrics = analysis?.metrics || { security: 100, performance: 100, architecture: 100, overall: 100 };
  const blastRadius = analysis?.blastRadius || {
    frontend: false,
    backend: false,
    database: false,
    infrastructure: false,
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-[300px] flex-shrink-0 border-l border-white/[0.06] bg-[#050505] flex flex-col min-h-0 hidden xl:flex"
    >
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Risk Intelligence</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {analysis ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <RiskScoreRing label="Risk Score" score={metrics.overall} size="sm" />
              <RiskScoreRing label="Security" score={metrics.security} size="sm" />
              <RiskScoreRing label="Architecture" score={metrics.architecture} size="sm" />
              <RiskScoreRing label="Performance" score={metrics.performance} size="sm" />
            </div>

            <div className="kryon-card rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/40">Risk Level</span>
                <Badge variant="outline" className={cn('text-[10px] border', riskBadgeClass(analysis.riskLevel || 'LOW'))}>
                  {analysis.riskLevel || 'LOW'}
                </Badge>
              </div>
              {analysis.affectedModules?.length > 0 && (
                <div>
                  <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Affected Systems</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {analysis.affectedModules.map((mod) => (
                      <span
                        key={mod}
                        className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-white/60"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="kryon-card rounded-lg p-4 space-y-3">
              <span className="text-xs font-medium text-white/40">Blast Radius</span>
              <div className="grid grid-cols-2 gap-2">
                {blastItems.map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-2 rounded-md border text-[11px] font-medium',
                      blastRadius[key]
                        ? 'border-amber-500/20 bg-amber-500/5 text-amber-400'
                        : 'border-white/[0.06] bg-white/[0.02] text-white/30'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {analysis.regressionAreas?.length > 0 && (
              <div className="kryon-card rounded-lg p-4 space-y-2">
                <span className="text-xs font-medium text-white/40">Regression Areas</span>
                <ul className="space-y-1.5">
                  {analysis.regressionAreas.map((area) => (
                    <li key={area} className="text-[11px] text-white/50 flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-white/30 leading-relaxed">
              {state === 'idle'
                ? 'Select a pull request to surface risk intelligence, blast radius, and affected systems.'
                : 'Risk intelligence will appear once analysis completes.'}
            </p>
            <WorkflowSteps />
          </div>
        )}
      </div>
    </motion.aside>
  );
}

function WorkflowSteps() {
  const steps = [
    'Repository',
    'Pull Request',
    'AI Risk Analysis',
    'Coverage Prediction',
    'Test Planning',
    'Prioritized Testing',
    'Playwright Generation',
    'Merge Decision',
  ];

  return (
    <div className="kryon-card rounded-lg p-4">
      <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Workflow</span>
      <ol className="mt-3 space-y-2">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-2.5 text-[11px] text-white/40">
            <span className="w-5 h-5 rounded-full border border-white/[0.08] flex items-center justify-center text-[9px] font-semibold text-white/30">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
