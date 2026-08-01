import { getEnv } from "@deplyx/shared/env";
import { App } from "@octokit/app";
import { Octokit } from "@octokit/rest";

/**
 * `@octokit/app`'s default `Octokit` is bare `@octokit/core` — no `.rest.*`
 * methods, no `.paginate`. Passing `@octokit/rest`'s `Octokit` (itself
 * `@octokit/core` plus the REST-endpoint-methods and paginate plugins,
 * verified against the installed package) gives every installation-scoped
 * client those methods, typed.
 */
type GithubApp = App<{ Octokit: typeof Octokit }>;

/**
 * Lazy singleton `App` instance — GitHub App identity (`GITHUB_APP_ID` +
 * `GITHUB_APP_PRIVATE_KEY`) plus webhook signature verification
 * (`GITHUB_APP_WEBHOOK_SECRET`). Constructed with `webhooks: { secret }`, so
 * `app.webhooks` is a ready-to-use `@octokit/webhooks` `Webhooks` instance —
 * no separate `@octokit/webhooks` dependency needed here.
 *
 * Lazy (constructed on first call, not at module import time) so importing
 * this module never throws just because the GitHub App env vars aren't set
 * yet, matching the lazy-`getEnv()` convention from `packages/db`'s clients.
 */
let app: GithubApp | undefined;

export function getGithubApp(): GithubApp {
  if (!app) {
    const env = getEnv();
    if (!env.GITHUB_APP_ID || !env.GITHUB_APP_PRIVATE_KEY || !env.GITHUB_APP_WEBHOOK_SECRET) {
      throw new Error(
        "GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, and GITHUB_APP_WEBHOOK_SECRET are all required to construct the GitHub App client.",
      );
    }
    app = new App({
      appId: env.GITHUB_APP_ID,
      privateKey: env.GITHUB_APP_PRIVATE_KEY,
      webhooks: { secret: env.GITHUB_APP_WEBHOOK_SECRET },
      Octokit,
    });
  }
  return app;
}
