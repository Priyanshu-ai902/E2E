ALTER TABLE "analysis_runs" ADD COLUMN "retry_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "last_error" text;--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "last_attempt_at" timestamp;