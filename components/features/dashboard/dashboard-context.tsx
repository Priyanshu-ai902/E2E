'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { type GitHubRepo, type GitHubPR } from '@/types/github';

export type DashboardView = 'dashboard' | 'repositories' | 'history' | 'settings';

export interface AnalysisHistoryEntry {
  id: number;
  repoOwner: string;
  repoName: string;
  prNumber: number;
  prTitle: string;
  riskLevel: string;
  overallScore: number;
  analyzedAt: string;
  findings?: {
    category: string;
    severity: string;
    title: string;
    description: string;
    file?: string;
  }[];
}

interface DashboardContextValue {
  view: DashboardView;
  setView: (view: DashboardView) => void;
  selectedRepo: GitHubRepo | null;
  setSelectedRepo: (repo: GitHubRepo | null) => void;
  selectedPR: GitHubPR | null;
  setSelectedPR: (pr: GitHubPR | null) => void;
  analysisHistory: AnalysisHistoryEntry[];
  addToHistory: (entry: AnalysisHistoryEntry) => void;
  openAnalysis: (repo: GitHubRepo, pr: GitHubPR) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<DashboardView>('dashboard');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedPR, setSelectedPR] = useState<GitHubPR | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kryon-analysis-history');
      if (stored) setAnalysisHistory(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  const addToHistory = useCallback((entry: AnalysisHistoryEntry) => {
    setAnalysisHistory((prev) => {
      const filtered = prev.filter(
        (h) => !(h.repoOwner === entry.repoOwner && h.repoName === entry.repoName && h.prNumber === entry.prNumber)
      );
      const next = [entry, ...filtered].slice(0, 20);
      localStorage.setItem('kryon-analysis-history', JSON.stringify(next));
      return next;
    });
  }, []);

  const openAnalysis = useCallback((repo: GitHubRepo, pr: GitHubPR) => {
    setSelectedRepo(repo);
    setSelectedPR(pr);
    setView('repositories');
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        view,
        setView,
        selectedRepo,
        setSelectedRepo,
        selectedPR,
        setSelectedPR,
        analysisHistory,
        addToHistory,
        openAnalysis,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
