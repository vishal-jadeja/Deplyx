import { eq } from "drizzle-orm";
import { githubInstallations } from "../schema/index.js";
import type { TenantDb } from "../tenant.js";

export async function listGithubInstallations(db: TenantDb) {
  return db.select().from(githubInstallations);
}

export async function getGithubInstallationById(db: TenantDb, id: string) {
  const rows = await db.select().from(githubInstallations).where(eq(githubInstallations.id, id));
  return rows[0];
}
