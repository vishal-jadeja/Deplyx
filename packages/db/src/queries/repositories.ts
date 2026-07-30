import { eq } from "drizzle-orm";
import { repositories } from "../schema/index.js";
import type { TenantDb } from "../tenant.js";

export async function listRepositories(db: TenantDb) {
  return db.select().from(repositories);
}

export async function getRepositoryById(db: TenantDb, id: string) {
  const rows = await db.select().from(repositories).where(eq(repositories.id, id));
  return rows[0];
}
