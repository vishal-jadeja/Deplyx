import { getGithubApp } from "./app";

export interface InstallationAccount {
  accountLogin: string;
  accountType: string;
}

/**
 * Fetches the GitHub account (org/user) an installation belongs to. Called
 * from the install callback, which only receives `installation_id` in its
 * redirect query params — not the account info itself.
 *
 * GitHub Apps can (rarely) be installed on an Enterprise account, whose
 * `account` shape has no `login`/`type` — those installations fall back to
 * `slug`/`"Enterprise"` rather than throwing, since this is metadata for
 * display, not something correctness depends on.
 */
export async function getInstallationAccount(installationId: number): Promise<InstallationAccount> {
  const app = getGithubApp();
  const { data } = await app.octokit.rest.apps.getInstallation({ installation_id: installationId });
  const account = data.account;
  if (account && "login" in account) {
    return { accountLogin: account.login ?? "unknown", accountType: account.type };
  }
  if (account && "slug" in account) {
    return { accountLogin: account.slug ?? "unknown", accountType: "Enterprise" };
  }
  return { accountLogin: "unknown", accountType: "unknown" };
}
