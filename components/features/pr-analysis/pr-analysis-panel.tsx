'use client';

import { useState, useEffect } from 'react';
import { type AIProcessingState } from '@/hooks/useAIAnalysis';
import { type AnalysisResult } from '@/types/github';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, AlertTriangle, CheckCircle2, ListChecks, Info, Zap, Terminal } from 'lucide-react';

interface PRAnalysisPanelProps {
  analysis: AnalysisResult | null;
  state: AIProcessingState;
  isCached?: boolean;
}

export function PRAnalysisPanel({ analysis, state, isCached }: PRAnalysisPanelProps) {
  const [streamedSummary, setStreamedSummary] = useState('');

  useEffect(() => {
    if (state === 'completed' && analysis?.summary) {
      setStreamedSummary('');
      let i = 0;
      const interval = setInterval(() => {
        setStreamedSummary((prev) => prev + analysis.summary.charAt(i));
        i++;
        if (i >= analysis.summary.length) clearInterval(interval);
      }, 5);
      return () => clearInterval(interval);
    } else {
      setStreamedSummary('');
    }
  }, [state, analysis]);

  // Loading & Analyzing States
  if (state === 'fetching' || state === 'analyzing') {
    return (
      <div className="flex-1 min-h-0 flex flex-col bg-slate-900/40 border-l border-white/5 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          <div className="p-8 space-y-10 max-w-5xl mx-auto w-full pb-24">
            {/* Premium Header Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
                  <div className="h-6 w-64 bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
              <Badge variant="outline" className="bg-slate-800/50 border-cyan-500/30 text-cyan-400 animate-pulse px-4 py-1">
                {state === 'fetching' ? 'Retrieving Data' : 'AI Reasoning...'}
              </Badge>
            </div>

            {/* Main Card Skeleton */}
            <div className="glass-morphism rounded-3xl border border-white/5 overflow-hidden h-[400px] flex flex-col">
              <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              <div className="p-8 space-y-6 flex-1">
                <Skeleton className="h-8 w-1/3 bg-slate-800" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full bg-slate-800/50" />
                  <Skeleton className="h-4 w-11/12 bg-slate-800/50" />
                  <Skeleton className="h-4 w-10/12 bg-slate-800/50" />
                  <Skeleton className="h-4 w-full bg-slate-800/50" />
                  <Skeleton className="h-4 w-9/12 bg-slate-800/50" />
                </div>
              </div>
            </div>

            {/* Bottom Grid Skeleton */}
            <div className="grid grid-cols-2 gap-8 h-64">
              <div className="glass-morphism rounded-2xl border border-white/5 p-6 space-y-4">
                <Skeleton className="h-6 w-1/2 bg-slate-800" />
                <Skeleton className="h-32 bg-slate-800/30 rounded-xl" />
              </div>
              <div className="glass-morphism rounded-2xl border border-white/5 p-6 space-y-4">
                <Skeleton className="h-6 w-1/2 bg-slate-800" />
                <Skeleton className="h-32 bg-slate-800/30 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (state === 'failed') {
    return (
      <div className="flex-1 flex flex-col bg-slate-900/30 border-l border-white/5 items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-8 glass rounded-3xl border border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto opacity-50" />
          <h3 className="text-xl font-bold text-slate-200">Analysis Failed</h3>
          <p className="text-slate-400 text-sm">
            We encountered an error while analyzing this PR. This could be due to a very large diff or a temporary issue with the Gemini API.
          </p>
        </div>
      </div>
    );
  }

  // Idle State
  if (state === 'idle' && !analysis) {
    return (
      <div className="flex-1 flex flex-col bg-slate-900/30 border-l border-white/5 items-center justify-center">
        <div className="text-center space-y-6 max-w-lg p-12">
          <div className="relative mx-auto w-24 h-24">
             <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
             <div className="relative w-24 h-24 rounded-3xl bg-slate-800/50 flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-xl">
               <Terminal className="w-10 h-10 text-slate-500" />
             </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-200 tracking-tight">Select a Pull Request</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pick a PR from the sidebar to initialize the AI analysis agent. 
              Gemini will perform a multi-layer scan for quality, security, and architectural alignment.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-left">
              <Zap className="w-4 h-4 text-cyan-400 mb-2" />
              <div className="text-xs font-bold text-slate-300">Fast Scan</div>
              <div className="text-[10px] text-slate-500">Under 30s analysis</div>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-left">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mb-2" />
              <div className="text-xs font-bold text-slate-300">Deep Insights</div>
              <div className="text-[10px] text-slate-500">AST-based reasoning</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  // Main Content State
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-900/30 border-l border-white/5 overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth pr-1">
        <div className="p-8 space-y-8 max-w-5xl mx-auto pb-32">
          {/* Summary Card */}
          <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-px flex-1 bg-slate-800" />
              <div className="flex items-center gap-3 px-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  AI Executive Summary
                </h2>
                {isCached && (
                  <Badge variant="outline" className="text-[10px] h-5 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-in fade-in zoom-in duration-500">
                    <Zap className="w-2.5 h-2.5 mr-1" />
                    Cached Analysis
                  </Badge>
                )}
                {!isCached && state === 'completed' && (
                  <Badge variant="outline" className="text-[10px] h-5 bg-purple-500/10 text-purple-400 border-purple-500/20 animate-in fade-in zoom-in duration-500">
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                    Fresh Analysis
                  </Badge>
                )}
              </div>
              <div className="h-px flex-1 bg-slate-800" />
            </div>
            
            <div className="glass-morphism rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-500 via-purple-500 to-cyan-500 z-10" />
              <div className="p-8">
                <p className="text-slate-200 text-lg leading-relaxed font-medium">
                  {streamedSummary}
                  {state === 'completed' && streamedSummary.length < (analysis.summary?.length || 0) && (
                    <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Two Column Layout for Details */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Risks & Vulnerabilities */}
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-200 fill-mode-both">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                Risks & Bugs
              </h2>
              <div className="space-y-3">
                {analysis.risks.length === 0 ? (
                  <div className="p-4 rounded-xl border border-green-500/10 bg-green-500/5 text-green-400 text-sm flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4" /> No significant risks detected.
                  </div>
                ) : (
                  analysis.risks.map((risk, idx) => (
                    <div key={idx} className="glass-hover rounded-xl p-4 border border-red-500/10 flex items-start gap-3 group transition-all">
                      <div className="w-6 h-6 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0 text-[10px] font-black border border-red-500/20">
                        ERR
                      </div>
                      <p className="text-slate-300 text-sm group-hover:text-slate-100 transition-colors leading-relaxed">{risk}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Important Changes */}
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-700 delay-300 fill-mode-both">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <ListChecks className="w-4 h-4 text-cyan-400" />
                </div>
                Key Modalities
              </h2>
              <div className="space-y-3">
                {analysis.importantChanges.map((change, idx) => (
                  <div key={idx} className="glass-hover rounded-xl p-4 border border-cyan-500/10 flex items-start gap-3 group transition-all">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <p className="text-slate-300 text-sm group-hover:text-slate-100 transition-colors leading-relaxed">{change}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              Strategic Recommendations
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="glass-morphism rounded-2xl p-6 border border-purple-500/10 hover:border-purple-500/30 transition-all bg-purple-500/5 group">
                  <p className="text-slate-300 text-sm leading-relaxed group-hover:text-slate-100 transition-colors">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
