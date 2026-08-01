import { and, eq } from "drizzle-orm";
import { accounts, githubInstallations } from "../schema/index";
import type { workerDb } from "../worker";

/**
 * Cross-tenant lookups for callers that don't yet have a resolved `userId`
 * to open a `withTenant()` transaction with — the two Phase 03 cases: a
 * GitHub webhook has no Deplyx session, so it must resolve ownership first
 * before it can scope the actual write. Takes the raw worker db explicitly
 * (never a branded `TenantDb`) so the type signature itself flags these as
 * cross-tenant; callers must already be one of the vetted `@deplyx/db/worker`
 * import sites (see `worker.ts`'s docstring).
 */
type WorkerDb = ReturnType<typeof workerDb>;

/**
 * Resolves a GitHub user id (from a webhook's `sender`) to our internal
 * `users.id` via the Auth.js `accounts` table. Returns `undefined` if that
 * GitHub identity has never logged into Deplyx — the caller's job to decide
 * what "unattributed" means for its event.
 */
export async function findUserIdByGithubAccount(
  db: WorkerDb,
  githubUserId: number,
): Promise<string | undefined> {
  const rows = await db
    .select({ userId: accounts.userId })
    .from(accounts)
    .where(
      and(eq(accounts.provider, "github"), eq(accounts.providerAccountId, String(githubUserId))),
    );
  return rows[0]?.userId;
}

/**
 * Resolves an existing `github_installations` row's owning `userId` from
 * GitHub's numeric `installation_id` — used by webhook handlers for events
 * on an installation we already know about (deleted, repos added/removed),
 * where the row's own `user_id` is the ownership source of truth rather
 * than re-deriving it from `accounts`.
 */
export async function findInstallationOwner(
  db: WorkerDb,
  installationId: number,
): Promise<{ userId: string; installationDbId: string } | undefined> {
  const rows = await db
    .select({ userId: githubInstallations.userId, installationDbId: githubInstallations.id })
    .from(githubInstallations)
    .where(eq(githubInstallations.installationId, installationId));
  return rows[0];
}
