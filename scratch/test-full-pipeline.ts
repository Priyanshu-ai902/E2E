import dotenv from "dotenv";
dotenv.config();

async function main() {
  const { db } = await import("../lib/db/index");
  const { analysisRuns } = await import("../lib/db/schema");
  const { 
    getLatestAnalysisRun, 
    deleteAISections, 
    saveAIAnalysis, 
    saveTestPlan, 
    saveCoveragePrediction, 
    savePrioritization, 
    savePlaywrightTests,
    updateAnalysisStatus
  } = await import("../lib/db/queries");
  const { analyzeDiff } = await import("../lib/ai/analyzer");
  const { generateTestPlan } = await import("../lib/ai/test-generator");
  const { predictCoverage } = await import("../lib/ai/coverage-predictor");
  const { prioritizeTests } = await import("../lib/ai/prioritizer");
  const { generatePlaywrightTests } = await import("../lib/ai/playwright-generator");
  const { AnalysisResultSchema } = await import("../lib/ai/schemas");

  console.log("Fetching latest analysis run to use as test container...");
  const latestRun = await getLatestAnalysisRun("Priyanshu-ai902", "test-repo-for-e2e", 1);
  if (!latestRun) {
    console.error("No analysis run found in DB!");
    return;
  }

  const runId = latestRun.id;
  console.log(`\n=================== STARTING E2E REANALYZE FLOW FOR RUN ${runId} ===================`);

  // Step 1: Delete any existing AI sections
  console.log("\n[Step 1/7] Deleting AI sections...");
  await deleteAISections(runId);
  console.log("AI sections deleted.");

  // Step 2: Set status to PROCESSING
  console.log("\n[Step 2/7] Setting status to PROCESSING...");
  await updateAnalysisStatus(runId, "PROCESSING");
  console.log("Status set to PROCESSING.");

  // Mock file changes & diff
  const mockFilenames = ["lib/auth.ts", "lib/db/schema.ts", "app/api/route.ts"];
  const mockDiff = `
diff --git a/lib/auth.ts b/lib/auth.ts
index e69de29..d95f32a 100644
--- a/lib/auth.ts
+++ b/lib/auth.ts
@@ -10,4 +10,12 @@ export const authOptions = {
   providers: [
     GithubProvider({
       clientId: process.env.GITHUB_CLIENT_ID,
-      clientSecret: process.env.GITHUB_CLIENT_SECRET,
+      clientSecret: process.env.GITHUB_CLIENT_SECRET,
+      authorization: { params: { scope: "read:user user:email repo" } }
     })
   ]
 }
`;

  // Step 3: Run AI analysis
  console.log("\n[Step 3/7] Generating AI Analysis...");
  const aiResult = await analyzeDiff(mockDiff, runId);
  console.log("AI Analysis output generated successfully!");
  console.log("Raw AI Analysis keys:", Object.keys(aiResult));
  
  if (!aiResult.summary) {
    throw new Error("AI analysis result is missing the summary field");
  }

  // Step 4: Save AI analysis to database
  console.log("\n[Step 4/7] Saving AI analysis to DB...");
  const savedAI = await saveAIAnalysis({
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
  console.log("AI analysis successfully saved!");

  // Parse result for downstream inputs
  const analysisData = AnalysisResultSchema.parse({
    summary: savedAI.summary,
    risks: savedAI.risks,
    importantChanges: savedAI.importantChanges,
    recommendations: savedAI.recommendations,
    affectedModules: savedAI.affectedModules,
    regressionAreas: savedAI.regressionAreas,
    testingPriorities: savedAI.testingPriorities,
    riskLevel: savedAI.riskLevel as any,
    blastRadius: savedAI.blastRadius,
  });

  // Step 5: Generate and Save Test Strategy
  console.log("\n[Step 5/7] Generating and saving Test Strategy...");
  const testPlan = await generateTestPlan(analysisData, mockFilenames, runId);
  console.log("Test strategy generated successfully!");
  
  await saveTestPlan({
    analysisRunId: runId,
    strategy: testPlan.strategy,
    testCases: testPlan.tests as any
  });
  console.log("Test strategy successfully saved!");

  // Step 6: Generate and Save Coverage Prediction
  console.log("\n[Step 6/7] Generating and saving Coverage Prediction...");
  const coverage = await predictCoverage(analysisData, testPlan, runId);
  console.log("Coverage prediction generated successfully!");
  
  await saveCoveragePrediction({
    analysisRunId: runId,
    estimatedCoverage: coverage.estimatedCoverage,
    missingTests: coverage.missingTests,
    riskScore: coverage.riskScore
  });
  console.log("Coverage prediction successfully saved!");

  // Step 7: Generate and Save Prioritization
  console.log("\n[Step 7/7] Generating and saving Prioritization...");
  const prioritization = await prioritizeTests(analysisData, testPlan, runId);
  console.log("Prioritization generated successfully!");
  
  await savePrioritization({
    analysisRunId: runId,
    rankedQueue: prioritization as any
  });
  console.log("Prioritization successfully saved!");

  // Step 8: Generate and Save Playwright Specs
  console.log("\n[Step 8/8] Generating and saving Playwright Specs...");
  const playwrightTests = await generatePlaywrightTests(testPlan, runId);
  console.log("Playwright tests generated successfully!");

  await savePlaywrightTests({
    analysisRunId: runId,
    tests: playwrightTests.tests as any
  });
  console.log("Playwright tests successfully saved!");

  // Final Step: Update analysis status to SUCCESS
  console.log("\n[Final Step] Updating analysis status to SUCCESS...");
  await updateAnalysisStatus(runId, "SUCCESS");
  console.log("Analysis status updated to SUCCESS!");

  console.log(`\n=================== E2E REANALYZE FLOW FOR RUN ${runId} COMPLETED SUCCESSFULLY ===================\n`);
}

main().catch(error => {
  console.error("\n=================== E2E FLOW FAILED ===================");
  console.error("Error Message:", error.message);
  console.error("Stack Trace:", error.stack);
  process.exit(1);
});
