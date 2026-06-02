import { getGeminiModel } from './gemini';
import { SYSTEM_PROMPT, getAnalysisPrompt } from './prompts';
import { AnalysisResult, AnalysisResultSchema, AnalysisFinding } from './schemas';
import { fetchPRFiles } from '../github/diffs';
import { fetchFileContent } from '../github/repositories';
import { getSourceFile } from './parser';
import { runRules } from './ruleEngine';
import { calculateScores } from './riskScoring';

export const analyzeDiff = async (diff: string): Promise<Partial<AnalysisResult>> => {
  if (!diff || diff.trim() === '') {
    return {
      summary: "No changes detected or all changes were filtered out (e.g., lock files).",
      risks: [],
      importantChanges: [],
      recommendations: ["Ensure the PR contains relevant code changes for analysis."]
    };
  }

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
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    const parsed = JSON.parse(jsonStr);
    
    // Ensure AI response has required arrays even if AI skips them
    return {
      summary: parsed.summary || "No summary available.",
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      importantChanges: Array.isArray(parsed.importantChanges) ? parsed.importantChanges : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "AI analysis failed, but deterministic rules were applied.",
      risks: ["AI analysis failed to generate content."],
      importantChanges: [],
      recommendations: ["Check logs for AI analysis failure."]
    };
  }
};

export const analyzePR = async (
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number,
  headSha: string
): Promise<AnalysisResult> => {
  // 1. Fetch PR files
  const files = await fetchPRFiles(accessToken, owner, repo, pullNumber);
  
  if (files.length === 0) {
    return AnalysisResultSchema.parse({
      summary: "No changes detected or all changes were filtered out.",
      risks: [],
      importantChanges: [],
      recommendations: [],
      ruleFindings: [],
      metrics: { security: 100, performance: 100, architecture: 100, overall: 100 }
    });
  }

  // 2. Run deterministic rules on each file
  const allFindings: AnalysisFinding[] = [];
  
  const sourceFiles = files.filter(f => 
    f.filename.endsWith('.ts') || 
    f.filename.endsWith('.tsx') || 
    f.filename.endsWith('.js') || 
    f.filename.endsWith('.jsx')
  ).slice(0, 15);
  
  for (const file of sourceFiles) {
    const content = await fetchFileContent(accessToken, owner, repo, file.filename, headSha);
    if (content) {
      const sourceFile = getSourceFile(file.filename, content);
      const findings = runRules(sourceFile);
      allFindings.push(...findings);
    }
  }

  // 3. Calculate metrics
  const scores = calculateScores(allFindings);

  // 4. Get Gemini analysis for summary and recommendations
  const fullDiff = files.map(f => `File: ${f.filename}\n${f.patch}`).join('\n\n');
  
  const aiAnalysis = await analyzeDiff(fullDiff);
  
  // Combine results
  return AnalysisResultSchema.parse({
    ...aiAnalysis,
    ruleFindings: allFindings,
    metrics: scores
  });
};
