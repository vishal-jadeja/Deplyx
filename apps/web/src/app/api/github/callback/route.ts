import { upsertGithubInstallation, upsertRepository, withTenant } from "@deplyx/db";
import { getInstallationAccount, listInstallationRepositories } from "@deplyx/github";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";

/**
 * Where GitHub redirects the browser after "Install on selected repos"
 * (`https://github.com/apps/<slug>/installations/new`). The user is already
 * logged into Deplyx at this point (they clicked the install link from the
 * dashboard), so this is a normal session-scoped `withTenant` write — no
 * BYPASSRLS needed here, unlike the webhook handler.
 */
export async function GET(request: NextRequest) {
  const installationIdParam = request.nextUrl.searchParams.get("installation_id");
  const setupAction = request.nextUrl.searchParams.get("setup_action");

  if (!installationIdParam) {
    return NextResponse.json({ error: "Missing installation_id" }, { status: 400 });
  }
  if (setupAction === "request") {
    // The installation is pending approval from an org owner — nothing to
    // sync yet.
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const installationId = Number(installationIdParam);
  const userId = await requireUserId();
  const { accountLogin, accountType } = await getInstallationAccount(installationId);

  await withTenant(userId, async (db) => {
    const installation = await upsertGithubInstallation(db, {
      userId,
      installationId,
      accountLogin,
      accountType,
    });

    const repos = await listInstallationRepositories(installationId);
    for (const repo of repos) {
      await upsertRepository(db, {
        userId,
        installationId: installation.id,
        githubRepoId: repo.githubRepoId,
        owner: repo.owner,
        name: repo.name,
        defaultBranch: repo.defaultBranch,
        private: repo.private,
      });
    }
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
