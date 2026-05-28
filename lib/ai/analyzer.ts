import { getGeminiModel } from './gemini';
import { SYSTEM_PROMPT, getAnalysisPrompt } from './prompts';
import { AnalysisResult, AnalysisResultSchema } from './schemas';

export const analyzeDiff = async (diff: string): Promise<AnalysisResult> => {
  if (!diff || diff.trim() === '') {
    return {
      summary: "No changes detected or all changes were filtered out (e.g., lock files).",
      risks: [],
      importantChanges: [],
      recommendations: ["Ensure the PR contains relevant code changes for analysis."]
    };
  }

  // Safe truncation for extremely large diffs (Gemini has high limits, but let's be safe)
  // Approx 30k characters is usually enough for deep context without hitting limits
  const MAX_DIFF_LENGTH = 30000;
  const processedDiff = diff.length > MAX_DIFF_LENGTH 
    ? diff.substring(0, MAX_DIFF_LENGTH) + "\n\n...[Diff truncated due to size]..." 
    : diff;

  const model = getGeminiModel();
  
  try {
    const result = await model.generateContent([
      SYSTEM_PROMPT,
      getAnalysisPrompt(processedDiff)
    ]);

    const response = result.response;
    const text = response.text();
    
    // Extract JSON from the response (in case there's markdown wrap)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate with Zod
    return AnalysisResultSchema.parse(parsed);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze PR diff with AI.");
  }
};
