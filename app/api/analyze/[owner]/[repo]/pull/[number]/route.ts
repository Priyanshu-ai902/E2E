import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { analyzePR } from "@/lib/ai/analyzer";
import { fetchPullRequest } from "@/lib/github/pullRequests";
import { getAnalysisRunByPR, saveAnalysisRun } from "@/lib/db/queries";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  const startTime = performance.now();
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
    // 1. Try to get SHA from request body for immediate cache check
    const body = await request.json().catch(() => ({}));
    let currentSha = body.sha;

    console.log(`[Cache Lookup] Starting for ${owner}/${repo}#${pullNumber}${currentSha ? ` @ ${currentSha}` : ''}`);

    // 2. If SHA is provided, check cache IMMEDIATELY
    if (currentSha) {
      const cachedRun = await getAnalysisRunByPR(owner, repo, pullNumber, currentSha);
      if (cachedRun) {
        const endTime = performance.now();
        console.log(`[Cache Hit] Returning cached structured analysis for ${owner}/${repo}#${pullNumber} @ ${currentSha}`);
        console.log(`[Cache Return Time] ${Math.round(endTime - startTime)}ms`);
        
        return NextResponse.json({
          cached: true,
          analysis: {
            summary: cachedRun.summary || "No summary available.",
            risks: [],
            importantChanges: [],
            recommendations: [],
            ruleFindings: cachedRun.findings || [],
            metrics: {
              security: cachedRun.securityScore ?? 100,
              performance: cachedRun.performanceScore ?? 100,
              architecture: cachedRun.architectureScore ?? 100,
              overall: cachedRun.overallScore ?? 100
            }
          }
        });
      }
    }

    // 3. If no SHA or cache miss with SHA, fetch latest PR metadata from GitHub
    console.log(`[Cache Miss] Fetching latest PR metadata from GitHub for ${owner}/${repo}#${pullNumber}`);
    const prData = await fetchPullRequest(session.accessToken as string, owner, repo, pullNumber);
    const latestSha = prData.head.sha;

    // 4. If we didn't have a SHA or the one we had was different, check cache again with latest SHA
    if (latestSha !== currentSha) {
      currentSha = latestSha;
      const cachedRun = await getAnalysisRunByPR(owner, repo, pullNumber, currentSha);

      if (cachedRun) {
        const endTime = performance.now();
        console.log(`[Cache Hit] Returning cached structured analysis for ${owner}/${repo}#${pullNumber} @ ${currentSha}`);
        console.log(`[Cache Return Time] ${Math.round(endTime - startTime)}ms`);

        return NextResponse.json({
          cached: true,
          analysis: {
            summary: cachedRun.summary || "No summary available.",
            risks: [],
            importantChanges: [],
            recommendations: [],
            ruleFindings: cachedRun.findings || [],
            metrics: {
              security: cachedRun.securityScore ?? 100,
              performance: cachedRun.performanceScore ?? 100,
              architecture: cachedRun.architectureScore ?? 100,
              overall: cachedRun.overallScore ?? 100
            }
          }
        });
      }
    }

    console.log(`[Cache Miss] Running deep analysis for ${owner}/${repo}#${pullNumber} @ ${currentSha}`);

    // 5. Run full analysis (Rules + Gemini)
    const analysis = await analyzePR(session.accessToken as string, owner, repo, pullNumber, currentSha);
    
    // 6. Store in Neon DB
    await saveAnalysisRun({
      repoOwner: owner,
      repoName: repo,
      prNumber: pullNumber,
      commitSha: currentSha,
      summary: analysis.summary,
      securityScore: analysis.metrics.security,
      performanceScore: analysis.metrics.performance,
      architectureScore: analysis.metrics.architecture,
      overallScore: analysis.metrics.overall,
    }, analysis.ruleFindings);

    const endTime = performance.now();
    console.log(`[Analysis Complete] Total time: ${Math.round(endTime - startTime)}ms`);

    return NextResponse.json({
      cached: false,
      analysis
    });
  } catch (error: any) {
    console.error("Analysis Pipeline Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during analysis" },
      { status: 500 }
    );
  }
}
