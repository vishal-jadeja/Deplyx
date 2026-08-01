import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, describe, expect, it, vi } from "vitest";
import { findings, users } from "../src/schema/index";
import { SEED_USERS } from "../src/seed-fixtures";
import { withTenant } from "../src/tenant";
import { workerDb } from "../src/worker";

// test/ runs with cwd = packages/db; the root .env lives two levels up.
loadEnv({ path: resolve(process.cwd(), "../../.env") });

// Live Neon over WAN: the first test pays cold TCP+TLS+auth (and possibly a
// compute wake) before its first row comes back — vitest's default 5s budget
// is too tight for that. Applies per-test, generous on purpose; a genuine
// hang still fails, just slower.
vi.setConfig({ testTimeout: 30_000 });

/**
 * This is a live-database integration test, not a mock — it's the whole
 * point of the phase (see docs/plans/02-db-schema-rls.md, acceptance
 * criteria). Skipped, not failed, when DATABASE_URL isn't set (user
 * decision this session) so a clean checkout with no `.env` still passes
 * `pnpm test`; wherever credentials *are* present, it runs for real and
 * fails loudly. Requires `pnpm db:role && pnpm db:migrate && pnpm db:seed`
 * to have already been run against the target database.
 */
describe.skipIf(!process.env.DATABASE_URL)("RLS isolation (live Neon project)", () => {
  const ownerSql = postgres(
    // biome-ignore lint/style/noNonNullAssertion: describe.skipIf above guarantees this is set whenever the block actually runs.
    process.env.DATABASE_URL!,
    { prepare: false, max: 1 },
  );

  afterAll(async () => {
    await ownerSql.end();
  });

  async function getSeedUserId(email: string): Promise<string> {
    const rows = await workerDb().select().from(users).where(eq(users.email, email));
    const row = rows[0];
    if (!row) {
      throw new Error(
        `Seed user ${email} not found — run "pnpm db:role && pnpm db:migrate && pnpm db:seed" first.`,
      );
    }
    return row.id;
  }

  it("case 1: withTenant(A) returns exactly A's findings, zero of B's", async () => {
    // biome-ignore lint/style/noNonNullAssertion: SEED_USERS is a fixed 2-element tuple.
    const alice = SEED_USERS[0]!;
    // biome-ignore lint/style/noNonNullAssertion: SEED_USERS is a fixed 2-element tuple.
    const bob = SEED_USERS[1]!;
    const aliceId = await getSeedUserId(alice.email);
    const bobId = await getSeedUserId(bob.email);

    const rows = await withTenant(aliceId, (db) => db.select().from(findings));

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.userId === aliceId)).toBe(true);
    expect(rows.some((r) => r.userId === bobId)).toBe(false);
    expect(rows.some((r) => r.matchedValue === alice.matchedValue)).toBe(true);
    expect(rows.some((r) => r.matchedValue === bob.matchedValue)).toBe(false);
  });

  it("case 2: the worker client sees both tenants' findings — it genuinely bypasses RLS", async () => {
    // biome-ignore lint/style/noNonNullAssertion: SEED_USERS is a fixed 2-element tuple.
    const alice = SEED_USERS[0]!;
    // biome-ignore lint/style/noNonNullAssertion: SEED_USERS is a fixed 2-element tuple.
    const bob = SEED_USERS[1]!;

    const rows = await workerDb().select().from(findings);
    const matchedValues = rows.map((r) => r.matchedValue);

    expect(matchedValues).toContain(alice.matchedValue);
    expect(matchedValues).toContain(bob.matchedValue);
  });

  it("case 3a: a raw owner-role connection sees both tenants' findings", async () => {
    // biome-ignore lint/style/noNonNullAssertion: SEED_USERS is a fixed 2-element tuple.
    const alice = SEED_USERS[0]!;
    // biome-ignore lint/style/noNonNullAssertion: SEED_USERS is a fixed 2-element tuple.
    const bob = SEED_USERS[1]!;
    const ownerDb = drizzle(ownerSql, { schema: { findings } });

    const rows = await ownerDb.select().from(findings);
    const matchedValues = rows.map((r) => r.matchedValue);

    expect(matchedValues).toContain(alice.matchedValue);
    expect(matchedValues).toContain(bob.matchedValue);
  });

  it("case 3b: the app client is provably deplyx_app, not the owner — the specific failure mode this guards", async () => {
    // biome-ignore lint/style/noNonNullAssertion: SEED_USERS is a fixed 2-element tuple.
    const alice = SEED_USERS[0]!;
    const aliceId = await getSeedUserId(alice.email);

    await withTenant(aliceId, async (db) => {
      const rows = await db.execute<{ current_user: string; rolbypassrls: boolean }>(
        sql`select current_user, rolbypassrls from pg_roles where rolname = current_user`,
      );
      const row = rows[0];
      if (!row) throw new Error("pg_roles lookup returned no rows — unreachable.");

      // This fails loudly the moment APP_DATABASE_URL is ever repointed at
      // the owner (or any BYPASSRLS role) — the exact misconfiguration the
      // brief asked this suite to guard against.
      expect(row.current_user).toBe("deplyx_app");
      expect(row.rolbypassrls).toBe(false);
    });
  });
});
