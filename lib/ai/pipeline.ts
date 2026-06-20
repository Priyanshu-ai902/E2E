import { db } from "../db";
import { eq } from "drizzle-orm";
import { analysisRuns, generatedTestPlans, generatedPlaywrightTests, coveragePredictions, testPrioritizations } from "../db/schema";

export type PipelineStage = 'STRATEGY' | 'COVERAGE' | 'PRIORITIZE' | 'PLAYWRIGHT';

export interface StageState {
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  allowed: boolean;
  reason?: string;
}

export async function verifyPipelineState(analysisRunId: number, stage: PipelineStage): Promise<StageState> {
  // 1. Fetch analysis run status
  const run = await db.query.analysisRuns.findFirst({
    where: eq(analysisRuns.id, analysisRunId),
    with: {
      aiAnalysis: true
    }
  });

  if (!run) {
    return { status: 'PENDING', allowed: false, reason: "Parent analysis run not found in database." };
  }

  if (run.status !== 'SUCCESS') {
    return { 
      status: 'PENDING', 
      allowed: false, 
      reason: `Parent analysis run is currently in status: ${run.status}. It must be SUCCESS to proceed.` 
    };
  }

  if (!run.aiAnalysis) {
    return { status: 'PENDING', allowed: false, reason: "AI Analysis results are missing for the parent analysis run." };
  }

  // 2. Fetch downstream state
  const testPlan = await db.query.generatedTestPlans.findFirst({
    where: eq(generatedTestPlans.analysisRunId, analysisRunId)
  });

  if (stage === 'STRATEGY') {
    if (testPlan) {
      return { status: 'SUCCESS', allowed: true, reason: "Strategy is already generated and cached." };
    }
    return { status: 'PENDING', allowed: true };
  }

  // For all subsequent stages (COVERAGE, PRIORITIZE, PLAYWRIGHT), STRATEGY must be completed
  if (!testPlan) {
    return { status: 'PENDING', allowed: false, reason: "Upstream 'STRATEGY' stage must be completed before starting this stage." };
  }

  if (stage === 'COVERAGE') {
    const coverage = await db.query.coveragePredictions.findFirst({
      where: eq(coveragePredictions.analysisRunId, analysisRunId)
    });
    if (coverage) {
      return { status: 'SUCCESS', allowed: true, reason: "Coverage prediction is already completed and cached." };
    }
    return { status: 'PENDING', allowed: true };
  }

  if (stage === 'PRIORITIZE') {
    const priority = await db.query.testPrioritizations.findFirst({
      where: eq(testPrioritizations.analysisRunId, analysisRunId)
    });
    if (priority) {
      return { status: 'SUCCESS', allowed: true, reason: "Prioritization is already completed and cached." };
    }
    return { status: 'PENDING', allowed: true };
  }

  if (stage === 'PLAYWRIGHT') {
    const playwright = await db.query.generatedPlaywrightTests.findFirst({
      where: eq(generatedPlaywrightTests.analysisRunId, analysisRunId)
    });
    if (playwright) {
      return { status: 'SUCCESS', allowed: true, reason: "Playwright tests are already generated and cached." };
    }
    return { status: 'PENDING', allowed: true };
  }

  return { status: 'PENDING', allowed: false, reason: "Unknown pipeline stage requested." };
}

export type FailureType = 'MODEL_FAILURE' | 'PARSE_FAILURE' | 'VALIDATION_FAILURE' | 'DATABASE_FAILURE';

export class PipelineError extends Error {
  type: FailureType;
  constructor(type: FailureType, message: string, public originalError?: any) {
    super(message);
    this.name = 'PipelineError';
    this.type = type;
  }
}

export function handlePipelineError(stage: PipelineStage, error: any): never {
  let type: FailureType = 'MODEL_FAILURE';
  let message = error.message || 'Unknown pipeline failure';

  if (error instanceof SyntaxError) {
    type = 'PARSE_FAILURE';
    message = `JSON Syntax/Parse Error: ${error.message}`;
  } else if (error.name === 'ZodError') {
    type = 'VALIDATION_FAILURE';
    message = `Schema Constraint Error: ${JSON.stringify(error.errors)}`;
  } else if (
    error.message?.toLowerCase().includes('database') || 
    error.message?.toLowerCase().includes('drizzle') || 
    error.message?.toLowerCase().includes('relation') || 
    error.code?.startsWith('23') ||
    error.code?.startsWith('42')
  ) {
    type = 'DATABASE_FAILURE';
    message = `Database Execution Error: ${error.message}`;
  } else if (
    error.message?.includes('AI') || 
    error.message?.includes('model') || 
    error.message?.toLowerCase().includes('generative') ||
    error.message?.toLowerCase().includes('failover')
  ) {
    type = 'MODEL_FAILURE';
  }

  console.error(`[FAILOVER] [${stage}] Classified Error [${type}]: ${message}`);
  throw new PipelineError(type, message, error);
}
