import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import postgres from "postgres";

/**
 * Creates (or rotates the password of) the `deplyx_app` role — the RLS-
 * enforced request-path role every tenant-table policy in migration 0000 is
 * written against. Idempotent: safe to run on every deploy, not just once.
 *
 * Not a drizzle-kit migration, deliberately (architecture decision #1,
 * docs/plans/02-db-schema-rls.md) — migrations are static SQL files that
 * cannot read secrets, and committing a password to one is disqualifying.
 * `packages/db/src/schema/roles.ts` declares `pgRole("deplyx_app").existing()`
 * so the migration's policies/grants reference this role without trying to
 * create it themselves.
 *
 * Run against `DATABASE_URL` (the Neon owner connection) — creating and
 * altering roles needs owner/superuser-ish privileges `deplyx_app` itself
 * will never have.
 */

// scripts/ runs with cwd = packages/db; the root .env lives two levels up.
loadEnv({ path: resolve(process.cwd(), "../../.env") });

async function main(): Promise<void> {
  // Guards live inside main(), not at module scope, so the narrowing to
  // plain `string` actually holds where these values are used below — a
  // module-level `if (!x) throw` does not narrow `x` inside a function
  // declared afterward, since TS can't prove the closure runs before any
  // hypothetical reassignment.
  const databaseUrl = process.env.DATABASE_URL;
  const appDbPassword = process.env.APP_DB_PASSWORD;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required (owner connection, direct endpoint — see .env.example).",
    );
  }
  if (!appDbPassword) {
    throw new Error("APP_DB_PASSWORD is required — the password to create/rotate deplyx_app with.");
  }

  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  try {
    // CREATE ROLE / ALTER ROLE's PASSWORD clause only accepts a literal
    // (Postgres grammar: `PASSWORD Sconst`), never a bind parameter — a DO
    // block's body is one dollar-quoted string, so a `$1` placeholder inside
    // it would just be literal text, not substituted. So the password is
    // never string-concatenated by *this* code: it travels to Postgres as a
    // genuine bound parameter to `quote_literal()`, and only the resulting
    // pre-escaped, Postgres-produced literal is spliced into the DDL text
    // below. This is the standard safe pattern for dynamic DDL, not a DIY
    // escape.
    const rows = await sql<{ passwordLiteral: string }[]>`
      select quote_literal(${appDbPassword}) as "passwordLiteral"
    `;
    const row = rows[0];
    if (!row) {
      throw new Error("quote_literal() returned no rows — this should be unreachable.");
    }
    const { passwordLiteral } = row;

    await sql.unsafe(`
      DO $do$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'deplyx_app') THEN
          CREATE ROLE deplyx_app LOGIN NOBYPASSRLS PASSWORD ${passwordLiteral};
          RAISE NOTICE 'Created role deplyx_app.';
        ELSE
          ALTER ROLE deplyx_app PASSWORD ${passwordLiteral};
          RAISE NOTICE 'Role deplyx_app already existed — password reset to current APP_DB_PASSWORD.';
        END IF;
      END
      $do$;
    `);

    process.stdout.write("deplyx_app role is ready.\n");
  } finally {
    await sql.end();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
