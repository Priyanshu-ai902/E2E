'use client';

import { AIProcessingStep } from '@/types/pr';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface AIActivityTimelineProps {
  steps: AIProcessingStep[];
}

export function AIActivityTimeline({ steps }: AIActivityTimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
        AI Activity Log
      </h3>
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.id} className="relative flex items-start gap-3">
            {idx !== steps.length - 1 && (
              <div 
                className={`absolute left-2.5 top-6 bottom-[-1rem] w-px ${
                  step.status === 'completed' ? 'bg-cyan-500/50' : 'bg-slate-700'
                }`} 
              />
            )}
            
            <div className="relative z-10 mt-1">
              {step.status === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-cyan-400 animate-in zoom-in duration-300" />
              ) : step.status === 'loading' ? (
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              ) : (
                <Circle className="w-5 h-5 text-slate-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium transition-colors duration-300 ${
                step.status === 'completed' ? 'text-slate-200' : 
                step.status === 'loading' ? 'text-purple-300' : 'text-slate-500'
              }`}>
                {step.label}
              </div>
              {step.timestamp && (
                <div className="text-[10px] text-slate-500 mt-0.5 animate-in fade-in duration-500">
                  {step.timestamp}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
