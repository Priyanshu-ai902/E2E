import { db } from './index';
import { prAnalyses, type NewPRAnalysis } from './schema';
import { and, eq } from 'drizzle-orm';

export async function getAnalysisByPR(owner: string, repo: string, number: number, commitSha: string) {
  const result = await db.query.prAnalyses.findFirst({
    where: and(
      eq(prAnalyses.repoOwner, owner),
      eq(prAnalyses.repoName, repo),
      eq(prAnalyses.prNumber, number),
      eq(prAnalyses.commitSha, commitSha)
    ),
  });
  return result;
}

export async function saveAnalysis(data: NewPRAnalysis) {
  const result = await db.insert(prAnalyses).values(data).returning();
  return result[0];
}

export async function updateAnalysis(id: number, data: Partial<NewPRAnalysis>) {
  const result = await db.update(prAnalyses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(prAnalyses.id, id))
    .returning();
  return result[0];
}
