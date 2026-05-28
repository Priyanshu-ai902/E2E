import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { fetchPRDiff } from "@/lib/github/diffs";
import { analyzeDiff } from "@/lib/ai/analyzer";
import { fetchPullRequest } from "@/lib/github/pullRequests";
import { getAnalysisByPR, saveAnalysis } from "@/lib/db/queries";

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
    // 1. Fetch latest PR metadata from GitHub to get current SHA
    const prData = await fetchPullRequest(session.accessToken as string, owner, repo, pullNumber);
    const currentSha = prData.head.sha;
    const prTitle = prData.title;

    // 2. Check DB for existing analysis with the same commit SHA
    const cachedAnalysis = await getAnalysisByPR(owner, repo, pullNumber, currentSha);

    if (cachedAnalysis) {
      console.log(`[Cache Hit] Returning cached analysis for ${owner}/${repo}#${pullNumber} @ ${currentSha}`);
      return NextResponse.json({
        cached: true,
        analysis: {
          summary: cachedAnalysis.summary,
          risks: cachedAnalysis.risks,
          importantChanges: cachedAnalysis.importantChanges,
          recommendations: cachedAnalysis.recommendations,
        }
      });
    }

    console.log(`[Cache Miss] Running Gemini analysis for ${owner}/${repo}#${pullNumber} @ ${currentSha}`);

    // 3. fetch PR diff
    const diff = await fetchPRDiff(session.accessToken as string, owner, repo, pullNumber);
    
    // 4. Analyze with Gemini
    const analysis = await analyzeDiff(diff);
    
    // 5. Store in Neon DB
    await saveAnalysis({
      repoOwner: owner,
      repoName: repo,
      prNumber: pullNumber,
      commitSha: currentSha,
      prTitle: prTitle,
      summary: analysis.summary,
      risks: analysis.risks,
      importantChanges: analysis.importantChanges,
      recommendations: analysis.recommendations,
    });

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
