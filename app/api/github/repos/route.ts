import { getCustomSession } from "@/lib/auth-custom";
import { NextResponse } from "next/server";
import { fetchUserRepos } from "@/lib/github/repositories";

export async function GET() {
  const session = await getCustomSession();

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
