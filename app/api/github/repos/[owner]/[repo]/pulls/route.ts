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

  try {
    const pulls = await fetchPullRequests(session.accessToken as string, owner, repo);
    return NextResponse.json(pulls);
  } catch (error: any) {
    console.error("Fetch Pulls Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pull requests" },
      { status: 500 }
    );
  }
}
