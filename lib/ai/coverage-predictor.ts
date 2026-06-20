import { generateContentWithFailover, extractTextFromGeminiResponse } from './failover';
import { CoveragePrediction, CoveragePredictionSchema, AnalysisResult, TestPlan } from './schemas';

export const predictCoverage = async (analysis: AnalysisResult, testPlan: TestPlan, analysisRunId?: number): Promise<CoveragePrediction> => {
  const prompt = `
You are a senior staff engineer and QA strategist. 
Estimate the testing coverage risk for the following PR changes based on the proposed test plan.

PR ANALYSIS:
Summary: ${analysis.summary}
Affected Modules: ${analysis.affectedModules.join(', ')}
Regression Areas: ${analysis.regressionAreas.join(', ')}
Testing Priorities: ${analysis.testingPriorities.join(', ')}

PROPOSED TEST PLAN:
Strategy: ${testPlan.strategy}
Test Cases:
${testPlan.tests.map(tc => `- [${tc.category}] ${tc.title} (${tc.priority} priority)`).join('\n')}

Your task:
1. Identify "Untested Modules": Which parts of the affected code are NOT covered by the proposed test cases?
2. Identify "High Risk Paths": Which critical user journeys or logic branches remain vulnerable?
3. Identify "Missing Scenarios": What edge cases or integration points were overlooked?

Output a valid JSON object with:
{
  "estimatedCoverage": number (0-100),
  "missingTests": string[] (List of specific areas or scenarios needing more tests),
  "riskScore": "LOW" | "MEDIUM" | "HIGH" (Overall coverage risk)
}

Focus on pragmatism. If the test plan is solid, coverage should be high. If critical regression areas are ignored, coverage should be low and risk high.
`;

  try {
    const result = await generateContentWithFailover([prompt], {
      analysisRunId,
      requestType: 'COVERAGE_PREDICTION'
    });
    const text = extractTextFromGeminiResponse(result);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    const parsed = JSON.parse(jsonStr);
    return CoveragePredictionSchema.parse(parsed);
  } catch (error) {
    console.error("Coverage Prediction Error:", error);
    throw new Error("Failed to predict coverage risk");
  }
};
