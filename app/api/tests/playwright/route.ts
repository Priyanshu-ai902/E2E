import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { generatePlaywrightTests } from "@/lib/ai/playwright-generator";
import { getTestPlanByAnalysisRunId, getPlaywrightTestsByAnalysisRunId, savePlaywrightTests } from "@/lib/db/queries";
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

    console.log(`[PLAYWRIGHT] Start pipeline stage for run ${analysisRunId}`);

    // 1. Verify Pipeline State
    const state = await verifyPipelineState(analysisRunId, 'PLAYWRIGHT');
    if (!state.allowed) {
      console.warn(`[PLAYWRIGHT] [FAILOVER] Verification blocked execution for run ${analysisRunId}: ${state.reason}`);
      return NextResponse.json({ error: state.reason }, { status: 400 });
    }

    // 2. Check Cache
    if (state.status === 'SUCCESS') {
      console.log(`[CACHE] Hit for Playwright on run ${analysisRunId}`);
      const cachedTests = await getPlaywrightTestsByAnalysisRunId(analysisRunId);
      if (cachedTests) {
        return NextResponse.json({
          cached: true,
          tests: cachedTests.tests
        });
      }
    }

    // 3. Fetch test plan dependency
    const testPlan = await getTestPlanByAnalysisRunId(analysisRunId);
    if (!testPlan) {
      return NextResponse.json({ error: "Test plan not found. Generate strategy first." }, { status: 404 });
    }

    // 4. Generate Playwright tests
    const result = await generatePlaywrightTests({
      strategy: testPlan.strategy,
      tests: testPlan.testCases as any
    }, analysisRunId);

    // 5. Save to database
    await savePlaywrightTests({
      analysisRunId,
      tests: result.tests
    });

    console.log(`[PLAYWRIGHT] Success for run ${analysisRunId}`);
    return NextResponse.json({
      cached: false,
      tests: result.tests
    });

  } catch (error: any) {
    try {
      handlePipelineError('PLAYWRIGHT', error);
    } catch (pipelineErr: any) {
      console.error(`[PLAYWRIGHT] Failure for run ${currentRunId}: ${pipelineErr.message}`);
      const status = pipelineErr.type === 'DATABASE_FAILURE' ? 503 : (pipelineErr.type === 'VALIDATION_FAILURE' ? 422 : 500);
      return NextResponse.json({ 
        error: pipelineErr.message, 
        type: pipelineErr.type 
      }, { status });
    }
  }
}
