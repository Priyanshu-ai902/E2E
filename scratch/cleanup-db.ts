import * as dotenv from 'dotenv';
dotenv.config();

import { sql } from 'drizzle-orm';

async function cleanup() {
  console.log("Cleaning up duplicate downstream rows dynamically...");
  
  // Dynamic import to prevent hoisting before dotenv loads
  const { db } = await import('../lib/db/index');

  await db.execute(sql`
    DELETE FROM coverage_predictions 
    WHERE id NOT IN (
      SELECT MAX(id) 
      FROM coverage_predictions 
      GROUP BY analysis_run_id
    )
  `);
  console.log("Cleaned coverage_predictions");

  await db.execute(sql`
    DELETE FROM ai_analysis 
    WHERE id NOT IN (
      SELECT MAX(id) 
      FROM ai_analysis 
      GROUP BY analysis_run_id
    )
  `);
  console.log("Cleaned ai_analysis");

  await db.execute(sql`
    DELETE FROM generated_test_plans 
    WHERE id NOT IN (
      SELECT MAX(id) 
      FROM generated_test_plans 
      GROUP BY analysis_run_id
    )
  `);
  console.log("Cleaned generated_test_plans");

  await db.execute(sql`
    DELETE FROM generated_playwright_tests 
    WHERE id NOT IN (
      SELECT MAX(id) 
      FROM generated_playwright_tests 
      GROUP BY analysis_run_id
    )
  `);
  console.log("Cleaned generated_playwright_tests");

  await db.execute(sql`
    DELETE FROM test_prioritizations 
    WHERE id NOT IN (
      SELECT MAX(id) 
      FROM test_prioritizations 
      GROUP BY analysis_run_id
    )
  `);
  console.log("Cleaned test_prioritizations");

  console.log("Duplicate cleanup complete!");
}

cleanup().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
