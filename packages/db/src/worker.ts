import { getEnv } from "@deplyx/shared/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema/index.js";

/**
 * Cross-tenant, RLS-bypassing client for Trigger.dev tasks only (decision
 * #6, docs/plans/02-db-schema-rls.md) — lives at a separate package
 * entrypoint (`@deplyx/db/worker`) so Biome's `noRestrictedImports` rule can
 * ban it everywhere except `apps/web/src/trigger/**` at lint time, not just
 * by convention.
 *
 * Connects on `WORKER_DATABASE_URL`, the Neon owner credential
 * (`rolbypassrls = true`, confirmed against the live project this phase) —
 * `FORCE ROW LEVEL SECURITY` on every tenant table has no effect on a role
 * with that attribute set directly.
 *
 * `workerDb()` is a function, not a plain exported instance, so importing
 * this module never throws just from being imported — construction (and
 * the `getEnv()` read behind it) is deferred to first call. This matters
 * because `packages/db/test/rls.test.ts` is env-gated
 * (`describe.skipIf(!process.env.DATABASE_URL)`): the test *file* still
 * gets imported on a clean checkout with no `.env`, and an eager top-level
 * `postgres(getEnv().WORKER_DATABASE_URL)` would throw before `skipIf` ever
 * gets a chance to skip anything.
 */
let client: Sql | undefined;

function getClient(): Sql {
  if (!client) {
    client = postgres(getEnv().WORKER_DATABASE_URL, { prepare: false });
  }
  return client;
}

let db: ReturnType<typeof drizzle<typeof schema, Sql>> | undefined;

export function workerDb() {
  if (!db) {
    db = drizzle(getClient(), { schema });
  }
  return db;
}
