import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { runAIAnalysis, runDeterministicRules } from "@/lib/ai/analyzer";
import { fetchPullRequest } from "@/lib/github/pullRequests";
import { 
  getAnalysisRunByPR, 
  saveAnalysisRun, 
  updateAnalysisStatus, 
  saveRuleFindings, 
  updateRetryInfo, 
  saveAIAnalysis,
  getLatestAnalysisRun,
  deleteAISections
} from "@/lib/db/queries";
import { db } from "@/lib/db";
import { aiCallLogs, ruleFindings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo, number } = await params;
  const { searchParams } = new URL(request.url);
  const sha = searchParams.get('sha');

  if (!sha) {
    return NextResponse.json({ error: "Missing SHA" }, { status: 400 });
  }

  const run = await getAnalysisRunByPR(owner, repo, parseInt(number), sha);
  if (!run) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  // Get current provider being attempted from logs if processing
  let currentProvider = null;
  if (run.status === 'PROCESSING') {
    const latestLog = await db.query.aiCallLogs.findFirst({
      where: eq(aiCallLogs.analysisRunId, run.id),
      orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    });
    currentProvider = latestLog?.modelName || null;
  }

  console.log({
    runId: run.id,
    status: run.status,
    summaryExists: !!run.aiAnalysis?.summary,
    findingsCount: run.ruleFindings?.length || 0,
    recommendationsCount: run.aiAnalysis?.recommendations?.length || 0
  });

  return NextResponse.json({
    status: run.status,
    retryCount: run.retryCount || 0,
    currentProvider,
    analysis: {
      id: run.id,
      repoOwner: run.repoOwner,
      repoName: run.repoName,
      prNumber: run.prNumber,
      commitSha: run.commitSha,
      status: run.status,
      summary: run.aiAnalysis?.summary || "AI analysis in progress...",
      risks: run.aiAnalysis?.risks || [],
      importantChanges: run.aiAnalysis?.importantChanges || [],
      recommendations: run.aiAnalysis?.recommendations || [],
      affectedModules: run.aiAnalysis?.affectedModules || [],
      regressionAreas: run.aiAnalysis?.regressionAreas || [],
      testingPriorities: run.aiAnalysis?.testingPriorities || [],
      riskLevel: run.aiAnalysis?.riskLevel || 'LOW',
      blastRadius: run.aiAnalysis?.blastRadius || { frontend: false, backend: false, database: false, infrastructure: false },
      ruleFindings: run.ruleFindings || [],
      metrics: {
        security: run.securityScore ?? 100,
        performance: run.performanceScore ?? 100,
        architecture: run.architectureScore ?? 100,
        overall: run.overallScore ?? 100
      }
    }
  });
}

