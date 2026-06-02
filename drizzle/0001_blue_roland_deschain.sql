CREATE TABLE "analysis_findings" (
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
CREATE TABLE "analysis_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"repo_owner" text NOT NULL,
	"repo_name" text NOT NULL,
	"pr_number" integer NOT NULL,
	"commit_sha" text NOT NULL,
	"summary" text,
	"security_score" integer NOT NULL,
	"performance_score" integer NOT NULL,
	"architecture_score" integer NOT NULL,
	"overall_score" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_findings" ADD CONSTRAINT "analysis_findings_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;