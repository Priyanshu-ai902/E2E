CREATE TABLE "ai_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"analysis_run_id" integer NOT NULL,
	"summary" text NOT NULL,
	"risks" jsonb NOT NULL,
	"important_changes" jsonb NOT NULL,
	"recommendations" jsonb NOT NULL,
	"affected_modules" jsonb NOT NULL,
	"regression_areas" jsonb NOT NULL,
	"testing_priorities" jsonb NOT NULL,
	"risk_level" text NOT NULL,
	"blast_radius" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rule_findings" (
	"id" serial PRIMARY KEY NOT NULL,
	"analysis_run_id" integer NOT NULL,
	"category" text NOT NULL,
	"severity" text NOT NULL,
	"confidence" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"file" text,
	"line" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "status" text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_analysis" ADD CONSTRAINT "ai_analysis_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rule_findings" ADD CONSTRAINT "rule_findings_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;