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
  id: z.number().optional(),
  repoOwner: z.string().optional(),
  repoName: z.string().optional(),
  prNumber: z.number().optional(),
  commitSha: z.string().optional(),
  summary: z.string().default("No summary available.").describe("A concise summary of what this PR achieves."),
  risks: z.array(z.string()).default([]).describe("List of potential risks, bugs, or edge cases."),
  importantChanges: z.array(z.string()).default([]).describe("Key architectural or logic changes."),
  recommendations: z.array(z.string()).default([]).describe("Actionable suggestions for improvement."),
  affectedModules: z.array(z.string()).min(1, "Affected modules cannot be empty").describe("List of business domains or modules affected by these changes."),
  regressionAreas: z.array(z.string()).min(1, "Regression areas cannot be empty").describe("Areas of the application that should be double-checked for regressions."),
  testingPriorities: z.array(z.string()).min(1, "Testing priorities cannot be empty").describe("Specific components or flows that require rigorous testing."),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('LOW'),
  blastRadius: z.object({
    frontend: z.boolean().default(false),
    backend: z.boolean().default(false),
    database: z.boolean().default(false),
    infrastructure: z.boolean().default(false),
  }).default({
    frontend: false,
    backend: false,
    database: false,
    infrastructure: false,
  }),
  ruleFindings: z.array(AnalysisFindingSchema).default([]),
  metrics: RiskScoresSchema.default({
    security: 100,
    performance: 100,
    architecture: 100,
    overall: 100
  }),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const TestCaseSchema = z.object({
  title: z.string(),
  category: z.enum(['SECURITY', 'REGRESSION', 'BUSINESS_FLOW']),
  priority: z.enum(['CRITICAL', 'HIGH']),
  reason: z.string().describe("Why this test was selected as a top risk."),
  scenario: z.string().describe("Comprehensive test scenario covering multiple edge cases."),
  expectedResult: z.string(),
  affectedFiles: z.array(z.string()),
});

export const TestPlanSchema = z.object({
  strategy: z.string(),
  tests: z.array(TestCaseSchema).length(3),
}).refine(data => {
  const categories = data.tests.map(t => t.category);
  const uniqueCategories = new Set(categories);
  return (
    uniqueCategories.has('SECURITY') &&
    uniqueCategories.has('REGRESSION') &&
    uniqueCategories.has('BUSINESS_FLOW') &&
    uniqueCategories.size === 3
  );
}, {
  message: "Test Plan must contain exactly one SECURITY, one REGRESSION, and one BUSINESS_FLOW test case."
});

export type TestCase = z.infer<typeof TestCaseSchema>;
export type TestPlan = z.infer<typeof TestPlanSchema>;

export const PlaywrightTestSchema = z.object({
  title: z.string(),
  category: z.enum(['SECURITY', 'REGRESSION', 'BUSINESS_FLOW']),
  code: z.string(),
});

export const PlaywrightTestResultSchema = z.object({
  tests: z.array(PlaywrightTestSchema).min(3),
}).refine(data => {
  const categories = data.tests.map(t => t.category);
  const uniqueCategories = new Set(categories);
  return (
    uniqueCategories.has('SECURITY') &&
    uniqueCategories.has('REGRESSION') &&
    uniqueCategories.has('BUSINESS_FLOW') &&
    uniqueCategories.size === 3
  );
}, {
  message: "Playwright test generation must contain exactly one SECURITY, one REGRESSION, and one BUSINESS_FLOW test."
});

export type PlaywrightTest = z.infer<typeof PlaywrightTestSchema>;
export type PlaywrightTestResult = z.infer<typeof PlaywrightTestResultSchema>;

export const CoveragePredictionSchema = z.object({
  estimatedCoverage: z.number().min(0).max(100),
  missingTests: z.array(z.string()),
  riskScore: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export type CoveragePrediction = z.infer<typeof CoveragePredictionSchema>;
