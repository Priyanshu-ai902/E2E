import { pgTable, serial, text, integer, timestamp, jsonb, uniqueIndex, unique } from 'drizzle-orm/pg-core';
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

export const analysisRuns = pgTable('analysis_runs', {
  id: serial('id').primaryKey(),
  repoOwner: text('repo_owner').notNull(),
  repoName: text('repo_name').notNull(),
  prNumber: integer('pr_number').notNull(),
  commitSha: text('commit_sha').notNull(),
  summary: text('summary'),
  securityScore: integer('security_score').notNull(),
  performanceScore: integer('performance_score').notNull(),
  architectureScore: integer('architecture_score').notNull(),
  overallScore: integer('overall_score').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const analysisFindings = pgTable('analysis_findings', {
  id: serial('id').primaryKey(),
  analysisRunId: integer('analysis_run_id').references(() => analysisRuns.id).notNull(),
  category: text('category').notNull(), // 'security' | 'performance' | 'architecture'
  severity: text('severity').notNull(), // 'low' | 'medium' | 'high' | 'critical'
  confidence: integer('confidence').notNull(), // 0-100
  title: text('title').notNull(),
  description: text('description').notNull(),
  file: text('file'),
  line: integer('line'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const analysisRunsRelations = relations(analysisRuns, ({ many }) => ({
  findings: many(analysisFindings),
}));

export const analysisFindingsRelations = relations(analysisFindings, ({ one }) => ({
  run: one(analysisRuns, {
    fields: [analysisFindings.analysisRunId],
    references: [analysisRuns.id],
  }),
}));

export type PRAnalysisRecord = typeof prAnalyses.$inferSelect;
export type NewPRAnalysis = typeof prAnalyses.$inferInsert;

export type AnalysisRunRecord = typeof analysisRuns.$inferSelect;
export type NewAnalysisRun = typeof analysisRuns.$inferInsert;

export type AnalysisFindingRecord = typeof analysisFindings.$inferSelect;
export type NewAnalysisFinding = typeof analysisFindings.$inferInsert;
