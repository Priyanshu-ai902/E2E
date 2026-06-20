'use client';

import { useState } from 'react';
import { type TestPlan } from '@/lib/ai/schemas';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  ListChecks, 
  Sparkles, 
  Beaker,
  GitPullRequest,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Fingerprint,
  RefreshCcw,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AITestStrategyProps {
  analysisRunId: number | undefined;
  testPlan: TestPlan | null;
}

export function AITestStrategy({ testPlan }: AITestStrategyProps) {
  const [expandedIndices, setExpandedIndices] = useState<Record<string, boolean>>({});

  const toggleExpand = (idx: string) => {
    setExpandedIndices(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!testPlan) return null;

  const tests = testPlan.tests || [];

  const getCategoryIcon = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'SECURITY': 
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'REGRESSION': 
        return <RefreshCcw className="w-3.5 h-3.5 text-amber-400" />;
      case 'BUSINESS_FLOW': 
        return <GitPullRequest className="w-3.5 h-3.5 text-violet-400" />;
      default: 
        return <Beaker className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'SECURITY': 
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'REGRESSION': 
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'BUSINESS_FLOW': 
        return 'bg-violet-500/10 border-violet-500/20 text-violet-400';
      default: 
        return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
    }
  };

  const getCardBorderColor = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'SECURITY': 
        return 'border-l-rose-500/50 hover:shadow-[0_4px_30px_rgba(244,63,94,0.01)]';
      case 'REGRESSION': 
        return 'border-l-amber-500/50 hover:shadow-[0_4px_30px_rgba(245,158,11,0.01)]';
      case 'BUSINESS_FLOW': 
        return 'border-l-violet-500/50 hover:shadow-[0_4px_30px_rgba(139,92,246,0.01)]';
      default: 
        return 'border-l-zinc-500/50';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
      {/* Title Header Block */}
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <span>Strategic Risk Mitigation</span>
        </h2>
        <Badge variant="outline" className="bg-indigo-500/5 text-indigo-400 border-indigo-500/15 text-[10px] tracking-wide font-semibold px-2.5 py-0.5 rounded-full shrink-0">
          <Sparkles className="w-3 h-3 mr-1" />
          3 Core Assessments
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Strategy Approach Box */}
        {testPlan.strategy && (
          <div className="space-y-2.5 bg-zinc-950/40 p-5 rounded-xl border border-white/[0.04]">
            <div className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-2">
              <ListChecks className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              Strategic Review Parameters
            </div>
            <p className="text-zinc-300 leading-relaxed text-sm font-normal">
              {testPlan.strategy}
            </p>
          </div>
        )}

        {/* Test Cards Stack (Horizontal Rows) */}
        <div className="space-y-3.5">
          {tests.map((test, idx) => (
            <div 
              key={idx} 
              className={cn(
                "rounded-xl border border-white/[0.05] border-l-2 bg-zinc-900/15 backdrop-blur-md p-5 transition-all duration-300 hover:border-white/[0.1] relative overflow-hidden group",
                getCardBorderColor(test.category)
              )}
            >
              <Collapsible 
                open={!!expandedIndices[String(idx)]} 
                onOpenChange={() => toggleExpand(String(idx))}
                className="w-full"
              >
                {/* Horizontal row (Header section) */}
                <div 
                  className="flex items-center justify-between gap-4 w-full cursor-pointer select-none" 
                  onClick={() => toggleExpand(String(idx))}
                >
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Badge Row */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md flex items-center gap-1.5 shrink-0", getCategoryColor(test.category))}>
                        {getCategoryIcon(test.category)}
                        {test.category}
                      </Badge>
                      
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-transparent shrink-0",
                        test.priority === 'CRITICAL' 
                          ? "border-red-500/20 text-red-400/90 bg-red-500/[0.02]" 
                          : "border-orange-500/20 text-orange-400/90 bg-orange-500/[0.02]"
                      )}>
                        {test.priority}
                      </Badge>
                    </div>

                    {/* Title & Preview Container */}
                    <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pr-4">
                      <h3 className={cn(
                        "text-sm font-bold text-zinc-100 group-hover:text-indigo-400/90 transition-colors duration-250 leading-snug min-w-0",
                        !expandedIndices[String(idx)] ? "truncate max-w-xs xl:max-w-sm shrink-0" : "flex-1 break-words"
                      )}>
                        {test.title}
                      </h3>
                      {!expandedIndices[String(idx)] && (
                        <p className="hidden md:block text-[11px] text-zinc-500 truncate max-w-md lg:max-w-lg xl:max-w-xl font-normal leading-relaxed flex-1">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mr-1.5">Risk</span>
                          {test.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors bg-white/[0.02] border border-white/[0.06] rounded-md px-2.5 py-1.5 shrink-0 focus:outline-hidden cursor-pointer select-none">
                      <span className="hidden sm:inline font-bold uppercase tracking-wider">{expandedIndices[String(idx)] ? 'Hide Details' : 'Show Details'}</span>
                      {expandedIndices[String(idx)] ? (
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                </div>

                {/* Collapsible Content */}
                <CollapsibleContent className="space-y-4 pt-4 border-t border-white/[0.04] mt-4 transition-all duration-300">
                  {/* Full Risk Description */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Risk Mechanics Assessment</span>
                    <p className="text-[12px] text-zinc-300 leading-relaxed font-normal">
                      {test.reason}
                    </p>
                  </div>

                  {/* Scenario Spec & Expected Outcome columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        Test Scenario Spec
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed bg-[#0c0c0f]/45 p-3.5 rounded-lg border border-white/[0.04]">
                        {test.scenario}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Expected Mitigation
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed bg-emerald-500/[0.01] p-3.5 rounded-lg border border-emerald-500/10">
                        {test.expectedResult}
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
