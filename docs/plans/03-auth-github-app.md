# Phase 03 — Auth.js + GitHub App

Status: code complete, live acceptance pending    Updated: 2026-08-01

## Goal

Users can log in with GitHub, install the Deplyx GitHub App on selected repos, and have that installation + its repos land in the DB under RLS. No token is ever persisted — only `installation_id`.

## Depends on

02 (schema, RLS, tenant helpers).

## Tasks

- [x] Register/confirm the GitHub App (permissions: `contents: write`, `pull_requests: write`, `metadata: read`; webhook events: `installation`, `installation_repositories`); document exact steps in README (D8 — infra exists, but README must let a stranger redo this) — README section written; actual App/OAuth App registration on GitHub's side is the user's to do (needs a real GitHub account), not something this session can perform
- [x] `next-auth@5.0.0-beta.32` + `@auth/drizzle-adapter` config (`apps/web/src/auth.ts`) — GitHub OAuth provider for login (separate from the GitHub App identity)
- [x] `packages/github`: Octokit App auth wrapper — `@octokit/app` instance from `GITHUB_APP_ID` + `GITHUB_APP_PRIVATE_KEY`, `mintInstallationToken(installationId)` that calls the API fresh every time, never caches to disk/DB (decision #15 — in-memory only, single call scope)
- [x] "Install on selected repos" entry point — link to `https://github.com/apps/<app-slug>/installations/new`
- [x] `apps/web/src/app/api/github/callback/route.ts` — GitHub App install callback (`installation_id`, `setup_action` query params), links installation to logged-in user via `withTenant`
- [x] `apps/web/src/app/api/github/webhooks/route.ts` — `@octokit/webhooks` signature verification (HMAC, `GITHUB_APP_WEBHOOK_SECRET` — the task list's `GITHUB_WEBHOOK_SECRET` was a naming slip against the var `packages/shared/src/env.ts` actually defines), handlers:
  - `installation.created` → upsert `github_installations`
  - `installation.deleted` → mark installation removed, cascade-mark its repos
  - `installation_repositories.added/removed` → sync `repositories`
- [x] Repo sync helper: given an `installation_id`, mint a token, `GET /installation/repositories`, upsert into `repositories` (owner, name, github_repo_id, default_branch, private)
- [x] Session → tenant bridge: every request-path DB call resolves `session.user.id` and passes it into `withTenant` (`apps/web/src/lib/session.ts`'s `requireUserId()`)

## Acceptance

Code is done and `pnpm lint && pnpm typecheck && pnpm test` are green (see Decisions made). The three
criteria below are all live/manual, need a real registered GitHub App + OAuth App and a real browser
login — same shape as Phase 02's live Neon verification — and are **not yet run**:

- [ ] Logging in with a real GitHub account creates a `users` row.
- [ ] Installing the App on one test repo creates a `github_installations` row and a `repositories` row, with zero installation tokens anywhere in the DB (grep migration + a live row dump to confirm no token column exists at all).
- [ ] Uninstalling the App fires the webhook and the installation/repo rows reflect removal.

## Deferred out

- Actual scanning of the synced repos (Phase 05).
- Multi-org installations UI polish — functional sync only.

## Decisions made

- **`workerDb()`'s BYPASSRLS allowlist widened from 1 call site to 3** (decided with the user before
  writing any code). Auth.js's adapter tables (`accounts`/`sessions`/`verification_tokens`) have
  zero grants to `deplyx_app` and no RLS policies at all; `users` itself needs a bypass at
  account-creation time too, since there's no `app.user_id` yet to scope by. The GitHub webhook
  handler has the identical problem from a different angle: it runs with no Deplyx session, so it
  must resolve an installation's owning `user_id` (or correlate a GitHub account id via `accounts`)
  before it can open a scoped `withTenant` transaction. Considered a second, parallel BYPASSRLS
  client (`@deplyx/db/admin`) to keep `workerDb()`'s "trigger tasks only" framing absolute — rejected
  as needless duplication: same credential, same trust level, and a second near-identical client
  makes the boundary *harder* to audit, not easier. Instead: `apps/web/src/auth.ts` and
  `apps/web/src/app/api/github/webhooks/route.ts` were added to the existing Biome
  `noRestrictedImports` override's exception list (`biome.json`), `workerDb()`'s docstring
  (`packages/db/src/worker.ts`) now names all three call sites, and root `CLAUDE.md` was updated to
  match. New cross-tenant lookup helpers (`findUserIdByGithubAccount`, `findInstallationOwner`) live
  in `packages/db/src/queries/admin.ts`, re-exported from `@deplyx/db/worker` — not the main
  `@deplyx/db` barrel — since they only do anything useful given a `WorkerDb`-typed client, which
  nothing outside the vetted call sites can construct anyway.
- **`github_installations`/`repositories` gained a `removed_at` column each** (migration
  `0001_true_sage.sql`) — a real gap found mid-implementation, not something the original task list
  anticipated. Neither table had any way to represent "this GitHub App installation was
  uninstalled": `github_installations` only had `suspended_at` (a different event), and
  `repositories → scans → findings → fixes` all cascade-delete on the existing FK chain, so a literal
  `DELETE` on `installation.deleted` would have silently wiped a repo's entire scan/finding/fix
  history on a routine uninstall/reinstall — directly contradicting the frozen "findings are
  soft-resolved, never deleted" principle (decision #7). Raised to the user with three options
  (add the column / hard-delete and accept the loss / defer uninstall handling to a later phase);
  user chose to add the column. Soft-marked on `installation.deleted` (cascades in application code
  to every repo under that installation) and on `installation_repositories.removed` (single repo).
  List query helpers (`listGithubInstallations`, `listRepositories`) now filter `removed_at IS NULL`
  by default. **Not yet run against the live Neon project** — `pnpm db:migrate` needs the user's real
  `.env`, same as every other live-DB step in this phase.
- **Every internal relative import across `packages/db`, `packages/shared`, and `packages/github`
  changed from `.js`-suffixed to extensionless** (e.g. `./schema/index.js` → `./schema/index`) — a
  real, previously-undetected bug, not a style change. This is the *first* time any of these
  packages' barrel exports (`@deplyx/db`'s root `"."` entry specifically) were actually imported
  from `apps/web` and run through Turbopack; Phase 01/02 never exercised this path; only leaf
  subpath imports (`@deplyx/shared/env`) had been used before. Confirmed via a real `pnpm dev` +
  browser check (not assumed): Turbopack has no `.js → .ts` fallback for exact-extension specifiers
  (only `resolveExtensions`, which applies to *extensionless* imports), and `resolveAlias` can't do
  a wildcard rewrite — so every `export * from "./foo.js"` inside these packages failed to resolve
  the moment `apps/web/src/auth.ts` pulled in `@deplyx/db`'s barrel. `tsc` (moduleResolution:
  "Bundler"), `tsx` (the scripts runner), and `vitest` all resolve extensionless imports exactly as
  well as `.js`-suffixed ones — confirmed by re-running `pnpm lint && pnpm typecheck && pnpm test`
  workspace-wide after the change, all green, RLS suite still skips cleanly with no `.env` present.
  This touches Phase 01/02 code that was already flipped to done and live-verified; raised here
  rather than silently absorbed, per the project's own working agreement.
