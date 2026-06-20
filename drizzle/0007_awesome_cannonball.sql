CREATE UNIQUE INDEX "ai_analysis_run_id_unique_idx" ON "ai_analysis" USING btree ("analysis_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coverage_predictions_run_id_unique_idx" ON "coverage_predictions" USING btree ("analysis_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "generated_playwright_tests_run_id_unique_idx" ON "generated_playwright_tests" USING btree ("analysis_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "generated_test_plans_run_id_unique_idx" ON "generated_test_plans" USING btree ("analysis_run_id");--> statement-breakpoint
CREATE UNIQUE INDEX "test_prioritizations_run_id_unique_idx" ON "test_prioritizations" USING btree ("analysis_run_id");