import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

/**
 * Applies pending migrations from `./drizzle` against `DATABASE_URL` (the
 * Neon owner connection, direct endpoint — not the pooler; DDL over a
 * transaction-mode pooler is a known source of odd failures, decision 5 in
 * docs/plans/02-db-schema-rls.md). Owner privileges are required: creating
 * tables, policies, and grants referencing `deplyx_app` isn't something
 * that role itself could ever do.
 */

// scripts/ runs with cwd = packages/db; the root .env lives two levels up.
loadEnv({ path: resolve(process.cwd(), "../../.env") });

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required (owner connection, direct endpoint — see .env.example).",
    );
  }

  const sql = postgres(databaseUrl, { prepare: false, max: 1 });
  const db = drizzle(sql);

  try {
    await migrate(db, { migrationsFolder: resolve(process.cwd(), "drizzle") });
    process.stdout.write("Migrations applied.\n");
  } finally {
    await sql.end();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
