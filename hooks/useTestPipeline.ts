'use client';

import { useState, useEffect, useRef } from 'react';
import { type TestPlan, type CoveragePrediction, type PlaywrightTest } from '@/lib/ai/schemas';
import { type RankedQueue } from '@/lib/ai/prioritizer';

interface PipelineLoading {
  strategy: boolean;
  coverage: boolean;
  prioritize: boolean;
  playwright: boolean;
}

const idleLoading: PipelineLoading = {
  strategy: false,
  coverage: false,
  prioritize: false,
  playwright: false,
};

export function useTestPipeline(analysisRunId: number | undefined, enabled: boolean) {
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [prediction, setPrediction] = useState<CoveragePrediction | null>(null);
  const [queue, setQueue] = useState<RankedQueue>([]);
  const [playwrightTests, setPlaywrightTests] = useState<PlaywrightTest[]>([]);
  const [loading, setLoading] = useState<PipelineLoading>(idleLoading);
  const [error, setError] = useState<string | null>(null);
  const runningRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analysisRunId || !enabled) {
      setTestPlan(null);
      setPrediction(null);
      setQueue([]);
      setPlaywrightTests([]);
      setLoading(idleLoading);
      setError(null);
      runningRef.current = null;
      return;
    }

    if (runningRef.current === analysisRunId) return;
    runningRef.current = analysisRunId;

    let cancelled = false;

    async function runPipeline() {
      setError(null);
      setTestPlan(null);
      setPrediction(null);
      setQueue([]);
      setPlaywrightTests([]);

      try {
        setLoading({ strategy: true, coverage: false, prioritize: false, playwright: false });
        const genRes = await fetch('/api/tests/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisRunId }),
        });
        if (!genRes.ok) throw new Error('Test strategy generation failed');
        const genData = await genRes.json();
        if (cancelled) return;
        setTestPlan(genData.testPlan);
        setLoading({ strategy: false, coverage: true, prioritize: true, playwright: false });

        const [covRes, priRes] = await Promise.all([
          fetch('/api/tests/coverage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ analysisRunId }),
          }),
          fetch('/api/tests/prioritize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ analysisRunId }),
          }),
        ]);

        if (covRes.ok) {
          const covData = await covRes.json();
          if (!cancelled) setPrediction(covData.prediction);
        }
        if (priRes.ok) {
          const priData = await priRes.json();
          if (!cancelled) setQueue(priData.rankedQueue || []);
        }

        if (cancelled) return;
        setLoading({ strategy: false, coverage: false, prioritize: false, playwright: true });

        const pwRes = await fetch('/api/tests/playwright', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisRunId }),
        });
        if (pwRes.ok) {
          const pwData = await pwRes.json();
          if (!cancelled) {
            setPlaywrightTests(Array.isArray(pwData.tests) ? pwData.tests : []);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Test pipeline failed');
        }
      } finally {
        if (!cancelled) setLoading(idleLoading);
      }
    }

    runPipeline();
    return () => {
      cancelled = true;
    };
  }, [analysisRunId, enabled]);

  const isLoading = loading.strategy || loading.coverage || loading.prioritize || loading.playwright;

  return { testPlan, prediction, queue, playwrightTests, loading, isLoading, error };
}
