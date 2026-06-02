import { z } from 'zod';

export const AnalysisFindingSchema = z.object({
  category: z.enum(['security', 'performance', 'architecture']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  confidence: z.number().min(0).max(100).default(100),
  title: z.string().default("Issue detected"),
  description: z.string().default("No description provided."),
  file: z.string().optional().nullable(),
  line: z.number().optional().nullable(),
});

export type AnalysisFinding = z.infer<typeof AnalysisFindingSchema>;

export const RiskScoresSchema = z.object({
  security: z.number().min(0).max(100).default(100),
  performance: z.number().min(0).max(100).default(100),
  architecture: z.number().min(0).max(100).default(100),
  overall: z.number().min(0).max(100).default(100),
});

export type RiskScores = z.infer<typeof RiskScoresSchema>;

export const AnalysisResultSchema = z.object({
  summary: z.string().default("No summary available.").describe("A concise summary of what this PR achieves."),
  risks: z.array(z.string()).default([]).describe("List of potential risks, bugs, or edge cases."),
  importantChanges: z.array(z.string()).default([]).describe("Key architectural or logic changes."),
  recommendations: z.array(z.string()).default([]).describe("Actionable suggestions for improvement."),
  ruleFindings: z.array(AnalysisFindingSchema).default([]),
  metrics: RiskScoresSchema.default({
    security: 100,
    performance: 100,
    architecture: 100,
    overall: 100
  }),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
