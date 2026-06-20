import { generateContentWithFailover, extractTextFromGeminiResponse } from './failover';
import { PlaywrightTest, PlaywrightTestResult, PlaywrightTestResultSchema, TestPlan } from './schemas';

export const generatePlaywrightTests = async (testPlan: TestPlan, analysisRunId?: number): Promise<PlaywrightTestResult> => {
  const strategicTests = testPlan.tests;

  if (strategicTests.length === 0) {
    return { tests: [] };
  }

  console.log(`[PLAYWRIGHT] Start generation for run ${analysisRunId}. Input strategic tests: ${strategicTests.length}`);

  const generatedTestsMap = new Map<'SECURITY' | 'REGRESSION' | 'BUSINESS_FLOW', PlaywrightTest>();

  const prompt = `
You are a senior SDET and expert in Playwright automation. 
Convert the following 3 strategic test scenarios into executable Playwright TypeScript code.

STRATEGIC TESTS:
${strategicTests.map(tc => `- [${tc.category}] ${tc.title}: ${tc.scenario}. Expected: ${tc.expectedResult}`).join('\n')}

Requirements for the generated code:
1. Use Playwright TypeScript syntax.
2. Use modern page locators (e.g., page.getByRole, page.getByText, page.getByLabel).
3. Include clear assertions (e.g., expect(page.getByText('...')).toBeVisible()).
4. DO NOT use placeholders like "INSERT_SELECTOR_HERE". Infer realistic selectors or use broad role-based locators.
5. Each test should be a complete, standalone code block that can be placed in a .spec.ts file.
6. The output MUST be a valid JSON object matching this structure:
{
  "tests": [
    {
      "title": "Clear, descriptive test title",
      "category": "SECURITY" | "REGRESSION" | "BUSINESS_FLOW",
      "code": "import { test, expect } from '@playwright/test';\\n\\ntest('...', async ({ page }) => { ... });"
    }
  ]
}

Generate EXACTLY 3 tests corresponding to the strategic categories provided (SECURITY, REGRESSION, BUSINESS_FLOW). Focus on reliability, readability, and industry-standard Playwright patterns.
`;

  try {
    const result = await generateContentWithFailover([prompt], {
      analysisRunId,
      requestType: 'PLAYWRIGHT_GEN'
    });
    const text = extractTextFromGeminiResponse(result);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    const parsed = JSON.parse(jsonStr);
    
    if (parsed && Array.isArray(parsed.tests)) {
      parsed.tests.forEach((t: any) => {
        if (t && typeof t.title === 'string' && typeof t.code === 'string' && ['SECURITY', 'REGRESSION', 'BUSINESS_FLOW'].includes(t.category)) {
          generatedTestsMap.set(t.category, {
            title: t.title,
            category: t.category as 'SECURITY' | 'REGRESSION' | 'BUSINESS_FLOW',
            code: t.code
          });
        }
      });
    }
  } catch (error: any) {
    console.warn(`[PLAYWRIGHT] [FAILOVER] Batch Playwright generation failed: ${error.message}. Initiating category recovery...`);
  }

  const requiredCategories: ('SECURITY' | 'REGRESSION' | 'BUSINESS_FLOW')[] = ['SECURITY', 'REGRESSION', 'BUSINESS_FLOW'];
  const missingCategories = requiredCategories.filter(cat => !generatedTestsMap.has(cat));

  if (missingCategories.length > 0) {
    console.log(`[PLAYWRIGHT] Missing categories: ${missingCategories.join(', ')}. Triggering recovery logic for missing categories...`);

    for (const cat of missingCategories) {
      const tc = strategicTests.find(t => t.category === cat);
      if (!tc) continue;

      const singlePrompt = `
You are a senior SDET and expert in Playwright automation.
Convert this specific strategic test scenario of category "${cat}" into executable Playwright TypeScript code.

STRATEGIC TEST TO CONVERT:
Title: ${tc.title}
Category: ${tc.category}
Scenario: ${tc.scenario}
Expected Result: ${tc.expectedResult}

Requirements:
1. Use Playwright TypeScript syntax.
2. Use modern page locators.
3. Include clear assertions.
4. DO NOT use placeholders like "INSERT_SELECTOR_HERE".
5. Output MUST be a valid JSON object matching this structure:
{
  "title": "Clear, descriptive test title",
  "category": "${cat}",
  "code": "import { test, expect } from '@playwright/test';\\n\\ntest('...', async ({ page }) => { ... });"
}
`;

      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[PLAYWRIGHT] Attempting recovery for category ${cat} (Attempt ${attempt}/2)`);
          const result = await generateContentWithFailover([singlePrompt], {
            analysisRunId,
            requestType: `PLAYWRIGHT_RECOVERY_${cat}_ATTEMPT_${attempt}`
          });
          const text = extractTextFromGeminiResponse(result);
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : text;
          const parsed = JSON.parse(jsonStr);

          if (parsed && typeof parsed.title === 'string' && typeof parsed.code === 'string') {
            generatedTestsMap.set(cat, {
              title: parsed.title,
              category: cat,
              code: parsed.code
            });
            success = true;
            console.log(`[PLAYWRIGHT] Successfully recovered category: ${cat}`);
            break;
          }
        } catch (recoveryError: any) {
          console.error(`[PLAYWRIGHT] [FAILOVER] Recovery attempt ${attempt} for category ${cat} failed: ${recoveryError.message}`);
        }
      }
    }
  }

  const finalTests = Array.from(generatedTestsMap.values());
  const finalResult = { tests: finalTests };

  try {
    const validated = PlaywrightTestResultSchema.parse(finalResult);
    console.log(`[PLAYWRIGHT] Success for run ${analysisRunId}`);
    return validated;
  } catch (error: any) {
    console.error(`[PLAYWRIGHT] Failure for run ${analysisRunId} under final validation: ${error.message}`);
    throw error;
  }
};
