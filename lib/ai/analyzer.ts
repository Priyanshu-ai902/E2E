import { SYSTEM_PROMPT, getAnalysisPrompt } from './prompts';
import { AnalysisResult, AnalysisResultSchema, AnalysisFinding } from './schemas';
import { fetchPRFiles } from '../github/diffs';
import { fetchFileContent } from '../github/repositories';
import { getSourceFile } from './parser';
import { runRules } from './ruleEngine';
import { calculateScores } from './riskScoring';
import { generateContentWithFailover, extractTextFromGeminiResponse } from './failover';

export const analyzeDiff = async (diff: string, analysisRunId?: number): Promise<Partial<AnalysisResult>> => {
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

  try {
    const result = await generateContentWithFailover(
      [SYSTEM_PROMPT, getAnalysisPrompt(processedDiff)],
      { analysisRunId, requestType: 'ANALYSIS' }
    );

    const text = extractTextFromGeminiResponse(result);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    const parsed = JSON.parse(jsonStr);

    const affectedModules = Array.isArray(parsed.affectedModules) ? parsed.affectedModules : [];
    const regressionAreas = Array.isArray(parsed.regressionAreas) ? parsed.regressionAreas : [];
    const testingPriorities = Array.isArray(parsed.testingPriorities) ? parsed.testingPriorities : [];
    const blastRadius = parsed.blastRadius || { frontend: false, backend: false, database: false, infrastructure: false };

    console.log("Impact Analysis (AI)", {
      affectedModules,
      regressionAreas,
      testingPriorities,
      blastRadius
    });
    
    // Ensure AI response has required arrays even if AI skips them
    return {
      summary: parsed.summary || "No summary available.",
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      importantChanges: Array.isArray(parsed.importantChanges) ? parsed.importantChanges : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      affectedModules,
      regressionAreas,
      testingPriorities,
      riskLevel: ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.riskLevel) ? parsed.riskLevel : 'LOW',
      blastRadius
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};

export const runDeterministicRules = async (
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number,
  headSha: string
): Promise<{ findings: AnalysisFinding[], scores: { security: number, performance: number, architecture: number, overall: number }, filenames: string[] }> => {
  const files = await fetchPRFiles(accessToken, owner, repo, pullNumber);
  
  if (files.length === 0) {
    return { findings: [], scores: { security: 100, performance: 100, architecture: 100, overall: 100 }, filenames: [] };
  }

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

  const scores = calculateScores(allFindings);
  const filenames = files.map(f => f.filename);
  
  return { findings: allFindings, scores, filenames };
};

export const runAIAnalysis = async (
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number,
  headSha: string,
  filenames: string[],
  analysisRunId?: number
): Promise<Partial<AnalysisResult>> => {
  const files = await fetchPRFiles(accessToken, owner, repo, pullNumber);
  const fullDiff = files.map(f => `File: ${f.filename}\n${f.patch}`).join('\n\n');
  
  const aiAnalysis = await analyzeDiff(fullDiff, analysisRunId);
  const normalizedAnalysis = normalizeImpactAnalysis(aiAnalysis, filenames);

  return normalizedAnalysis;
};

// Deprecated: use runDeterministicRules and runAIAnalysis instead
export const analyzePR = async (
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number,
  headSha: string
): Promise<AnalysisResult> => {
  const deterministic = await runDeterministicRules(accessToken, owner, repo, pullNumber, headSha);
  const ai = await runAIAnalysis(accessToken, owner, repo, pullNumber, headSha, deterministic.filenames);
  
  return AnalysisResultSchema.parse({
    ...ai,
    ruleFindings: deterministic.findings,
    metrics: deterministic.scores
  });
};

function normalizeImpactAnalysis(analysis: Partial<AnalysisResult>, filenames: string[]): Partial<AnalysisResult> {
  const inferred = inferImpactFromFiles(filenames);
  
  // Helper to strip markdown and clean strings
  const cleanStr = (s: string) => s.replace(/[\*_~`#]/g, '').trim();

  // Normalize affectedModules: remove "Testing" suffix, map common domains
  let affectedModules = Array.from(new Set(
    (analysis.affectedModules || [])
      .map(m => cleanStr(m).replace(/\s+(API\s+)?Testing$/i, ''))
      .filter(m => m.length > 0)
  ));

  if (affectedModules.length === 0) {
    affectedModules = inferred.affectedModules;
  }

  // Normalize regressionAreas and testingPriorities: remove markdown
  let regressionAreas = Array.from(new Set(
    (analysis.regressionAreas || [])
      .map(cleanStr)
      .filter(s => s.length > 0)
  ));
  if (regressionAreas.length === 0) {
    regressionAreas = inferred.regressionAreas;
  }

  let testingPriorities = Array.from(new Set(
    (analysis.testingPriorities || [])
      .map(cleanStr)
      .filter(s => s.length > 0)
  ));
  if (testingPriorities.length === 0) {
    testingPriorities = inferred.testingPriorities;
  }

  // Normalize blastRadius
  const blastRadius = analysis.blastRadius || { frontend: false, backend: false, database: false, infrastructure: false };
  
  // If AI failed to provide a meaningful blast radius, use inferred one
  if (!blastRadius.frontend && !blastRadius.backend && !blastRadius.database && !blastRadius.infrastructure) {
    Object.assign(blastRadius, inferred.blastRadius);
  }

  return {
    ...analysis,
    affectedModules,
    regressionAreas,
    testingPriorities,
    blastRadius
  };
}

function inferImpactFromFiles(filenames: string[]) {
  const affectedModules = new Set<string>();
  const regressionAreas = new Set<string>();
  const testingPriorities = new Set<string>();
  const blastRadius = {
    frontend: false,
    backend: false,
    database: false,
    infrastructure: false
  };

  const mapping: Record<string, string> = {
    'auth': 'Authentication',
    'jwt': 'Authentication',
    'login': 'Authentication',
    'payment': 'Payments',
    'billing': 'Payments',
    'invoice': 'Payments',
    'admin': 'Admin',
    'moderation': 'Admin',
    'posts': 'Posts',
    'user': 'User Management',
    'users': 'User Management',
    'profile': 'User Management',
    'settings': 'User Management',
    'api': 'API Layer',
    'route': 'API Layer',
    'components/ui': 'UI Library',
    'hooks': 'Shared Hooks',
    'db': 'Database Layer',
    'schema': 'Database Layer',
    'lib': 'Core Logic',
    'app': 'Application Routing'
  };

  filenames.forEach(file => {
    let matched = false;
    for (const [key, domain] of Object.entries(mapping)) {
      if (file.toLowerCase().includes(key)) {
        affectedModules.add(domain);
        matched = true;
      }
    }
    
    if (!matched) {
      const parts = file.split('/');
      if (parts.length > 1 && parts[0] !== 'node_modules') {
        affectedModules.add(parts[0].charAt(0).toUpperCase() + parts[0].slice(1));
      }
    }

    // Infer blast radius with specific rules
    if (file.includes('app/') || file.includes('components/') || file.includes('hooks/')) {
      blastRadius.frontend = true;
    }
    if (file.includes('api/') || file.includes('services/') || file.includes('routes/')) {
      blastRadius.backend = true;
    }
    if (file.includes('migrations/') || file.includes('schema/') || file.includes('drizzle/')) {
      blastRadius.database = true;
    }
    if (file.includes('.github/workflows/') || file.includes('docker/') || file.includes('deployment/')) {
      blastRadius.infrastructure = true;
    }

    // Regression areas
    if (file.includes('api/') || file.includes('route.')) regressionAreas.add('API Stability');
    if (file.includes('db/') || file.includes('schema')) regressionAreas.add('Database Schema Integrity');
    if (file.includes('components/')) regressionAreas.add('UI Component Consistency');
    if (file.includes('auth/')) regressionAreas.add('Security & Session Management');
    
    // Testing priorities
    if (file.includes('auth/')) testingPriorities.add('End-to-end Authentication Flow');
    if (file.includes('payment/')) testingPriorities.add('Payment Processing Edge Cases');
    if (file.includes('db/') || file.includes('schema')) testingPriorities.add('Data Migration Safety');
    if (file.match(/\.(ts|tsx|js|jsx)$/)) testingPriorities.add('Unit tests for business logic');
  });

  // Final fallbacks if still empty after processing all files
  if (affectedModules.size === 0) affectedModules.add('General System');
  if (regressionAreas.size === 0) regressionAreas.add('Existing Functionality');
  if (testingPriorities.size === 0) testingPriorities.add('Core Functionality');

  return {
    affectedModules: Array.from(affectedModules),
    regressionAreas: Array.from(regressionAreas),
    testingPriorities: Array.from(testingPriorities),
    blastRadius
  };
}
