import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { fetchUserRepos } from "@/lib/github/repositories";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const repos = await fetchUserRepos(session.accessToken as string);
    return NextResponse.json(repos);
  } catch (error: any) {
    console.error("Fetch Repos Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
