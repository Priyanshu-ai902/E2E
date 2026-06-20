import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { fetchPullRequests } from "@/lib/github/pullRequests";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { owner, repo } = await params;
  console.log(`[API_ROUTE] Fetching PRs for ${owner}/${repo}`);

  try {
    const pulls = await fetchPullRequests(session.accessToken as string, owner, repo);
    console.log(`[API_ROUTE] GitHub API response count: ${pulls?.length || 0}`);
    console.log(`[API_ROUTE] Final response count: ${pulls?.length || 0}`);
    return NextResponse.json(pulls);
  } catch (error: any) {
    console.error("Fetch Pulls Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pull requests" },
      { status: 500 }
    );
  }
}
