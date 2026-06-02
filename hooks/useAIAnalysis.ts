'use client';

import { useState, useCallback } from 'react';
import { AnalysisResult } from '@/types/github';

export type AIProcessingState = 'idle' | 'fetching' | 'analyzing' | 'completed' | 'failed';

export interface AIProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'failed';
}

export function useAIAnalysis() {
  const [state, setState] = useState<AIProcessingState>('idle');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<AIProcessingStep[]>([
    { id: 'fetch', label: 'Checking Analysis Cache', status: 'pending' },
    { id: 'analyze', label: 'AI Code Review', status: 'pending' },
  ]);

  const startAnalysis = useCallback(async (owner: string, repo: string, number: number, sha?: string) => {
    setState('fetching');
    setAnalysis(null);
    setIsCached(false);
    setError(null);
    setSteps([
      { id: 'fetch', label: 'Checking Analysis Cache', status: 'loading' },
      { id: 'analyze', label: 'AI Code Review', status: 'pending' },
    ]);

    try {
      const response = await fetch(`/api/analyze/${owner}/${repo}/pull/${number}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sha }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const result = await response.json();
      
      setIsCached(!!result.cached);
      
      if (result.cached) {
        setSteps([
          { id: 'fetch', label: 'Using Cached Analysis', status: 'completed' },
          { id: 'analyze', label: 'AI Code Review (Cached)', status: 'completed' },
        ]);
      } else {
        setSteps([
          { id: 'fetch', label: 'Fetching PR Diff', status: 'completed' },
          { id: 'analyze', label: 'AI Code Review', status: 'completed' },
        ]);
      }

      setAnalysis(result.analysis);
      setState('completed');
    } catch (err: any) {
      setError(err.message);
      setState('failed');
      setSteps(prev => prev.map(s => s.status === 'loading' ? { ...s, status: 'failed' } : s));
    }
  }, []);

  return {
    state,
    analysis,
    isCached,
    error,
    steps,
    startAnalysis,
  };
}

