import { and, eq, isNull } from "drizzle-orm";
import { repositories } from "../schema/index";
import type { TenantDb } from "../tenant";

/** Excludes repos dropped from their installation — see `removedAt`'s docstring in the schema. */
export async function listRepositories(db: TenantDb) {
  return db.select().from(repositories).where(isNull(repositories.removedAt));
}

export async function getRepositoryById(db: TenantDb, id: string) {
  const rows = await db.select().from(repositories).where(eq(repositories.id, id));
  return rows[0];
}

export interface UpsertRepositoryInput {
  userId: string;
  installationId: string;
  githubRepoId: number;
  owner: string;
  name: string;
  defaultBranch: string;
  private: boolean;
}

/**
 * Creates the repo row, or clears `removedAt` and refreshes its metadata if
 * it already exists (covers both a fresh sync and a previously-removed repo
 * being re-added via `installation_repositories.added`).
 */
export async function upsertRepository(db: TenantDb, input: UpsertRepositoryInput) {
  const rows = await db
    .insert(repositories)
    .values(input)
    .onConflictDoUpdate({
      target: repositories.githubRepoId,
      set: {
        owner: input.owner,
        name: input.name,
        defaultBranch: input.defaultBranch,
        private: input.private,
        removedAt: null,
      },
    })
    .returning();
  const row = rows[0];
  if (!row) {
    throw new Error("upsertRepository: insert/update returned no row — unreachable.");
  }
  return row;
}

/** Soft-marks every repo under an installation removed — the App-uninstall cascade. */
export async function markRepositoriesRemovedByInstallation(db: TenantDb, installationId: string) {
  await db
    .update(repositories)
    .set({ removedAt: new Date() })
    .where(and(eq(repositories.installationId, installationId), isNull(repositories.removedAt)));
}

/** Soft-marks a single repo removed — `installation_repositories.removed` (App still installed). */
export async function markRepositoryRemoved(db: TenantDb, githubRepoId: number) {
  await db
    .update(repositories)
    .set({ removedAt: new Date() })
    .where(and(eq(repositories.githubRepoId, githubRepoId), isNull(repositories.removedAt)));
}
