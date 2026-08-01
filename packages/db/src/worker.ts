import { getEnv } from "@deplyx/shared/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema/index";

/**
 * Cross-tenant, RLS-bypassing client — lives at a separate package
 * entrypoint (`@deplyx/db/worker`) so Biome's `noRestrictedImports` rule can
 * ban it everywhere except a short, named allowlist, not just by convention.
 * Three legitimate call sites (decision #6, docs/plans/02-db-schema-rls.md,
 * widened in Phase 03 — see docs/plans/03-auth-github-app.md "Decisions
 * made"):
 *   - `apps/web/src/trigger/**` (Trigger.dev tasks) — the original,
 *     genuinely cross-tenant background-job case (e.g. feed-poll fan-out).
 *   - `apps/web/src/auth.ts` — Auth.js's adapter tables (`accounts`,
 *     `sessions`, `verification_tokens`) have zero grants to `deplyx_app`
 *     and no RLS policies at all; `users` itself needs a bypass too, since
 *     account creation has no `app.user_id` to scope by yet. Login is a
 *     request-time operation, not a Trigger.dev task, so it needs this
 *     client directly rather than going through `withTenant`.
 *   - `apps/web/src/app/api/github/webhooks/route.ts` — GitHub calls this
 *     endpoint with no Deplyx session; it must resolve an installation's
 *     owning `user_id` (or correlate a GitHub account id via `accounts`)
 *     before it can open a properly scoped `withTenant` transaction for the
 *     actual write.
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

export * from "./queries/admin";
