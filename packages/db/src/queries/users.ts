import { eq } from "drizzle-orm";
import { users } from "../schema/index";
import type { TenantDb } from "../tenant";

/**
 * Requiring `db: TenantDb` (not a raw client type) is the compile-time half
 * of the tenant-isolation guarantee — RLS enforces it at the database, this
 * makes "forgot to scope this query" a type error instead of a runtime leak.
 */
export async function getCurrentUser(db: TenantDb) {
  const rows = await db.select().from(users);
  return rows[0];
}

export async function getUserById(db: TenantDb, id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id));
  return rows[0];
}
