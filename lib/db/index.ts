import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Prevent repeated validation in dev and serverless environments
const globalForDb = globalThis as unknown as { __db_validated?: boolean };

// Startup validation to log missing tables
export async function validateSchema() {
  if (globalForDb.__db_validated) {
    return;
  }
  
  const tables = [
    'pr_analyses',
    'analysis_runs',
    'analysis_findings',
    'generated_test_plans',
    'generated_playwright_tests',
    'coverage_predictions',
    'test_prioritizations'
  ];
  
  console.log("🔍 Validating database schema...");
  
  for (const table of tables) {
    try {
      // Use tagged template for Neon SQL calls to avoid deprecation warnings
      // Note: Table names cannot be parameters in standard SQL, but here we are checking existence
      // Since these are hardcoded table names from our list, it's safe.
      if (table === 'pr_analyses') await sql`SELECT 1 FROM pr_analyses LIMIT 1`;
      else if (table === 'analysis_runs') await sql`SELECT 1 FROM analysis_runs LIMIT 1`;
      else if (table === 'analysis_findings') await sql`SELECT 1 FROM analysis_findings LIMIT 1`;
      else if (table === 'generated_test_plans') await sql`SELECT 1 FROM generated_test_plans LIMIT 1`;
      else if (table === 'generated_playwright_tests') await sql`SELECT 1 FROM generated_playwright_tests LIMIT 1`;
      else if (table === 'coverage_predictions') await sql`SELECT 1 FROM coverage_predictions LIMIT 1`;
      else if (table === 'test_prioritizations') await sql`SELECT 1 FROM test_prioritizations LIMIT 1`;
    } catch (error: any) {
      if (error.code === '42P01') {
        console.error(`❌ Database validation failed: Table "${table}" is missing (Postgres Error 42P01).`);
      } else {
        console.warn(`⚠️ Database validation warning for table "${table}":`, error.message);
      }
    }
  }

  globalForDb.__db_validated = true;
  console.log("✅ Database schema validation complete.");
}
