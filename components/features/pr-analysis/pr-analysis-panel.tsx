'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type AIProcessingState } from '@/hooks/useAIAnalysis';
import { type AnalysisResult } from '@/types/github';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Terminal, Zap, PanelRight, RefreshCw, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RiskScoreRing } from './risk-score-ring';
import { RiskIntelligencePanel } from './risk-intelligence-panel';
import { AnalysisSections } from './analysis-sections';
import { TestingTabs } from './testing-tabs';
import { AgentLoading, buildAgentSteps } from './agent-loading';
import { useTestPipeline } from '@/hooks/useTestPipeline';
import { useAI } from '@/app/dashboard/layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PRAnalysisPanelProps {
  analysis: AnalysisResult | null;
  state: AIProcessingState;
  isCached?: boolean;
}

export function PRAnalysisPanel({ analysis, state, isCached }: PRAnalysisPanelProps) {
  const [streamedSummary, setStreamedSummary] = useState('');
  const [showRiskPanel, setShowRiskPanel] = useState(true);
  const { startAnalysis } = useAI();
  const [activeAction, setActiveAction] = useState<'ai-only' | 'full' | null>(null);

  const isExecuting = state === 'fetching' || state === 'analyzing';

  const handleReanalyzeAI = () => {
    if (!analysis || !analysis.prNumber) return;
    setActiveAction('ai-only');
    toast.loading("Regenerating AI Analysis...", { id: "reanalyze-toast" });
    startAnalysis(
      analysis.repoOwner || "",
      analysis.repoName || "",
      analysis.prNumber,
      analysis.commitSha || "",
      'ai-only'
    );
  };

  const handleFullReanalyze = () => {
    if (!analysis || !analysis.prNumber) return;
    setActiveAction('full');
    toast.loading("Running fresh analysis...", { id: "reanalyze-toast" });
    startAnalysis(
      analysis.repoOwner || "",
      analysis.repoName || "",
      analysis.prNumber,
      analysis.commitSha || "",
      'full'
    );
  };

  useEffect(() => {
    if (activeAction) {
      if (state === 'completed') {
        toast.success(
          activeAction === 'ai-only' 
            ? "AI analysis regenerated successfully" 
            : "Fresh analysis completed", 
          { id: "reanalyze-toast" }
        );
        setActiveAction(null);
      } else if (state === 'failed') {
        toast.error("Analysis failed. Please try again.", { id: "reanalyze-toast" });
        setActiveAction(null);
      }
    }
  }, [state, activeAction]);

  const pipelineEnabled = state === 'completed' && !!analysis?.id;
  const { testPlan, prediction, queue, playwrightTests, loading: pipelineLoading } = useTestPipeline(
    analysis?.id,
    pipelineEnabled
  );

  const agentSteps = buildAgentSteps(state, pipelineLoading);
  const showAgentLoading =
    state === 'fetching' ||
    state === 'analyzing' ||
    (state === 'completed' && pipelineEnabled && (pipelineLoading.strategy || pipelineLoading.coverage || pipelineLoading.playwright));

  useEffect(() => {
    if (state === 'completed' && analysis?.summary) {
      setStreamedSummary('');
      let i = 0;
      const interval = setInterval(() => {
        setStreamedSummary((prev) => prev + analysis.summary.charAt(i));
        i++;
        if (i >= analysis.summary.length) clearInterval(interval);
      }, 4);
      return () => clearInterval(interval);
    }
    setStreamedSummary('');
  }, [state, analysis]);

  if (state === 'failed') {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] border-l border-white/[0.06]">
          <div className="text-center max-w-sm p-8 kryon-card rounded-lg">
            <AlertTriangle className="w-10 h-10 text-red-400/60 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-white">Analysis failed</h3>
            <p className="text-sm text-white/40 mt-2">
              We encountered an error analyzing this PR. Try again or check back later.
            </p>
          </div>
        </div>
        <RiskIntelligencePanel analysis={null} state={state} isOpen={showRiskPanel} />
      </>
    );
  }

  if (showAgentLoading) {
    return (
      <>
        <div className="flex-1 min-h-0 flex flex-col bg-[#050505] border-l border-white/[0.06] overflow-hidden">
          <AgentLoading steps={agentSteps} />
        </div>
        <RiskIntelligencePanel analysis={analysis} state={state} isOpen={showRiskPanel} />
      </>
    );
  }

  if (state === 'idle' && !analysis) {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] border-l border-white/[0.06]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center max-w-md px-8"
          >
            <div className="w-14 h-14 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-5">
              <Terminal className="w-6 h-6 text-white/25" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI Analysis Workspace</h3>
            <p className="text-sm text-white/40 mt-2 leading-relaxed">
              Select a pull request to initialize risk analysis, coverage prediction, and strategic test planning.
            </p>
          </motion.div>
        </div>
        <RiskIntelligencePanel analysis={null} state={state} isOpen={showRiskPanel} />
      </>
    );
  }

  if (!analysis) return null;

  const metrics = analysis.metrics || { security: 100, performance: 100, architecture: 100, overall: 100 };
  const isStreaming = state === 'completed' && streamedSummary.length < (analysis.summary?.length || 0);

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col bg-[#050505] border-l border-white/[0.06] overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6 max-w-3xl mx-auto pb-20">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4"
            >
              <div>
                <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Analysis Workspace</p>
                <h1 className="text-base font-semibold text-white mt-0.5">
                  PR #{analysis.prNumber} Risk Report
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isCached && (
                  <Badge variant="outline" className="text-[10px] border-cyan-500/20 text-cyan-400 bg-cyan-500/5 h-7">
                    <Zap className="w-2.5 h-2.5 mr-1" />
                    Cached
                  </Badge>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReanalyzeAI}
                  disabled={isExecuting}
                  className="h-7 text-xs border-white/[0.08] hover:bg-white/[0.04] text-white/80"
                >
                  <RefreshCw className={cn("w-3 h-3 mr-1.5", activeAction === 'ai-only' && "animate-spin")} />
                  Reanalyze AI
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullReanalyze}
                  disabled={isExecuting}
                  className="h-7 text-xs border-white/[0.08] hover:bg-white/[0.04] text-white/80"
                >
                  <RotateCcw className={cn("w-3 h-3 mr-1.5", activeAction === 'full' && "animate-spin")} />
                  Full Reanalyze
                </Button>

                <button
                  onClick={() => setShowRiskPanel(!showRiskPanel)}
                  className={cn(
                    "p-1.5 rounded-md border text-white/40 hover:text-white transition-all cursor-pointer hover:bg-white/[0.04] bg-transparent h-7",
                    showRiskPanel ? "border-white/[0.08]" : "border-white/[0.04]"
                  )}
                  title={showRiskPanel ? "Hide Risk Intelligence" : "Show Risk Intelligence"}
                >
                  <PanelRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="kryon-card rounded-lg p-5 xl:hidden"
            >
              <div className="grid grid-cols-4 gap-2">
                <RiskScoreRing label="Risk" score={metrics.overall} size="sm" />
                <RiskScoreRing label="Security" score={metrics.security} size="sm" />
                <RiskScoreRing label="Architecture" score={metrics.architecture} size="sm" />
                <RiskScoreRing label="Performance" score={metrics.performance} size="sm" />
              </div>
            </motion.div>

            <AnalysisSections
              analysis={analysis}
              streamedSummary={streamedSummary}
              isStreaming={isStreaming}
            />

            <TestingTabs
              analysisRunId={analysis.id}
              testPlan={testPlan}
              prediction={prediction}
              queue={queue}
              playwrightTests={playwrightTests}
              loading={pipelineLoading}
            />
          </div>
        </div>
      </div>
      <RiskIntelligencePanel analysis={analysis} state={state} isOpen={showRiskPanel} />
    </>
  );
}
