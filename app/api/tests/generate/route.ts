import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { generateTestPlan } from "@/lib/ai/test-generator";
import { getTestPlanByAnalysisRunId, saveTestPlan } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { analysisRuns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AnalysisResultSchema } from "@/lib/ai/schemas";
import { fetchPullRequestFiles } from "@/lib/github/pullRequests";
import { verifyPipelineState, handlePipelineError } from "@/lib/ai/pipeline";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let currentRunId: number | undefined;

  try {
    const { analysisRunId } = await request.json();

    if (!analysisRunId) {
      return NextResponse.json({ error: "analysisRunId is required" }, { status: 400 });
    }
    currentRunId = analysisRunId;

    console.log(`[STRATEGY] Start pipeline stage for run ${analysisRunId}`);

    // 1. Verify Pipeline State
    const state = await verifyPipelineState(analysisRunId, 'STRATEGY');
    if (!state.allowed) {
      console.warn(`[STRATEGY] [FAILOVER] Verification blocked execution for run ${analysisRunId}: ${state.reason}`);
      return NextResponse.json({ error: state.reason }, { status: 400 });
    }

    // 2. Check Cache
    if (state.status === 'SUCCESS') {
      console.log(`[CACHE] Hit for Strategy on run ${analysisRunId}`);
      const cachedPlan = await getTestPlanByAnalysisRunId(analysisRunId);
      if (cachedPlan) {
        return NextResponse.json({
          cached: true,
          testPlan: {
            strategy: cachedPlan.strategy,
            tests: cachedPlan.testCases
          }
        });
      }
    }

    // 3. Fetch dependencies
    const run = await db.query.analysisRuns.findFirst({
      where: eq(analysisRuns.id, analysisRunId),
      with: {
        aiAnalysis: true,
      }
    });

    if (!run) {
      return NextResponse.json({ error: "Analysis run not found" }, { status: 404 });
    }

    const files = await fetchPullRequestFiles(
      session.accessToken,
      run.repoOwner,
      run.repoName,
      run.prNumber
    );
    const filenames = files.map(f => f.filename);

    const ai = run.aiAnalysis;
    const analysisData = AnalysisResultSchema.parse({
      summary: ai?.summary || "No summary available.",
      risks: ai?.risks || [],
      importantChanges: ai?.importantChanges || [],
      recommendations: ai?.recommendations || [],
      affectedModules: ai?.affectedModules || [],
      regressionAreas: ai?.regressionAreas || [],
      testingPriorities: ai?.testingPriorities || [],
      riskLevel: ai?.riskLevel || 'LOW',
      blastRadius: ai?.blastRadius || { frontend: false, backend: false, database: false, infrastructure: false },
    });

    // 4. Generate Test Plan
    const testPlan = await generateTestPlan(analysisData, filenames, analysisRunId);

    // 5. Save to Database (using safe upsert/onConflictDoUpdate)
    await saveTestPlan({
      analysisRunId,
      strategy: testPlan.strategy,
      testCases: testPlan.tests as any
    });

    console.log(`[STRATEGY] Success for run ${analysisRunId}`);
    return NextResponse.json({
      cached: false,
      testPlan
    });

  } catch (error: any) {
    try {
      handlePipelineError('STRATEGY', error);
    } catch (pipelineErr: any) {
      console.error(`[STRATEGY] Failure for run ${currentRunId}: ${pipelineErr.message}`);
      const status = pipelineErr.type === 'DATABASE_FAILURE' ? 503 : (pipelineErr.type === 'VALIDATION_FAILURE' ? 422 : 500);
      return NextResponse.json({ 
        error: pipelineErr.message, 
        type: pipelineErr.type 
      }, { status });
    }
  }
}
