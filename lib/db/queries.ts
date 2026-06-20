import { db } from './index';
import { 
  prAnalyses, 
  analysisRuns, 
  analysisFindings, 
  ruleFindings,
  aiAnalysis,
  generatedTestPlans, 
  generatedPlaywrightTests, 
  coveragePredictions, 
  testPrioritizations, 
  type NewPRAnalysis, 
  type NewAnalysisRun, 
  type NewAnalysisFinding, 
  type NewRuleFinding,
  type NewAIAnalysis,
  type NewGeneratedTestPlan, 
  type NewGeneratedPlaywrightTest, 
  type NewCoveragePrediction, 
  type NewTestPrioritization 
} from './schema';
import { and, eq } from 'drizzle-orm';

export async function deleteAISections(analysisRunId: number) {
  console.log(`[DATABASE] Start deleting AI sections for run ${analysisRunId}`);
  try {
    await db.delete(generatedPlaywrightTests).where(eq(generatedPlaywrightTests.analysisRunId, analysisRunId));
    await db.delete(generatedTestPlans).where(eq(generatedTestPlans.analysisRunId, analysisRunId));
    await db.delete(coveragePredictions).where(eq(coveragePredictions.analysisRunId, analysisRunId));
    await db.delete(testPrioritizations).where(eq(testPrioritizations.analysisRunId, analysisRunId));
    await db.delete(aiAnalysis).where(eq(aiAnalysis.analysisRunId, analysisRunId));
    console.log(`[DATABASE] Success deleting AI sections for run ${analysisRunId}`);
  } catch (error: any) {
    console.error(`[DATABASE] Failure deleting AI sections for run ${analysisRunId}: ${error.message}`);
    throw error;
  }
}

export async function getLatestAnalysisRun(owner: string, repo: string, number: number) {
  const run = await db.query.analysisRuns.findFirst({
    where: and(
      eq(analysisRuns.repoOwner, owner),
      eq(analysisRuns.repoName, repo),
      eq(analysisRuns.prNumber, number)
    ),
    orderBy: (runs, { desc }) => [desc(runs.createdAt)],
    with: {
      findings: true,
      ruleFindings: true,
      aiAnalysis: true,
      testPlans: true,
      playwrightTests: true,
      coveragePredictions: true,
      prioritizations: true
    }
  });
  return run;
}

export async function getAnalysisByPR(owner: string, repo: string, number: number, commitSha: string) {
  const result = await db.query.prAnalyses.findFirst({
    where: and(
      eq(prAnalyses.repoOwner, owner),
      eq(prAnalyses.repoName, repo),
      eq(prAnalyses.prNumber, number),
      eq(prAnalyses.commitSha, commitSha)
    ),
  });
  return result;
}

export async function saveAnalysis(data: NewPRAnalysis) {
  const result = await db.insert(prAnalyses).values(data).returning();
  return result[0];
}

export async function updateAnalysis(id: number, data: Partial<NewPRAnalysis>) {
  const result = await db.update(prAnalyses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(prAnalyses.id, id))
    .returning();
  return result[0];
}

export async function saveAnalysisRun(run: NewAnalysisRun) {
  const [savedRun] = await db.insert(analysisRuns).values(run).returning();
  return savedRun;
}

export async function updateAnalysisStatus(
  id: number, 
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED', 
  scores?: { security: number, performance: number, architecture: number, overall: number }
) {
  const updateData: any = { status };
  
  if (status === 'PROCESSING') {
    updateData.startedAt = new Date();
  } else if (status === 'SUCCESS' || status === 'FAILED') {
    updateData.completedAt = new Date();
  }

  if (scores) {
    updateData.securityScore = scores.security;
    updateData.performanceScore = scores.performance;
    updateData.architectureScore = scores.architecture;
    updateData.overallScore = scores.overall;
  }
  const [updated] = await db.update(analysisRuns)
    .set(updateData)
    .where(eq(analysisRuns.id, id))
    .returning();
  return updated;
}

export async function updateRetryInfo(id: number, count: number, error: string | null) {
  const [updated] = await db.update(analysisRuns)
    .set({
      retryCount: count,
      lastError: error,
      lastAttemptAt: new Date(),
    })
    .where(eq(analysisRuns.id, id))
    .returning();
  return updated;
}

export async function saveRuleFindings(findings: NewRuleFinding[]) {
  if (findings.length === 0) return [];
  return await db.insert(ruleFindings).values(findings).returning();
}

export async function saveAIAnalysis(data: NewAIAnalysis) {
  console.log(`[DATABASE] Saving AI analysis for run ${data.analysisRunId}`);
  try {
    const result = await db.insert(aiAnalysis)
      .values(data)
      .onConflictDoUpdate({
        target: aiAnalysis.analysisRunId,
        set: {
          summary: data.summary,
          risks: data.risks,
          importantChanges: data.importantChanges,
          recommendations: data.recommendations,
          affectedModules: data.affectedModules,
          regressionAreas: data.regressionAreas,
          testingPriorities: data.testingPriorities,
          riskLevel: data.riskLevel,
          blastRadius: data.blastRadius
        }
      })
      .returning();
    console.log(`[DATABASE] Success saving AI analysis for run ${data.analysisRunId}`);
    return result[0];
  } catch (error: any) {
    console.error(`[DATABASE] Failure saving AI analysis for run ${data.analysisRunId}: ${error.message}`);
    throw error;
  }
}

