'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AgentStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'failed';
}

interface AgentLoadingProps {
  steps: AgentStep[];
  title?: string;
}

export function AgentLoading({ steps, title = 'Kryon Agent' }: AgentLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-[11px] font-medium text-cyan-400 uppercase tracking-wider">{title}</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Analyzing pull request risk</h3>
          <p className="text-sm text-white/40 mt-1">Autonomous intelligence pipeline running</p>
        </div>

        <div className="kryon-card rounded-lg p-5 space-y-0">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.25 }}
              className="relative flex items-start gap-3 py-3"
            >
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute left-[11px] top-9 bottom-0 w-px',
                    step.status === 'completed' ? 'bg-cyan-500/30' : 'bg-white/[0.06]'
                  )}
                />
              )}
              <div className="relative z-10 mt-0.5">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-[22px] h-[22px] text-cyan-400" />
                ) : step.status === 'loading' ? (
                  <Loader2 className="w-[22px] h-[22px] text-cyan-400 animate-spin" />
                ) : step.status === 'failed' ? (
                  <Circle className="w-[22px] h-[22px] text-red-400" />
                ) : (
                  <Circle className="w-[22px] h-[22px] text-white/15" />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors',
                    step.status === 'completed' && 'text-white/70',
                    step.status === 'loading' && 'text-white',
                    step.status === 'pending' && 'text-white/30',
                    step.status === 'failed' && 'text-red-400'
                  )}
                >
                  {step.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function buildAgentSteps(
  analysisState: string,
  pipelineLoading: { strategy: boolean; coverage: boolean; prioritize: boolean; playwright: boolean }
): AgentStep[] {
  const base: AgentStep[] = [
    { id: 'fetch', label: 'Fetching PR Data', status: 'pending' },
    { id: 'files', label: 'Analyzing Changed Files', status: 'pending' },
    { id: 'risk', label: 'Running Risk Engine', status: 'pending' },
    { id: 'strategy', label: 'Generating Test Strategy', status: 'pending' },
    { id: 'playwright', label: 'Preparing Playwright Specs', status: 'pending' },
  ];

  if (analysisState === 'fetching') {
    base[0].status = 'loading';
    return base;
  }

  if (analysisState === 'analyzing') {
    base[0].status = 'completed';
    base[1].status = 'completed';
    base[2].status = 'loading';
    return base;
  }

  if (pipelineLoading.strategy) {
    base[0].status = 'completed';
    base[1].status = 'completed';
    base[2].status = 'completed';
    base[3].status = 'loading';
    return base;
  }

  if (pipelineLoading.coverage || pipelineLoading.prioritize) {
    base[0].status = 'completed';
    base[1].status = 'completed';
    base[2].status = 'completed';
    base[3].status = 'completed';
    base[4].status = 'loading';
    return base;
  }

  if (pipelineLoading.playwright) {
    base.forEach((s, i) => {
      if (i < 4) s.status = 'completed';
      else s.status = 'loading';
    });
    return base;
  }

  return base;
}