async function runAnalysisWorker(
  runId: number,
  session: any,
  owner: string,
  repo: string,
  pullNumber: number,
  currentSha: string,
  filenames: string[]
) {
  console.log(`[WORKER_START] for run ${runId}`);
  const RETRY_SCHEDULE = [0, 2000, 5000]; 
  let attempt = 0;

  try {
    // Ensure status is PROCESSING when worker starts
    await updateAnalysisStatus(runId, 'PROCESSING');

    while (attempt < RETRY_SCHEDULE.length) {
      try {
        if (RETRY_SCHEDULE[attempt] > 0) {
          console.log(`[WORKER_RETRY_WAIT] ${RETRY_SCHEDULE[attempt]}ms for run ${runId}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_SCHEDULE[attempt]));
        }

        console.log(`[WORKER_AI_START] Attempt ${attempt + 1} for run ${runId}`);
        await updateRetryInfo(runId, attempt + 1, null);

        const aiResult = await runAIAnalysis(
          session.accessToken as string,
          owner,
          repo,
          pullNumber,
          currentSha,
          filenames,
          runId
        );

        if (!aiResult) {
          throw new Error("AI analysis returned empty or null results");
        }

        // Validate basic properties
        if (!aiResult.summary) {
          throw new Error("AI analysis result is missing the summary field");
        }

        // Save AI analysis results to database
        await saveAIAnalysis({
          analysisRunId: runId,
          summary: aiResult.summary,
          risks: aiResult.risks || [],
          importantChanges: aiResult.importantChanges || [],
          recommendations: aiResult.recommendations || [],
          affectedModules: aiResult.affectedModules || [],
          regressionAreas: aiResult.regressionAreas || [],
          testingPriorities: aiResult.testingPriorities || [],
          riskLevel: aiResult.riskLevel || 'LOW',
          blastRadius: aiResult.blastRadius || { frontend: false, backend: false, database: false, infrastructure: false },
        });

        console.log(`[WORKER_AI_SUCCESS] run ${runId}`);
        console.log(`[WORKER_SAVE_SUCCESS] run ${runId}`);
        
        await updateAnalysisStatus(runId, 'SUCCESS');
        console.log(`[WORKER_COMPLETE] run ${runId}`);
        return;
      } catch (error: any) {
        console.error(`[WORKER_ERROR] Attempt ${attempt + 1} failed for run ${runId}:`, error.message);
        await updateRetryInfo(runId, attempt + 1, error.message);
        attempt++;
      }
    }
    
    console.log(`[WORKER_FAILED] Max retries reached for run ${runId}`);
    await updateAnalysisStatus(runId, 'FAILED');
  } catch (criticalError: any) {
    console.error(`[WORKER_CRITICAL_ERROR] for run ${runId}:`, criticalError.message);
    await updateAnalysisStatus(runId, 'FAILED');
    await updateRetryInfo(runId, attempt, criticalError.message);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo, number } = await params;
  const pullNumber = parseInt(number);

  if (isNaN(pullNumber)) {
    return NextResponse.json({ error: "Invalid PR number" }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    let currentSha = body.sha;
    const mode = body.mode || 'standard'; // 'standard', 'ai-only', 'full'
    const forceReanalyze = body.forceReanalyze === true;

    // 1. Fetch latest PR metadata if SHA not provided
    if (!currentSha) {
      const prData = await fetchPullRequest(session.accessToken as string, owner, repo, pullNumber);
      currentSha = prData.head.sha;
    }

    // 2. Check for latest run to determine re-analysis logic
    const latestRun = await getLatestAnalysisRun(owner, repo, pullNumber);
    const shaChanged = latestRun && latestRun.commitSha !== currentSha;

    // 3. Duplicate Prevention / Cache Logic
    if (latestRun && !shaChanged && latestRun.status === 'SUCCESS' && !forceReanalyze && mode === 'standard') {
      console.log(`[CACHE] [CACHE_HIT] Reusing successful analysis run ${latestRun.id} for ${owner}/${repo}#${pullNumber} @ ${currentSha}`);
      return NextResponse.json({
        status: 'SUCCESS',
        cached: true,
        analysis: formatAnalysisResponse(latestRun)
      });
    }

    // Safeguard: Prevent duplicate re-analysis execution if run is currently running
    if (latestRun && !shaChanged && (latestRun.status === 'PROCESSING' || latestRun.status === 'PENDING') && !forceReanalyze) {
      console.log(`[CACHE] [PROCESSING] Run ${latestRun.id} is already in state ${latestRun.status}. Preventing duplicate worker execution.`);
      return NextResponse.json({
        status: latestRun.status,
        cached: true,
        analysis: formatAnalysisResponse(latestRun)
      });
    }

    if (forceReanalyze) {
      console.log(`[CACHE] [FORCE_REANALYZE] Triggering new analysis for run ${latestRun?.id || 'new'} per user request.`);
    } else {
      console.log(`[CACHE] [CACHE_MISS] No existing successful run for SHA ${currentSha} or mode is ${mode}.`);
    }

    // 4. Re-analysis Decision
    let runId: number;
    let findings: any[] = [];
    let scores = { security: 100, performance: 100, architecture: 100, overall: 100 };
    let filenames: string[] = [];

    if (latestRun && !shaChanged && mode === 'ai-only') {
      console.log(`[Re-analysis] SHA unchanged, mode is 'ai-only'. Reusing deterministic findings for run ${latestRun.id}`);
      runId = latestRun.id;
      findings = latestRun.ruleFindings || [];
      scores = {
        security: latestRun.securityScore,
        performance: latestRun.performanceScore,
        architecture: latestRun.architectureScore,
        overall: latestRun.overallScore
      };
      
      const { fetchPRFiles } = await import("@/lib/github/diffs");
      const files = await fetchPRFiles(session.accessToken as string, owner, repo, pullNumber);
      filenames = files.map(f => f.filename);
      
      await deleteAISections(runId);
    } else {
      // Full analysis or SHA changed
      console.log(`[Analysis] Running full deterministic rules for ${owner}/${repo}#${pullNumber} @ ${currentSha}`);
      const deterministic = await runDeterministicRules(
        session.accessToken as string,
        owner,
        repo,
        pullNumber,
        currentSha
      );
      findings = deterministic.findings;
      scores = deterministic.scores;
      filenames = deterministic.filenames;

      if (latestRun && !shaChanged && mode === 'full') {
        runId = latestRun.id;
        await deleteAISections(runId);
        await db.delete(ruleFindings).where(eq(ruleFindings.analysisRunId, runId));
      } else {
        const savedRun = await saveAnalysisRun({
          repoOwner: owner,
          repoName: repo,
          prNumber: pullNumber,
          commitSha: currentSha,
          status: 'PENDING',
          securityScore: scores.security,
          performanceScore: scores.performance,
          architectureScore: scores.architecture,
          overallScore: scores.overall,
        });
        runId = savedRun.id;
      }

      // Save rule findings
      const ruleFindingsToSave = findings.map(f => ({ ...f, analysisRunId: runId }));
      await saveRuleFindings(ruleFindingsToSave);
    }

    // 4. Launch Worker
    runAnalysisWorker(runId, session, owner, repo, pullNumber, currentSha, filenames).catch(err => {
      console.error(`[WORKER_SPAWN_ERROR] for run ${runId}:`, err);
    });

    return NextResponse.json({
      status: 'PROCESSING',
      analysis: {
        id: runId,
        repoOwner: owner,
        repoName: repo,
        prNumber: pullNumber,
        commitSha: currentSha,
        status: 'PROCESSING',
        summary: "AI analysis in progress...",
        risks: [],
        importantChanges: [],
        recommendations: [],
        affectedModules: [],
        regressionAreas: [],
        testingPriorities: [],
        riskLevel: 'LOW',
        blastRadius: { frontend: false, backend: false, database: false, infrastructure: false },
        ruleFindings: findings,
        metrics: scores
      }
    });

  } catch (error: any) {
    console.error("Analysis Pipeline Error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

function formatAnalysisResponse(run: any) {
  return {
    id: run.id,
    repoOwner: run.repoOwner,
    repoName: run.repoName,
    prNumber: run.prNumber,
    commitSha: run.commitSha,
    status: run.status,
    summary: run.aiAnalysis?.summary || (run.status === 'PROCESSING' ? "AI analysis in progress..." : "AI analysis not available."),
    risks: run.aiAnalysis?.risks || [],
    importantChanges: run.aiAnalysis?.importantChanges || [],
    recommendations: run.aiAnalysis?.recommendations || [],
    affectedModules: run.aiAnalysis?.affectedModules || [],
    regressionAreas: run.aiAnalysis?.regressionAreas || [],
    testingPriorities: run.aiAnalysis?.testingPriorities || [],
    riskLevel: run.aiAnalysis?.riskLevel || 'LOW',
    blastRadius: run.aiAnalysis?.blastRadius || { frontend: false, backend: false, database: false, infrastructure: false },
    ruleFindings: run.ruleFindings || [],
    metrics: {
      security: run.securityScore ?? 100,
      performance: run.performanceScore ?? 100,
      architecture: run.architectureScore ?? 100,
      overall: run.overallScore ?? 100
    }
  };
}
