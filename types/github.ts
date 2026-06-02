import { z } from 'zod';
import { AnalysisResult } from '@/lib/ai/schemas';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  private: boolean;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  user: {
    login: string;
    avatar_url: string;
  };
  state: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  diff_url: string;
  head: {
    sha: string;
    ref: string;
  };
}

export interface PRFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

// Re-export AnalysisResult for backwards compatibility
export type { AnalysisResult };

