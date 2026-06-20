import { pgTable, serial, text, integer, timestamp, jsonb, uniqueIndex, unique, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const prAnalyses = pgTable('pr_analyses', {
  id: serial('id').primaryKey(),
  repoOwner: text('repo_owner').notNull(),
  repoName: text('repo_name').notNull(),
  prNumber: integer('pr_number').notNull(),
  commitSha: text('commit_sha').notNull(),
  prTitle: text('pr_title').notNull(),
  summary: text('summary').notNull(),
  risks: jsonb('risks').$type<string[]>().notNull(),
  importantChanges: jsonb('important_changes').$type<string[]>().notNull(),
  recommendations: jsonb('recommendations').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    prUnique: unique().on(table.repoOwner, table.repoName, table.prNumber, table.commitSha),
    ownerNameIdx: uniqueIndex('owner_name_pr_idx').on(table.repoOwner, table.repoName, table.prNumber),
  };
});

export const analysisStatusEnum = text('status', { enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'] });

export const analysisRuns = pgTable('analysis_runs', {
  id: serial('id').primaryKey(),
  repoOwner: text('repo_owner').notNull(),
  repoName: text('repo_name').notNull(),
  prNumber: integer('pr_number').notNull(),
  commitSha: text('commit_sha').notNull(),
  status: text('status', { enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'] }).default('PENDING').notNull(),
  securityScore: integer('security_score').notNull(),
  performanceScore: integer('performance_score').notNull(),
  architectureScore: integer('architecture_score').notNull(),
  overallScore: integer('overall_score').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  // Keeping old fields for backward compatibility during migration
  summary: text('summary'),
  risks: jsonb('risks').$type<string[]>(),
  importantChanges: jsonb('important_changes').$type<string[]>(),
  recommendations: jsonb('recommendations').$type<string[]>(),
  affectedModules: jsonb('affected_modules').$type<string[]>(),
  regressionAreas: jsonb('regression_areas').$type<string[]>(),
  testingPriorities: jsonb('testing_priorities').$type<string[]>(),
  blastRadius: jsonb('blast_radius').$type<{
    frontend: boolean,
    backend: boolean,
    database: boolean,
    infrastructure: boolean
  }>(),
  riskLevel: text('risk_level'),
  retryCount: integer('retry_count').default(0).notNull(),
  lastError: text('last_error'),
  lastAttemptAt: timestamp('last_attempt_at'),
});

export const analysisFindings = pgTable('analysis_findings', {
  id: serial('id').primaryKey(),
  analysisRunId: integer('analysis_run_id').references(() => analysisRuns.id).notNull(),
  category: text('category').notNull(), 
  severity: text('severity').notNull(), 
  confidence: integer('confidence').notNull(), 
  title: text('title').notNull(),
  description: text('description').notNull(),
  file: text('file'),
  line: integer('line'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ruleFindings = pgTable('rule_findings', {
  id: serial('id').primaryKey(),
  analysisRunId: integer('analysis_run_id').references(() => analysisRuns.id).notNull(),
  category: text('category').notNull(),
  severity: text('severity').notNull(),
  confidence: integer('confidence').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  file: text('file'),
  line: integer('line'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const aiAnalysis = pgTable('ai_analysis', {
  id: serial('id').primaryKey(),
  analysisRunId: integer('analysis_run_id').references(() => analysisRuns.id).notNull(),
  summary: text('summary').notNull(),
  risks: jsonb('risks').$type<string[]>().notNull(),
  importantChanges: jsonb('important_changes').$type<string[]>().notNull(),
  recommendations: jsonb('recommendations').$type<string[]>().notNull(),
  affectedModules: jsonb('affected_modules').$type<string[]>().notNull(),
  regressionAreas: jsonb('regression_areas').$type<string[]>().notNull(),
  testingPriorities: jsonb('testing_priorities').$type<string[]>().notNull(),
  riskLevel: text('risk_level').notNull(),
  blastRadius: jsonb('blast_radius').$type<{
    frontend: boolean,
    backend: boolean,
    database: boolean,
    infrastructure: boolean
  }>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    runIdUniqueIdx: uniqueIndex('ai_analysis_run_id_unique_idx').on(table.analysisRunId),
  };
});

export const generatedTestPlans = pgTable('generated_test_plans', {
  id: serial('id').primaryKey(),
  analysisRunId: integer('analysis_run_id').references(() => analysisRuns.id).notNull(),
  strategy: text('strategy').notNull(),
  testCases: jsonb('test_cases').$type<{
    title: string,
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    type: 'UNIT' | 'INTEGRATION' | 'E2E',
    scenario: string,
    expectedResult: string,
    sourceFiles: string[],
    impactArea: string,
    regressionRisk: string
  }[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    runIdUniqueIdx: uniqueIndex('generated_test_plans_run_id_unique_idx').on(table.analysisRunId),
  };
});

export const generatedPlaywrightTests = pgTable('generated_playwright_tests', {
  id: serial('id').primaryKey(),
  analysisRunId: integer('analysis_run_id').references(() => analysisRuns.id).notNull(),
  tests: jsonb('tests').$type<{
    title: string,
    category: 'SECURITY' | 'REGRESSION' | 'BUSINESS_FLOW',
    code: string
  }[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    runIdUniqueIdx: uniqueIndex('generated_playwright_tests_run_id_unique_idx').on(table.analysisRunId),
  };
});

export const testPrioritizations = pgTable('test_prioritizations', {
  id: serial('id').primaryKey(),
  analysisRunId: integer('analysis_run_id').references(() => analysisRuns.id).notNull(),
  rankedQueue: jsonb('ranked_queue').$type<{
    title: string,
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    reason: string
  }[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    runIdUniqueIdx: uniqueIndex('test_prioritizations_run_id_unique_idx').on(table.analysisRunId),
  };
});

export const coveragePredictions = pgTable('coverage_predictions', {
  id: serial('id').primaryKey(),
  analysisRunId: integer('analysis_run_id').references(() => analysisRuns.id).notNull(),
  estimatedCoverage: integer('estimated_coverage').notNull(),
  missingTests: jsonb('missing_tests').$type<string[]>().notNull(),
  riskScore: text('risk_score').$type<'LOW' | 'MEDIUM' | 'HIGH'>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    runIdUniqueIdx: uniqueIndex('coverage_predictions_run_id_unique_idx').on(table.analysisRunId),
  };
});

export const aiCallLogs = pgTable('ai_call_logs', {
  id: serial('id').primaryKey(),
  analysisRunId: integer('analysis_run_id').references(() => analysisRuns.id),
  providerUsed: text('provider_used').notNull(),
  modelName: text('model_name').notNull(),
  attempts: integer('attempts').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  status: text('status').notNull(), // 'SUCCESS' | 'FAILURE'
  errorMessage: text('error_message'),
  requestType: text('request_type').notNull(), // e.g., 'ANALYSIS', 'TEST_GEN'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const analysisRunsRelations = relations(analysisRuns, ({ many, one }) => ({
  findings: many(analysisFindings),
  ruleFindings: many(ruleFindings),
  aiAnalysis: one(aiAnalysis, {
    fields: [analysisRuns.id],
    references: [aiAnalysis.analysisRunId],
  }),
  testPlans: many(generatedTestPlans),
  playwrightTests: many(generatedPlaywrightTests),
  prioritizations: many(testPrioritizations),
  coveragePredictions: many(coveragePredictions),
  aiCallLogs: many(aiCallLogs),
}));

export const aiCallLogsRelations = relations(aiCallLogs, ({ one }) => ({
  run: one(analysisRuns, {
    fields: [aiCallLogs.analysisRunId],
    references: [analysisRuns.id],
  }),
}));

export const aiAnalysisRelations = relations(aiAnalysis, ({ one }) => ({
  run: one(analysisRuns, {
    fields: [aiAnalysis.analysisRunId],
    references: [analysisRuns.id],
  }),
}));

export const ruleFindingsRelations = relations(ruleFindings, ({ one }) => ({
  run: one(analysisRuns, {
    fields: [ruleFindings.analysisRunId],
    references: [analysisRuns.id],
  }),
}));

export const analysisFindingsRelations = relations(analysisFindings, ({ one }) => ({
  run: one(analysisRuns, {
    fields: [analysisFindings.analysisRunId],
    references: [analysisRuns.id],
  }),
}));

export const generatedTestPlansRelations = relations(generatedTestPlans, ({ one }) => ({
  run: one(analysisRuns, {
    fields: [generatedTestPlans.analysisRunId],
    references: [analysisRuns.id],
  }),
}));

export const generatedPlaywrightTestsRelations = relations(generatedPlaywrightTests, ({ one }) => ({
  run: one(analysisRuns, {
    fields: [generatedPlaywrightTests.analysisRunId],
    references: [analysisRuns.id],
  }),
}));

export const testPrioritizationsRelations = relations(testPrioritizations, ({ one }) => ({
  run: one(analysisRuns, {
    fields: [testPrioritizations.analysisRunId],
    references: [analysisRuns.id],
  }),
}));

export const coveragePredictionsRelations = relations(coveragePredictions, ({ one }) => ({
  run: one(analysisRuns, {
    fields: [coveragePredictions.analysisRunId],
    references: [analysisRuns.id],
  }),
}));

// Types
export type PRAnalysisRecord = typeof prAnalyses.$inferSelect;
export type NewPRAnalysis = typeof prAnalyses.$inferInsert;

export type AnalysisRunRecord = typeof analysisRuns.$inferSelect;
export type NewAnalysisRun = typeof analysisRuns.$inferInsert;

export type AnalysisFindingRecord = typeof analysisFindings.$inferSelect;
export type NewAnalysisFinding = typeof analysisFindings.$inferInsert;

export type RuleFindingRecord = typeof ruleFindings.$inferSelect;
export type NewRuleFinding = typeof ruleFindings.$inferInsert;

export type AIAnalysisRecord = typeof aiAnalysis.$inferSelect;
export type NewAIAnalysis = typeof aiAnalysis.$inferInsert;

export type GeneratedTestPlanRecord = typeof generatedTestPlans.$inferSelect;
export type NewGeneratedTestPlan = typeof generatedTestPlans.$inferInsert;

export type GeneratedPlaywrightTestRecord = typeof generatedPlaywrightTests.$inferSelect;
export type NewGeneratedPlaywrightTest = typeof generatedPlaywrightTests.$inferInsert;

export type CoveragePredictionRecord = typeof coveragePredictions.$inferSelect;
export type NewCoveragePrediction = typeof coveragePredictions.$inferInsert;

export type TestPrioritizationRecord = typeof testPrioritizations.$inferSelect;
export type NewTestPrioritization = typeof testPrioritizations.$inferInsert;

export type AICallLogRecord = typeof aiCallLogs.$inferSelect;
export type NewAICallLog = typeof aiCallLogs.$inferInsert;

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  verificationToken: text('verification_token'),
  verificationExpires: timestamp('verification_expires'),
  githubConnected: boolean('github_connected').default(false).notNull(),
  githubId: text('github_id').unique(),
  githubUsername: text('github_username'),
  githubAvatar: text('github_avatar'),
  githubAccessToken: text('github_access_token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions Table
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type UserRecord = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type SessionRecord = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
