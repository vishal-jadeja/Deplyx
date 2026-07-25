# Phase 03 — Auth.js + GitHub App

Status: not started    Updated: —

## Goal

Users can log in with GitHub, install the Deplyx GitHub App on selected repos, and have that installation + its repos land in the DB under RLS. No token is ever persisted — only `installation_id`.

## Depends on

02 (schema, RLS, tenant helpers).

## Tasks

- [ ] Register/confirm the GitHub App (permissions: `contents: write`, `pull_requests: write`, `metadata: read`; webhook events: `installation`, `installation_repositories`); document exact steps in README (D8 — infra exists, but README must let a stranger redo this)
- [ ] `next-auth@5.0.0-beta.32` + `@auth/drizzle-adapter` config (`apps/web/src/auth.ts`) — GitHub OAuth provider for login (separate from the GitHub App identity)
- [ ] `packages/github`: Octokit App auth wrapper — `@octokit/app` instance from `GITHUB_APP_ID` + `GITHUB_APP_PRIVATE_KEY`, `mintInstallationToken(installationId)` that calls the API fresh every time, never caches to disk/DB (decision #15 — in-memory only, single call scope)
- [ ] "Install on selected repos" entry point — link to `https://github.com/apps/<app-slug>/installations/new`
- [ ] `apps/web/src/app/api/github/callback/route.ts` — GitHub App install callback (`installation_id`, `setup_action` query params), links installation to logged-in user via `withTenant`
- [ ] `apps/web/src/app/api/github/webhooks/route.ts` — `@octokit/webhooks` signature verification (HMAC, `GITHUB_WEBHOOK_SECRET`), handlers:
  - `installation.created` → upsert `github_installations`
  - `installation.deleted` → mark installation removed, cascade-mark its repos
  - `installation_repositories.added/removed` → sync `repositories`
- [ ] Repo sync helper: given an `installation_id`, mint a token, `GET /installation/repositories`, upsert into `repositories` (owner, name, github_repo_id, default_branch, private)
- [ ] Session → tenant bridge: every request-path DB call resolves `session.user.id` and passes it into `withTenant`

## Acceptance

- Logging in with a real GitHub account creates a `users` row.
- Installing the App on one test repo creates a `github_installations` row and a `repositories` row, with zero installation tokens anywhere in the DB (grep migration + a live row dump to confirm no token column exists at all).
- Uninstalling the App fires the webhook and the installation/repo rows reflect removal.

## Deferred out

- Actual scanning of the synced repos (Phase 05).
- Multi-org installations UI polish — functional sync only.

## Decisions made

(append here during execution)

## Notes / blockers
