import { pgTable, serial, text, integer, timestamp, jsonb, uniqueIndex, unique } from 'drizzle-orm/pg-core';

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

export type PRAnalysisRecord = typeof prAnalyses.$inferSelect;
export type NewPRAnalysis = typeof prAnalyses.$inferInsert;
