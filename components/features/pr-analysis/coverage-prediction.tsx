'use client';

import { useState, useEffect } from 'react';
import { type CoveragePrediction } from '@/lib/ai/schemas';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  Target,
  FileSearch,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoveragePredictionCardProps {
  analysisRunId: number | undefined;
  prediction: CoveragePrediction | null;
  loading?: boolean;
}

export function CoveragePredictionCard({ analysisRunId, prediction, loading }: CoveragePredictionCardProps) {
  if (loading) {
    return (
      <div className="kryon-card rounded-lg p-6 border border-white/5 space-y-4">
        <Skeleton className="h-4 w-32 bg-slate-800" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full bg-slate-800" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full bg-slate-800" />
            <Skeleton className="h-4 w-2/3 bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const getRiskColor = (score: string) => {
    switch (score) {
      case 'LOW': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'MEDIUM': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="kryon-card rounded-lg p-6 border border-white/5 space-y-6 animate-in fade-in zoom-in duration-500 delay-200 fill-mode-both">
      <div className="flex items-center justify-between">
        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-blue-400" />
          Coverage Risk Prediction
        </div>
        <Badge className={cn("px-2 py-0 h-5 text-[9px] border", getRiskColor(prediction.riskScore))}>
          {prediction.riskScore} RISK
        </Badge>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-slate-800 stroke-current"
              strokeWidth="10"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            <circle
              className={cn(
                "stroke-current transition-all duration-1000 ease-out",
                prediction.estimatedCoverage > 80 ? "text-emerald-500" :
                prediction.estimatedCoverage > 50 ? "text-amber-500" : "text-red-500"
              )}
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 * (1 - prediction.estimatedCoverage / 100)}
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              transform="rotate(-90 50 50)"
            ></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-xl font-black text-white">{prediction.estimatedCoverage}%</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-bold text-slate-200">Estimated Test Coverage</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            AI-predicted surface area covered by the proposed test plan.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <FileSearch className="w-3 h-3" />
          Missing Test Scenarios
        </div>
        <div className="grid gap-2">
          {prediction.missingTests.map((area, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <AlertTriangle className={cn(
                "w-3 h-3 mt-0.5 shrink-0",
                prediction.riskScore === 'HIGH' ? "text-red-400" : "text-amber-400"
              )} />
              <span className="text-[11px] text-slate-300 leading-tight">{area}</span>
            </div>
          ))}
          {prediction.missingTests.length === 0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Coverage looks comprehensive.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
