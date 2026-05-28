CREATE TABLE "pr_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"repo_owner" text NOT NULL,
	"repo_name" text NOT NULL,
	"pr_number" integer NOT NULL,
	"commit_sha" text NOT NULL,
	"pr_title" text NOT NULL,
	"summary" text NOT NULL,
	"risks" jsonb NOT NULL,
	"important_changes" jsonb NOT NULL,
	"recommendations" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pr_analyses_repo_owner_repo_name_pr_number_commit_sha_unique" UNIQUE("repo_owner","repo_name","pr_number","commit_sha")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "owner_name_pr_idx" ON "pr_analyses" USING btree ("repo_owner","repo_name","pr_number");