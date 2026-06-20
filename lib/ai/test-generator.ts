import { generateContentWithFailover, extractTextFromGeminiResponse } from './failover';
import { TestPlan, TestPlanSchema, AnalysisResult } from './schemas';

export const generateTestPlan = async (analysis: AnalysisResult, files: string[], analysisRunId?: number): Promise<TestPlan> => {
  const basePrompt = `
You are a senior QA architect and staff engineer. 
Your goal is to generate a high-value Test Strategy and exactly 3 strategic tests that mitigate the highest risks in this PR.

PR ANALYSIS:
Summary: ${analysis.summary}
Risks: ${analysis.risks.join(', ')}
Important Changes: ${analysis.importantChanges.join(', ')}
Affected Modules: ${analysis.affectedModules.join(', ')}
Regression Areas: ${analysis.regressionAreas.join(', ')}
Testing Priorities: ${analysis.testingPriorities.join(', ')}
Blast Radius: Frontend: ${analysis.blastRadius.frontend}, Backend: ${analysis.blastRadius.backend}, Database: ${analysis.blastRadius.database}, Infrastructure: ${analysis.blastRadius.infrastructure}

CHANGED FILES:
${files.join('\n')}

INSTRUCTIONS:
Generate exactly 3 tests, one for each of these categories:
1. SECURITY: Focus on the highest security risk (e.g., data leak, unauthorized access, injection).
2. REGRESSION: Focus on the highest regression risk in the most critical affected module.
3. BUSINESS_FLOW: Focus on the most critical user journey or business flow impacted by these changes.

Each test should be COMPREHENSIVE, covering multiple related edge cases and scenarios rather than being a single narrow check.

Your response MUST be in valid JSON format matching this exact structure:
{
  "strategy": "A high-level strategy explaining how these 3 tests provide maximum coverage for the highest risks.",
  "tests": [
    {
      "title": "Clear, descriptive title",
      "category": "SECURITY" | "REGRESSION" | "BUSINESS_FLOW",
      "priority": "CRITICAL" | "HIGH",
      "reason": "Explain why this specific risk was selected for strategic testing.",
      "scenario": "A comprehensive test scenario description covering multiple edge cases.",
      "expectedResult": "Detailed expected outcome including state changes or UI feedback.",
      "affectedFiles": ["List of changed files that this test specifically validates"]
    }
  ]
}

Strictly return EXACTLY 3 tests in the "tests" array, with exactly one test in each category (SECURITY, REGRESSION, BUSINESS_FLOW). No duplicates.
`;

  let lastError: any = null;
  const maxValidationRetries = 2;

  console.log(`[STRATEGY] Start generation for run ${analysisRunId}`);

  for (let attempt = 0; attempt <= maxValidationRetries; attempt++) {
    try {
      let prompt = basePrompt;
      if (attempt > 0) {
        console.warn(`[STRATEGY] [FAILOVER] Retrying test plan generation due to previous validation/parsing failure (Attempt ${attempt}/${maxValidationRetries})`);
        prompt += `\n\nCRITICAL ERROR IN PREVIOUS ATTEMPT:\n${lastError?.message || "Invalid schema formatting or wrong category distribution."}\nEnsure you strictly output valid JSON containing exactly 3 tests, with exactly one test for category SECURITY, one for REGRESSION, and one for BUSINESS_FLOW.`;
      }

      const result = await generateContentWithFailover([prompt], { 
        analysisRunId, 
        requestType: `TEST_PLAN_ATTEMPT_${attempt}`
      });
      const text = extractTextFromGeminiResponse(result);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      
      const parsed = JSON.parse(jsonStr);
      const validatedPlan = TestPlanSchema.parse(parsed);

      console.log(`[STRATEGY] Success for run ${analysisRunId} (Attempt ${attempt + 1})`);
      return validatedPlan;

    } catch (error: any) {
      console.warn(`[STRATEGY] [FAILOVER] Attempt ${attempt} failed validation/parsing: ${error.message}`);
      lastError = error;
    }
  }

  console.error(`[STRATEGY] Failure for run ${analysisRunId}: All validation attempts failed. Last error: ${lastError?.message}`);
  throw lastError || new Error("Failed to generate valid test plan after retries");
};
