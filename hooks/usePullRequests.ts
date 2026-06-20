'use client';

import { useState, useEffect } from 'react';
import { GitHubPR } from '@/types/github';

export function usePullRequests(owner?: string, repo?: string) {
  const [pulls, setPulls] = useState<GitHubPR[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner || !repo) return;

    async function fetchPulls() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/github/repos/${owner}/${repo}/pulls`);
        if (!response.ok) {
          throw new Error('Failed to fetch pull requests');
        }
        const data = await response.json();
        console.log(`[HOOK] API response:`, data);
        console.log(`[HOOK] prs.length: ${data.length}`);
        setPulls(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPulls();
  }, [owner, repo]);

  return { pulls, loading, error };
}
