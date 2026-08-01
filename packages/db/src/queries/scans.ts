import { eq } from "drizzle-orm";
import { scans } from "../schema/index";
import type { TenantDb } from "../tenant";

export async function listScansForRepository(db: TenantDb, repositoryId: string) {
  return db.select().from(scans).where(eq(scans.repositoryId, repositoryId));
}

export async function getScanById(db: TenantDb, id: string) {
  const rows = await db.select().from(scans).where(eq(scans.id, id));
  return rows[0];
}
