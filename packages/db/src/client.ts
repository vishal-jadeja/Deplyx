import { getEnv } from "@deplyx/shared/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema/index.js";

/**
 * The raw, unscoped app-role connection (`deplyx_app`, RLS-enforced by
 * Postgres) — module-private. Not exported from the package: with no
 * `app.user_id` set, every tenant-table policy denies everything (fail-
 * closed, not a leak — see `schema/rls.ts`), which makes direct use of this
 * outside `withTenant()` a silent-empty-result footgun rather than a data
 * leak. `withTenant()` (`tenant.ts`) is the only sanctioned way to query
 * through this connection.
 *
 * Both the client and the drizzle instance are constructed lazily — merely
 * importing this module (or `@deplyx/db`) must not throw just because
 * `APP_DATABASE_URL` isn't set yet, matching Phase 01's "env validated at
 * point of use, not at import time" decision.
 */
let sqlClient: Sql | undefined;

function getSqlClient(): Sql {
  if (!sqlClient) {
    // Pooled endpoint (unlike the direct one migrations run against,
    // decision 5) — Neon's pooler is transaction-mode, hence `prepare:
    // false` (no server-side prepared statements across pooled connections).
    sqlClient = postgres(getEnv().APP_DATABASE_URL, { prepare: false });
  }
  return sqlClient;
}

let appDb: ReturnType<typeof drizzle<typeof schema, Sql>> | undefined;

export function getAppDb() {
  if (!appDb) {
    appDb = drizzle(getSqlClient(), { schema });
  }
  return appDb;
}
