import { sql } from "drizzle-orm";
import { getAppDb } from "./client";

// Unique brand so TenantDb can only ever be produced inside withTenant().
declare const TENANT_BRAND: unique symbol;

/**
 * The parameter type of `db.transaction()`'s callback, derived structurally
 * (not hand-typed) so it always matches whatever drizzle-orm's own
 * transaction wrapper actually produces for this schema/driver pairing.
 */
type AppDb = ReturnType<typeof getAppDb>;
type RawTenantDb = Parameters<Parameters<AppDb["transaction"]>[0]>[0];

/**
 * A drizzle db handle provably scoped to one tenant's `app.user_id` — the
 * *only* way to obtain one is through `withTenant()` below, which sets the
 * RLS session variable before handing the handle to your callback. No
 * exported factory in this package returns a `TenantDb` any other way
 * (design decision #5, docs/plans/02-db-schema-rls.md) — every tenant-table
 * query helper requires this type, so passing the raw app client, or
 * forgetting to scope at all, is a compile error, not a runtime data leak.
 */
export type TenantDb = RawTenantDb & { readonly [TENANT_BRAND]: true };

/**
 * Opens a transaction, sets `app.user_id` for the lifetime of that
 * transaction only (`SET LOCAL`, via `set_config`'s third argument — a
 * genuine bound parameter, never string-interpolated SQL), runs `fn` with a
 * branded `TenantDb`, and commits. Every row the callback can see or write
 * is exactly this user's, enforced by Postgres RLS on the `deplyx_app` role
 * — not an application-level `WHERE user_id = ...` anyone could forget.
 *
 * `userId` is trusted as-is by design: callers (the auth layer, Phase 03)
 * are responsible for having already verified it's the caller's own id.
 * `withTenant` only enforces that whichever id is passed in is the *only*
 * tenant's data reachable for the lifetime of `fn`.
 */
export async function withTenant<T>(userId: string, fn: (db: TenantDb) => Promise<T>): Promise<T> {
  const db = getAppDb();
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
    return fn(tx as TenantDb);
  });
}
