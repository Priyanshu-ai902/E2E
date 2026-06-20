import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not defined in environment variables.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  console.log("Auditing users table in Neon database...");
  try {
    // 1. Get count of users
    const usersCountRes = await sql`SELECT COUNT(*)::integer as count FROM users`;
    console.log(`Total users: ${usersCountRes[0].count}`);

    // 2. Get list of users with their GitHub IDs
    const usersRes = await sql`
      SELECT id, name, email, github_connected, github_id, github_username 
      FROM users
    `;
    console.log("Users in database:");
    console.log(JSON.stringify(usersRes, null, 2));

    // 3. Specifically search for github_id = '146703385'
    const conflictingUser = await sql`
      SELECT id, name, email, github_id, github_username 
      FROM users 
      WHERE github_id = '146703385'
    `;
    if (conflictingUser.length > 0) {
      console.log(`⚠️ FOUND CONFLICTING USER for github_id '146703385':`);
      console.log(JSON.stringify(conflictingUser[0], null, 2));
    } else {
      console.log("✅ No conflicting user found for github_id '146703385'");
    }

  } catch (err) {
    console.error("Audit failed:", err);
  }
}

run();
