CREATE TABLE "ai_call_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"analysis_run_id" integer,
	"provider_used" text NOT NULL,
	"model_name" text NOT NULL,
	"attempts" integer NOT NULL,
	"latency_ms" integer NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"request_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "ai_call_logs" ADD CONSTRAINT "ai_call_logs_analysis_run_id_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;