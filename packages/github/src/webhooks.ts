import { getGithubApp } from "./app";

/**
 * The `@octokit/webhooks` `Webhooks` instance composed by the `App` above —
 * handler registration (`.on(...)`) and request verification
 * (`.verifyAndReceive(...)`) both go through this one object, so every
 * consumer shares the same instance instead of each constructing its own.
 */
export function getGithubWebhooks() {
  return getGithubApp().webhooks;
}
