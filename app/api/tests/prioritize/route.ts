import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prioritizeTests } from "@/lib/ai/prioritizer";
import { getTestPlanByAnalysisRunId, getPrioritizationByAnalysisRunId, savePrioritization } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { analysisRuns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AnalysisResultSchema } from "@/lib/ai/schemas";
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

    console.log(`[PRIORITIZATION] Start pipeline stage for run ${analysisRunId}`);

    // 1. Verify Pipeline State
    const state = await verifyPipelineState(analysisRunId, 'PRIORITIZE');
    if (!state.allowed) {
      console.warn(`[PRIORITIZATION] [FAILOVER] Verification blocked execution for run ${analysisRunId}: ${state.reason}`);
      return NextResponse.json({ error: state.reason }, { status: 400 });
    }

    // 2. Check Cache
    if (state.status === 'SUCCESS') {
      console.log(`[CACHE] Hit for Prioritization on run ${analysisRunId}`);
      const cached = await getPrioritizationByAnalysisRunId(analysisRunId);
      if (cached) {
        return NextResponse.json({
          cached: true,
          rankedQueue: cached.rankedQueue
        });
      }
    }

    // 3. Fetch dependencies
    const testPlan = await getTestPlanByAnalysisRunId(analysisRunId);
    const run = await db.query.analysisRuns.findFirst({
      where: eq(analysisRuns.id, analysisRunId),
      with: {
        aiAnalysis: true,
      }
    });

    if (!testPlan || !run) {
      return NextResponse.json({ error: "Test plan or analysis run not found" }, { status: 404 });
    }

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

    // 4. Run prioritization
    const rankedQueue = await prioritizeTests(analysisData, {
      strategy: testPlan.strategy,
      tests: testPlan.testCases as any
    }, analysisRunId);

    // 5. Save to database
    await savePrioritization({
      analysisRunId,
      rankedQueue
    });

    console.log(`[PRIORITIZATION] Success for run ${analysisRunId}`);
    return NextResponse.json({
      cached: false,
      rankedQueue
    });

  } catch (error: any) {
    try {
      handlePipelineError('PRIORITIZE', error);
    } catch (pipelineErr: any) {
      console.error(`[PRIORITIZATION] Failure for run ${currentRunId}: ${pipelineErr.message}`);
      const status = pipelineErr.type === 'DATABASE_FAILURE' ? 503 : (pipelineErr.type === 'VALIDATION_FAILURE' ? 422 : 500);
      return NextResponse.json({ 
        error: pipelineErr.message, 
        type: pipelineErr.type 
      }, { status });
    }
  }
}
