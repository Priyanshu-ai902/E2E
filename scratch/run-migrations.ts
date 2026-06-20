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
  console.log("Running custom migration script...");
  try {
    // Check if users table already exists
    const usersExist = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    
    if (usersExist[0].exists) {
      console.log("Users table already exists, skipping user & session table creation.");
    } else {
      console.log("Creating users table...");
      await sql`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" serial PRIMARY KEY NOT NULL,
          "name" text,
          "email" text NOT NULL,
          "password_hash" text,
          "email_verified" boolean DEFAULT false NOT NULL,
          "verification_token" text,
          "verification_expires" timestamp,
          "github_connected" boolean DEFAULT false NOT NULL,
          "github_id" text,
          "github_username" text,
          "github_avatar" text,
          "github_access_token" text,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL,
          CONSTRAINT "users_email_unique" UNIQUE("email"),
          CONSTRAINT "users_github_id_unique" UNIQUE("github_id")
        );
      `;
      console.log("Users table created successfully.");
      
      console.log("Creating sessions table...");
      await sql`
        CREATE TABLE IF NOT EXISTS "sessions" (
          "id" text PRIMARY KEY NOT NULL,
          "user_id" integer NOT NULL,
          "token" text NOT NULL,
          "expires_at" timestamp NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          CONSTRAINT "sessions_token_unique" UNIQUE("token")
        );
      `;
      console.log("Sessions table created successfully.");
      
      console.log("Adding foreign key constraint...");
      await sql`
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
      `;
      console.log("Constraint added successfully.");
    }
    
    console.log("Migration finished successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
