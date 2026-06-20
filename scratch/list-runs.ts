import dotenv from "dotenv";
dotenv.config();

async function main() {
  const { db } = await import("../lib/db/index");
  const { analysisRuns } = await import("../lib/db/schema");
  const { desc } = await import("drizzle-orm");

  console.log("Fetching recent analysis runs...");
  const runs = await db.select().from(analysisRuns).orderBy(desc(analysisRuns.id)).limit(10);
  console.log("Recent runs:", JSON.stringify(runs, null, 2));
}

main().catch(console.error);
