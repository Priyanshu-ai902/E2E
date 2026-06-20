import { getCustomSession } from "@/lib/auth-custom";
import { NextResponse } from "next/server";
import { predictCoverage } from "@/lib/ai/coverage-predictor";
import { getTestPlanByAnalysisRunId, getCoveragePredictionByAnalysisRunId, saveCoveragePrediction } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { analysisRuns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AnalysisResultSchema } from "@/lib/ai/schemas";
import { verifyPipelineState, handlePipelineError } from "@/lib/ai/pipeline";

export async function POST(request: Request) {
  const session = await getCustomSession();

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

    console.log(`[COVERAGE] Start pipeline stage for run ${analysisRunId}`);

    // 1. Verify Pipeline State
    const state = await verifyPipelineState(analysisRunId, 'COVERAGE');
    if (!state.allowed) {
      console.warn(`[COVERAGE] [FAILOVER] Verification blocked execution for run ${analysisRunId}: ${state.reason}`);
      return NextResponse.json({ error: state.reason }, { status: 400 });
    }

    // 2. Check Cache
    if (state.status === 'SUCCESS') {
      console.log(`[CACHE] Hit for Coverage on run ${analysisRunId}`);
      const cachedPrediction = await getCoveragePredictionByAnalysisRunId(analysisRunId);
      if (cachedPrediction) {
        return NextResponse.json({
          cached: true,
          prediction: {
            estimatedCoverage: cachedPrediction.estimatedCoverage,
            missingTests: cachedPrediction.missingTests,
            riskScore: cachedPrediction.riskScore
          }
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

    // 4. Run prediction
    const prediction = await predictCoverage(analysisData, {
      strategy: testPlan.strategy,
      tests: (testPlan as any).tests || testPlan.testCases
    }, analysisRunId);

    // 5. Save to database
    await saveCoveragePrediction({
      analysisRunId,
      estimatedCoverage: prediction.estimatedCoverage,
      missingTests: prediction.missingTests,
      riskScore: prediction.riskScore
    });

    console.log(`[COVERAGE] Success for run ${analysisRunId}`);
    return NextResponse.json({
      cached: false,
      prediction
    });

  } catch (error: any) {
    try {
      handlePipelineError('COVERAGE', error);
    } catch (pipelineErr: any) {
      console.error(`[COVERAGE] Failure for run ${currentRunId}: ${pipelineErr.message}`);
      const status = pipelineErr.type === 'DATABASE_FAILURE' ? 503 : (pipelineErr.type === 'VALIDATION_FAILURE' ? 422 : 500);
      return NextResponse.json({ 
        error: pipelineErr.message, 
        type: pipelineErr.type 
      }, { status });
    }
  }
}
