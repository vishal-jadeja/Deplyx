import { and, eq, isNull } from "drizzle-orm";
import { findings } from "../schema/index";
import type { TenantDb } from "../tenant";

export async function listFindingsForRepository(db: TenantDb, repositoryId: string) {
  return db.select().from(findings).where(eq(findings.repositoryId, repositoryId));
}

/** Unresolved (`resolved_at IS NULL`) findings only — the dashboard's default view. */
export async function listActiveFindingsForRepository(db: TenantDb, repositoryId: string) {
  return db
    .select()
    .from(findings)
    .where(and(eq(findings.repositoryId, repositoryId), isNull(findings.resolvedAt)));
}

export async function getFindingById(db: TenantDb, id: string) {
  const rows = await db.select().from(findings).where(eq(findings.id, id));
  return rows[0];
}
