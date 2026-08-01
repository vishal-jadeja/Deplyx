import { getGithubApp } from "./app";

/**
 * Mints a fresh installation access token on every call — never cached to
 * disk, DB, or module scope (decision #15, docs/plans/00-ROADMAP.md). Callers
 * that need the token for more than one request in the same run should hold
 * it in a local variable for that run's lifetime, not re-export it from here.
 */
export async function mintInstallationToken(installationId: number): Promise<string> {
  const app = getGithubApp();
  // `octokit.auth` is typed `unknown` here (App composes the strategy at
  // runtime via `authStrategy: createAppAuth`, not through
  // `Octokit.defaults()`, so TS can't thread the strong `AuthInterface`
  // overloads through). The `installation` auth type's real return shape
  // (verified against @octokit/auth-app's `InstallationAccessTokenAuthentication`)
  // always includes `token: string`.
  const auth = (await app.octokit.auth({ type: "installation", installationId })) as {
    token: string;
  };
  return auth.token;
}
