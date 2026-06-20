CREATE TABLE "coverage_predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"analysis_run_id" integer NOT NULL,
	"estimated_coverage" integer NOT NULL,
	"missing_tests" jsonb NOT NULL,
	"risk_score" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_playwright_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"analysis_run_id" integer NOT NULL,
	"tests" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_test_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"analysis_run_id" integer NOT NULL,
	"strategy" text NOT NULL,
	"test_cases" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_prioritizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"analysis_run_id" integer NOT NULL,
	"ranked_queue" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coverage_predictions" ADD CONSTRAINT "coverage_predictions_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_playwright_tests" ADD CONSTRAINT "generated_playwright_tests_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_test_plans" ADD CONSTRAINT "generated_test_plans_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_prioritizations" ADD CONSTRAINT "test_prioritizations_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;