export type PRStatus = 'Open' | 'Merged' | 'Draft';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export type AIProcessingState = 'idle' | 'analyzing' | 'generating' | 'completed' | 'failed';

export interface AIProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'failed';
  timestamp?: string;
}

export interface JestTest {
  name: string;
  code: string;
}

export interface PRAnalysis {
  id: string;
  title: string;
  author: string;
  status: PRStatus;
  createdAt: string;
  codeReviewIssues: string[];
  jestTests: JestTest[];
  testPlan: string[];
  riskLevel: RiskLevel;
  explanation: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}
