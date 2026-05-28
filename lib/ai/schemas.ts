import { z } from 'zod';

export const AnalysisResultSchema = z.object({
  summary: z.string().describe("A concise summary of what this PR achieves."),
  risks: z.array(z.string()).describe("List of potential risks, bugs, or edge cases."),
  importantChanges: z.array(z.string()).describe("Key architectural or logic changes."),
  recommendations: z.array(z.string()).describe("Actionable suggestions for improvement."),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
