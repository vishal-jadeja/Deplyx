import {
  markGithubInstallationRemoved,
  markRepositoriesRemovedByInstallation,
  markRepositoryRemoved,
  type TenantDb,
  upsertGithubInstallation,
  upsertRepository,
  withTenant,
} from "@deplyx/db";
import { findInstallationOwner, findUserIdByGithubAccount, workerDb } from "@deplyx/db/worker";
import {
  getGithubWebhooks,
  getInstallationAccount,
  listInstallationRepositories,
} from "@deplyx/github";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * GitHub calls this endpoint directly, with no Deplyx session — every
 * handler below must resolve ownership itself (via `@deplyx/db/worker`,
 * one of this file's two vetted BYPASSRLS call sites, see the module
 * docstring on `packages/db/src/worker.ts`) before it can open a scoped
 * `withTenant` transaction for the actual write.
 *
 * Handlers are registered once at module load — Next.js keeps this module
 * warm across requests in the same server instance, so `.on()` doesn't
 * re-register per request.
 */
const webhooks = getGithubWebhooks();

async function syncInstallationRepositories(
  db: TenantDb,
  userId: string,
  installationDbId: string,
  installationId: number,
) {
  const repos = await listInstallationRepositories(installationId);
  for (const repo of repos) {
    await upsertRepository(db, {
      userId,
      installationId: installationDbId,
      githubRepoId: repo.githubRepoId,
      owner: repo.owner,
      name: repo.name,
      defaultBranch: repo.defaultBranch,
      private: repo.private,
    });
  }
}

webhooks.on("installation.created", async ({ payload }) => {
  const installationId = payload.installation.id;
  const userId = await findUserIdByGithubAccount(workerDb(), payload.sender.id);
  if (!userId) {
    // App installed by a GitHub identity that has never logged into Deplyx —
    // nothing to attribute this to yet. If the same user completes the
    // install-callback flow (they're mid-login when they click "Install"),
    // that route creates the row instead. Documented limitation, not a
    // silent failure: logged so it's visible, not swallowed.
    console.warn(
      `[github webhook] installation.created: no Deplyx account for GitHub user ${payload.sender.id} (installation ${installationId}) — skipping.`,
    );
    return;
  }

  const { accountLogin, accountType } = await getInstallationAccount(installationId);
  await withTenant(userId, async (db) => {
    const installation = await upsertGithubInstallation(db, {
      userId,
      installationId,
      accountLogin,
      accountType,
    });
    await syncInstallationRepositories(db, userId, installation.id, installationId);
  });
});

webhooks.on("installation.deleted", async ({ payload }) => {
  const installationId = payload.installation.id;
  const owner = await findInstallationOwner(workerDb(), installationId);
  if (!owner) {
    console.warn(
      `[github webhook] installation.deleted: unknown installation ${installationId} — skipping.`,
    );
    return;
  }

  await withTenant(owner.userId, async (db) => {
    await markGithubInstallationRemoved(db, installationId);
    await markRepositoriesRemovedByInstallation(db, owner.installationDbId);
  });
});

webhooks.on("installation_repositories.added", async ({ payload }) => {
  const installationId = payload.installation.id;
  const owner = await findInstallationOwner(workerDb(), installationId);
  if (!owner) {
    console.warn(
      `[github webhook] installation_repositories.added: unknown installation ${installationId} — skipping.`,
    );
    return;
  }

  await withTenant(owner.userId, async (db) => {
    await syncInstallationRepositories(db, owner.userId, owner.installationDbId, installationId);
  });
});

webhooks.on("installation_repositories.removed", async ({ payload }) => {
  const installationId = payload.installation.id;
  const owner = await findInstallationOwner(workerDb(), installationId);
  if (!owner) {
    console.warn(
      `[github webhook] installation_repositories.removed: unknown installation ${installationId} — skipping.`,
    );
    return;
  }

  await withTenant(owner.userId, async (db) => {
    for (const repo of payload.repositories_removed) {
      await markRepositoryRemoved(db, repo.id);
    }
  });
});

export async function POST(request: NextRequest) {
  const id = request.headers.get("x-github-delivery");
  const name = request.headers.get("x-github-event");
  const signature = request.headers.get("x-hub-signature-256");

  if (!id || !name || !signature) {
    return NextResponse.json({ error: "Missing required GitHub webhook headers" }, { status: 400 });
  }

  const payload = await request.text();

  try {
    await webhooks.verifyAndReceive({ id, name, payload, signature });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
