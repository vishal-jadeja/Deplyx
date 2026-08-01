import { and, eq, isNull } from "drizzle-orm";
import { githubInstallations } from "../schema/index";
import type { TenantDb } from "../tenant";

/** Excludes installations the user has uninstalled — see `removedAt`'s docstring in the schema. */
export async function listGithubInstallations(db: TenantDb) {
  return db.select().from(githubInstallations).where(isNull(githubInstallations.removedAt));
}

export async function getGithubInstallationById(db: TenantDb, id: string) {
  const rows = await db.select().from(githubInstallations).where(eq(githubInstallations.id, id));
  return rows[0];
}

export interface UpsertGithubInstallationInput {
  userId: string;
  installationId: number;
  accountLogin: string;
  accountType: string;
}

/**
 * Creates the installation row, or — if it already exists (the callback
 * route and the `installation.created` webhook can both race to create the
 * same one) — clears `removedAt`/`suspendedAt` and refreshes the account
 * info, without touching `created_at` or `id`.
 */
export async function upsertGithubInstallation(db: TenantDb, input: UpsertGithubInstallationInput) {
  const rows = await db
    .insert(githubInstallations)
    .values(input)
    .onConflictDoUpdate({
      target: githubInstallations.installationId,
      set: {
        accountLogin: input.accountLogin,
        accountType: input.accountType,
        removedAt: null,
        suspendedAt: null,
      },
    })
    .returning();
  const row = rows[0];
  if (!row) {
    throw new Error("upsertGithubInstallation: insert/update returned no row — unreachable.");
  }
  return row;
}

/** Soft-marks the installation removed — see `removedAt`'s docstring in the schema. */
export async function markGithubInstallationRemoved(db: TenantDb, installationId: number) {
  await db
    .update(githubInstallations)
    .set({ removedAt: new Date() })
    .where(
      and(
        eq(githubInstallations.installationId, installationId),
        isNull(githubInstallations.removedAt),
      ),
    );
}
