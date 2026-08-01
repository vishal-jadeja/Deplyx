import { listGithubInstallations, withTenant } from "@deplyx/db";
import { getEnv } from "@deplyx/shared/env";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

/**
 * Intentionally unstyled — the real dashboard UI (cross-repo severity view,
 * per-repo findings) lands in Phase 06. This exists so Phase 03's install
 * flow has an authenticated page to link from and land on.
 */
export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const installations = await withTenant(userId, (db) => listGithubInstallations(db));
  const appSlug = getEnv().GITHUB_APP_SLUG;
  const installUrl = appSlug ? `https://github.com/apps/${appSlug}/installations/new` : undefined;

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Signed in as {session.user?.email ?? session.user?.name ?? userId}</p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button type="submit">Sign out</button>
      </form>

      <h2>GitHub installations</h2>
      {installations.length === 0 ? (
        <p>
          No repos connected yet.{" "}
          {installUrl ? (
            <a href={installUrl}>Install the GitHub App</a>
          ) : (
            "GITHUB_APP_SLUG isn't configured — set it in .env to enable the install link."
          )}
        </p>
      ) : (
        <>
          <ul>
            {installations.map((installation) => (
              <li key={installation.id}>
                {installation.accountLogin} ({installation.accountType})
              </li>
            ))}
          </ul>
          {installUrl ? <a href={installUrl}>Manage / install on more repos</a> : null}
        </>
      )}
    </main>
  );
}
