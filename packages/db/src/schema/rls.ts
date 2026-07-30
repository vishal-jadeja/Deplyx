import { type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

/**
 * Fail-closed tenant predicate shared by every `USING`/`WITH CHECK` clause.
 *
 * `current_setting('app.user_id', true)` — the `true` (missing_ok) makes an
 * unset session var return SQL NULL instead of raising. `nullif(..., '')`
 * turns an empty string into NULL too. `NULL = anything` evaluates to NULL,
 * which Postgres treats as "does not satisfy" for both USING and WITH CHECK.
 * So a connection that never called `withTenant()` reads and writes exactly
 * zero rows — it does not throw a 500, and it does not see everyone's data.
 * See docs/plans/02-db-schema-rls.md, design decision #1.
 */
export function tenantPredicate(userIdColumn: AnyPgColumn): SQL {
  return sql`${userIdColumn} = nullif(current_setting('app.user_id', true), '')::uuid`;
}
