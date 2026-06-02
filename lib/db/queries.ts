import { db } from './index';
import { prAnalyses, analysisRuns, analysisFindings, type NewPRAnalysis, type NewAnalysisRun, type NewAnalysisFinding } from './schema';
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

export async function saveAnalysisRun(run: NewAnalysisRun, findings: Omit<NewAnalysisFinding, 'analysisRunId'>[]) {
  const [savedRun] = await db.insert(analysisRuns).values(run).returning();
  
  if (findings.length > 0) {
    const findingsWithId = findings.map(f => ({ 
      ...f, 
      analysisRunId: savedRun.id 
    })) as NewAnalysisFinding[];
    
    await db.insert(analysisFindings).values(findingsWithId);
  }
  
  return savedRun;
}

export async function getAnalysisRunByPR(owner: string, repo: string, number: number, commitSha: string) {
  const run = await db.query.analysisRuns.findFirst({
    where: and(
      eq(analysisRuns.repoOwner, owner),
      eq(analysisRuns.repoName, repo),
      eq(analysisRuns.prNumber, number),
      eq(analysisRuns.commitSha, commitSha)
    ),
    with: {
      findings: true
    }
  });
  return run;
}
