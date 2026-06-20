ALTER TABLE "analysis_runs" ADD COLUMN "risks" jsonb;--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "important_changes" jsonb;--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "recommendations" jsonb;--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "affected_modules" jsonb;--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "regression_areas" jsonb;--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "testing_priorities" jsonb;--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "blast_radius" jsonb;--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "risk_level" text;