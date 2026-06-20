import dotenv from "dotenv";
dotenv.config();

async function main() {
  const { db } = await import("../lib/db/index");
  const { saveAIAnalysis, getLatestAnalysisRun } = await import("../lib/db/queries");

  console.log("Fetching latest analysis run to use its ID...");
  const latestRun = await getLatestAnalysisRun("Priyanshu-ai902", "test-repo-for-e2e", 1);
  if (!latestRun) {
    console.error("No analysis run found in DB!");
    return;
  }

  const runId = latestRun.id;
  console.log(`Using run ID: ${runId}`);

  try {
    console.log("Attempting to save AI Analysis...");
    const result = await saveAIAnalysis({
      analysisRunId: runId,
      summary: "This is a test summary for auditing.",
      risks: ["Risk 1: Potential SQL Injection", "Risk 2: Broken Access Control"],
      importantChanges: ["Added queries.ts updates"],
      recommendations: ["Ensure index matches schema"],
      affectedModules: ["Database Layer", "Security"],
      regressionAreas: ["API Integration"],
      testingPriorities: ["Unit tests"],
      riskLevel: "HIGH",
      blastRadius: {
        frontend: false,
        backend: true,
        database: true,
        infrastructure: false
      }
    });

    console.log("Successfully saved AI analysis!");
    console.log("Result:", JSON.stringify(result, null, 2));

  } catch (error: any) {
    console.error("DATABASE EXCEPTION ENCOUNTERED:");
    console.error(error);
  }
}

main().catch(console.error);
