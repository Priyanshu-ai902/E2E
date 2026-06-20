'use client';

import { cn } from '@/lib/utils';

interface RiskScoreRingProps {
  label: string;
  score: number;
  size?: 'sm' | 'md';
  className?: string;
}

function scoreColor(score: number) {
  if (score >= 80) return { stroke: '#22d3ee', text: 'text-cyan-400' };
  if (score >= 60) return { stroke: '#f59e0b', text: 'text-amber-400' };
  return { stroke: '#ef4444', text: 'text-red-400' };
}

export function RiskScoreRing({ label, score, size = 'md', className }: RiskScoreRingProps) {
  const dim = size === 'sm' ? 56 : 72;
  const r = size === 'sm' ? 22 : 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const colors = scoreColor(score);

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${dim} ${dim}`}>
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={size === 'sm' ? 4 : 5}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={size === 'sm' ? 4 : 5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-semibold text-white', size === 'sm' ? 'text-sm' : 'text-lg')}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider text-center leading-tight">
        {label}
      </span>
    </div>
  );
}