- **`getInstallationAccount()` re-fetches installation account info via the GitHub API**
  (`packages/github/src/installations.ts`) rather than trusting the webhook payload's own
  `installation.account` field, and is called from *both* the install callback and the
  `installation.created` webhook handler. The install callback only receives `installation_id` in
  its redirect query params (no account info at all), so it needs the API call regardless; reusing
  the same helper for the webhook path keeps account-info parsing (including the rare
  Enterprise-owned-installation case, which has no `login`/`type`) in one place instead of two.
- **`installation.created`'s owner resolution can come back empty** (App installed by a GitHub
  identity that has never logged into Deplyx) — logged via `console.warn` and skipped, not thrown.
  If the same person completes the normal install-callback flow (the common case — they're
  mid-login when they click "Install"), that route creates the row instead. A documented limitation,
  not a silent failure: someone auditing logs will see exactly why a given installation didn't sync
  immediately.
- **`DrizzleAdapter`'s second argument needed a cast** (`apps/web/src/auth.ts`) — verified against
  the installed `@auth/drizzle-adapter@1.11.3` source (not assumed): its expected table types
  (`DefaultPostgresUsersTable` etc.) are the shape of a table straight out of `pgTable()`, which
  still carries the chainable `.enableRLS()` builder method. Our schema calls `.enableRLS()` at
  definition time, and that call's return type strips the method off on purpose (so it can't be
  called twice) — a real structural mismatch for the type checker, but not a real one at runtime
  (the adapter never calls `.enableRLS()`, only reads columns). Cast through
  `Parameters<typeof DrizzleAdapter<ReturnType<typeof workerDb>>>[1]` — the adapter's own declared
  parameter type instantiated at our concrete client type, not a hand-rolled one — so it tracks
  whatever the installed package actually expects rather than drifting from it.
- **`apps/web/next.config.ts`'s `transpilePackages` gained `@deplyx/db` and `@deplyx/github`**
  alongside the existing `@deplyx/shared` entry — same reason as the original entry (both are
  consumed as raw TS source, no build step).
- **`.claude/launch.json` added** (`pnpm --filter @deplyx/web dev`, `autoPort: true`) purely as dev
  tooling so `pnpm dev` can be driven through the Browser preview tool in future sessions; not
  product code, no secrets.

## Notes / blockers

- **Nothing in this phase was run against live infra.** Everything above is verified by
  `pnpm lint && pnpm typecheck && pnpm test` (all green) and one real `pnpm dev` + browser pass
  confirming module resolution is clean and the intended fail-mode (clear env error, not a crash)
  fires correctly with no `.env` present. The three live acceptance criteria, plus running
  `pnpm db:migrate` for the `removed_at` migration, need the user's real Neon + GitHub App/OAuth App
  credentials and a real browser login — flagging rather than claiming done from static checks
  alone.
