import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit is invoked with cwd = packages/db; the root .env lives two
// levels up. Loaded explicitly rather than relying on cwd-relative dotenv
// defaults (Phase 01 decision: env is validated/read lazily, at point of
// use). `process.cwd()`, not `import.meta.dirname` — drizzle-kit loads this
// config through its own esbuild transform, which does not reliably
// preserve `import.meta.dirname`.
loadEnv({ path: resolve(process.cwd(), "../../.env") });

// Migrations run against the Neon *direct* (non-pooler) endpoint via the
// owner credential — DDL over a transaction-mode pooler is a known source of
// odd failures (see docs/plans/02-db-schema-rls.md, decision 5). This is
// deliberately DATABASE_URL, not APP_DATABASE_URL: drizzle-kit needs owner
// privileges to create tables, policies, and grants.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required to run drizzle-kit (owner connection, direct endpoint — see .env.example).",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
  // Emits `pgRole(...).existing()` references correctly and lets drizzle-kit
  // reason about roles referenced by policies without trying to CREATE them.
  entities: {
    roles: true,
  },
  verbose: true,
  strict: true,
});
