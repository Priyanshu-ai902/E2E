'use client';

import { useState, useEffect } from 'react';
import { type RankedQueue } from '@/lib/ai/prioritizer';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  ChevronRight, 
  ShieldAlert, 
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestPrioritizationQueueProps {
  analysisRunId: number | undefined;
  queue: RankedQueue;
  loading?: boolean;
}

export function TestPrioritizationQueue({ analysisRunId, queue, loading }: TestPrioritizationQueueProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-700">
        <Skeleton className="h-6 w-48 bg-slate-800" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (queue.length === 0) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          Ranked Testing Queue
        </h2>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
          <Clock className="w-3 h-3" />
          Optimized by Impact
        </div>
      </div>

      <div className="grid gap-3">
        {queue.map((item, idx) => (
          <div 
            key={idx} 
            className="kryon-card rounded-lg border border-white/5 overflow-hidden group hover:border-white/10 transition-all flex items-center"
          >
            <div className={cn(
              "w-1.5 self-stretch",
              item.priority === 'CRITICAL' ? "bg-red-500" :
              item.priority === 'HIGH' ? "bg-orange-500" :
              item.priority === 'MEDIUM' ? "bg-amber-500" : "bg-blue-500"
            )} />
            
            <div className="p-4 flex-1 flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-200 truncate">{item.title}</span>
                  <Badge className={cn(
                    "text-[9px] px-1.5 py-0 h-4 border-none",
                    item.priority === 'CRITICAL' ? "bg-red-500/20 text-red-400" :
                    item.priority === 'HIGH' ? "bg-orange-500/20 text-orange-400" :
                    item.priority === 'MEDIUM' ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                  )}>
                    {item.priority}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {item.reason}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/5 text-slate-500 group-hover:text-slate-300 group-hover:border-white/10 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