export async function getAnalysisRunByPR(owner: string, repo: string, number: number, commitSha: string) {
  const run = await db.query.analysisRuns.findFirst({
    where: and(
      eq(analysisRuns.repoOwner, owner),
      eq(analysisRuns.repoName, repo),
      eq(analysisRuns.prNumber, number),
      eq(analysisRuns.commitSha, commitSha)
    ),
    orderBy: (runs, { desc }) => [desc(runs.createdAt)],
    with: {
      findings: true, // Legacy
      ruleFindings: true,
      aiAnalysis: true,
      testPlans: true,
      playwrightTests: true,
      coveragePredictions: true,
      prioritizations: true
    }
  });

  if (run) {
    console.log("SELECTED_RUN_INFO", {
      id: run.id,
      status: run.status,
      createdAt: run.createdAt,
      hasAIAnalysis: !!run.aiAnalysis,
      summaryLength: run.aiAnalysis?.summary?.length || 0
    });
  }

  return run;
}

export async function getTestPlanByAnalysisRunId(analysisRunId: number) {
  return await db.query.generatedTestPlans.findFirst({
    where: eq(generatedTestPlans.analysisRunId, analysisRunId),
  });
}

export async function saveTestPlan(data: NewGeneratedTestPlan) {
  console.log(`[DATABASE] Saving test plan for run ${data.analysisRunId}`);
  try {
    const result = await db.insert(generatedTestPlans)
      .values(data)
      .onConflictDoUpdate({
        target: generatedTestPlans.analysisRunId,
        set: {
          strategy: data.strategy,
          testCases: data.testCases
        }
      })
      .returning();
    console.log(`[DATABASE] Success saving test plan for run ${data.analysisRunId}`);
    return result[0];
  } catch (error: any) {
    console.error(`[DATABASE] Failure saving test plan for run ${data.analysisRunId}: ${error.message}`);
    throw error;
  }
}

export async function getPlaywrightTestsByAnalysisRunId(analysisRunId: number) {
  return await db.query.generatedPlaywrightTests.findFirst({
    where: eq(generatedPlaywrightTests.analysisRunId, analysisRunId),
  });
}

export async function savePlaywrightTests(data: NewGeneratedPlaywrightTest) {
  console.log(`[DATABASE] Saving Playwright tests for run ${data.analysisRunId}`);
  try {
    const result = await db.insert(generatedPlaywrightTests)
      .values(data)
      .onConflictDoUpdate({
        target: generatedPlaywrightTests.analysisRunId,
        set: {
          tests: data.tests
        }
      })
      .returning();
    console.log(`[DATABASE] Success saving Playwright tests for run ${data.analysisRunId}`);
    return result[0];
  } catch (error: any) {
    console.error(`[DATABASE] Failure saving Playwright tests for run ${data.analysisRunId}: ${error.message}`);
    throw error;
  }
}

export async function getCoveragePredictionByAnalysisRunId(analysisRunId: number) {
  return await db.query.coveragePredictions.findFirst({
    where: eq(coveragePredictions.analysisRunId, analysisRunId),
  });
}

export async function saveCoveragePrediction(data: NewCoveragePrediction) {
  console.log(`[DATABASE] Saving coverage prediction for run ${data.analysisRunId}`);
  try {
    const result = await db.insert(coveragePredictions)
      .values(data)
      .onConflictDoUpdate({
        target: coveragePredictions.analysisRunId,
        set: {
          estimatedCoverage: data.estimatedCoverage,
          missingTests: data.missingTests,
          riskScore: data.riskScore
        }
      })
      .returning();
    console.log(`[DATABASE] Success saving coverage prediction for run ${data.analysisRunId}`);
    return result[0];
  } catch (error: any) {
    console.error(`[DATABASE] Failure saving coverage prediction for run ${data.analysisRunId}: ${error.message}`);
    throw error;
  }
}

export async function getPrioritizationByAnalysisRunId(analysisRunId: number) {
  return await db.query.testPrioritizations.findFirst({
    where: eq(testPrioritizations.analysisRunId, analysisRunId),
  });
}

export async function savePrioritization(data: NewTestPrioritization) {
  console.log(`[DATABASE] Saving prioritization for run ${data.analysisRunId}`);
  try {
    const result = await db.insert(testPrioritizations)
      .values(data)
      .onConflictDoUpdate({
        target: testPrioritizations.analysisRunId,
        set: {
          rankedQueue: data.rankedQueue
        }
      })
      .returning();
    console.log(`[DATABASE] Success saving prioritization for run ${data.analysisRunId}`);
    return result[0];
  } catch (error: any) {
    console.error(`[DATABASE] Failure saving prioritization for run ${data.analysisRunId}: ${error.message}`);
    throw error;
  }
}
