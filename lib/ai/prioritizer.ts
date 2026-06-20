import { generateContentWithFailover, extractTextFromGeminiResponse } from './failover';
import { AnalysisResult, TestPlan } from './schemas';
import { z } from 'zod';

export const RankedQueueSchema = z.array(z.object({
  title: z.string(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  reason: z.string(),
}));

export type RankedQueue = z.infer<typeof RankedQueueSchema>;

export const prioritizeTests = async (analysis: AnalysisResult, testPlan: TestPlan, analysisRunId?: number): Promise<RankedQueue> => {
  const prompt = `
You are a senior staff engineer and site reliability expert. 
Rank the following 3 strategic test cases based on their "Production Impact" and critical risk mitigation.

PRODUCTION CONTEXT:
Blast Radius: Frontend: ${analysis.blastRadius.frontend}, Backend: ${analysis.blastRadius.backend}, Database: ${analysis.blastRadius.database}, Infrastructure: ${analysis.blastRadius.infrastructure}
Regression Areas: ${analysis.regressionAreas.join(', ')}
Affected Modules: ${analysis.affectedModules.join(', ')}
Overall Risk Level: ${analysis.riskLevel}

STRATEGIC TESTS TO RANK:
${testPlan.tests.map(tc => `- [${tc.category}] ${tc.title}: ${tc.scenario}. Priority: ${tc.priority}. Reason: ${tc.reason}`).join('\n')}

Ranking Rules:
1. CRITICAL: Tests affecting database integrity, security, or primary revenue-generating flows.
2. HIGH: Tests for core functionality in affected modules or high-probability regression areas.

Output a valid JSON array of objects:
[
  {
    "title": "Exact title of the test case",
    "priority": "CRITICAL" | "HIGH",
    "reason": "Brief deterministic reason for this rank based on production impact"
  }
]

Sort the output by priority (CRITICAL -> HIGH). Return exactly 3 objects.
`;

  try {
    const result = await generateContentWithFailover([prompt], {
      analysisRunId,
      requestType: 'PRIORITIZATION'
    });
    const text = extractTextFromGeminiResponse(result);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    const parsed = JSON.parse(jsonStr);
    return RankedQueueSchema.parse(parsed);
  } catch (error) {
    console.error("Prioritization Error:", error);
    throw new Error("Failed to prioritize tests");
  }
};
