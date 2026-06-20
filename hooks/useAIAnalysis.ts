'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
  const [retryCount, setRetryCount] = useState<number>(0);
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const [deterministicSuccess, setDeterministicSuccess] = useState<boolean>(false);
  const [steps, setSteps] = useState<AIProcessingStep[]>([
    { id: 'fetch', label: 'Checking Analysis Cache', status: 'pending' },
    { id: 'analyze', label: 'AI Code Review', status: 'pending' },
  ]);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentParamsRef = useRef<{ owner: string, repo: string, number: number, sha: string } | null>(null);
  const startTimeRef = useRef<number>(0);
  const POLLING_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async () => {
    if (!currentParamsRef.current) return;
    
    // Check for frontend timeout
    if (Date.now() - startTimeRef.current > POLLING_TIMEOUT_MS) {
      console.warn("[Polling] Hard timeout reached (5m). Stopping.");
      clearPolling();
      setError("Analysis taking longer than expected. Please try again or check back later.");
      setState('failed');
      return;
    }

    const { owner, repo, number, sha } = currentParamsRef.current;

    try {
      const response = await fetch(`/api/analyze/${owner}/${repo}/pull/${number}?sha=${sha}`);
      if (!response.ok) throw new Error('Polling failed');

      const result = await response.json();
      console.log("POLL_RESULT", result.status);
      
      setRetryCount(result.retryCount || 0);
      setCurrentProvider(result.currentProvider);
      if (result.analysis?.ruleFindings?.length > 0) {
        setDeterministicSuccess(true);
      }

      // Stop polling on terminal statuses
      const TERMINAL_STATUSES = ['SUCCESS', 'FAILED', 'CANCELLED'];
      if (TERMINAL_STATUSES.includes(result.status)) {
        clearPolling();
        setAnalysis(result.analysis);
        setState(result.status === 'SUCCESS' ? 'completed' : 'failed');
        setSteps([
          { id: 'fetch', label: 'Data Retrieval', status: 'completed' },
          { id: 'analyze', label: result.status === 'SUCCESS' ? 'AI Analysis Complete' : 'AI Analysis Failed', status: result.status === 'SUCCESS' ? 'completed' : 'failed' },
        ]);
      } else if (result.status !== 'PROCESSING' && result.status !== 'PENDING') {
        // Unknown non-polling status
        clearPolling();
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, [clearPolling, POLLING_TIMEOUT_MS]);

  const startAnalysis = useCallback(async (owner: string, repo: string, number: number, sha?: string, mode: 'standard' | 'ai-only' | 'full' = 'standard') => {
    clearPolling();
    startTimeRef.current = Date.now();
    setState('fetching');
    // If re-analyzing, don't clear current analysis to avoid layout shift
    if (mode === 'standard') {
      setAnalysis(null);
    }
    setIsCached(false);
    setError(null);
    setRetryCount(0);
    setCurrentProvider(null);
    setDeterministicSuccess(false);
    setSteps([
      { id: 'fetch', label: mode === 'ai-only' ? 'Reusing Rule Findings' : 'Checking Analysis Cache', status: 'loading' },
      { id: 'analyze', label: 'AI Code Review', status: 'pending' },
    ]);

    try {
      const response = await fetch(`/api/analyze/${owner}/${repo}/pull/${number}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sha, mode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result.analysis);
      setIsCached(!!result.cached);

      if (result.status === 'PROCESSING') {
        setState('analyzing');
        setSteps([
          { id: 'fetch', label: 'Rule Engine Complete', status: 'completed' },
          { id: 'analyze', label: 'AI Code Review In Progress...', status: 'loading' },
        ]);
        
        // Start polling
        currentParamsRef.current = { owner, repo, number, sha: result.analysis.commitSha || sha || '' };
        pollIntervalRef.current = setInterval(pollStatus, 3000);
      } else {
        setState(result.status === 'SUCCESS' ? 'completed' : result.status === 'FAILED' ? 'failed' : 'completed');
        setSteps([
          { id: 'fetch', label: result.cached ? 'Using Cache' : 'Data Retrieval', status: 'completed' },
          { id: 'analyze', label: 'AI Analysis Complete', status: 'completed' },
        ]);
      }
    } catch (err: any) {
      setError(err.message);
      setState('failed');
      setSteps(prev => prev.map(s => s.status === 'loading' ? { ...s, status: 'failed' } : s));
    }
  }, [clearPolling, pollStatus]);

  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  return {
    state,
    analysis,
    isCached,
    error,
    steps,
    retryCount,
    currentProvider,
    deterministicSuccess,
    startAnalysis,
  };
}

