# Deplyx — Project Status

One-glance answer to "where are we at." Detailed phase-by-phase specs and decision logs live in
[`docs/plans/`](docs/plans/00-ROADMAP.md); this file is the fast summary, kept current at the end
of every phase.

**Last updated:** 2026-08-01

## Right now

**Phase 03 (Auth.js + GitHub App) — code complete, live acceptance pending.**

Auth.js v5 wired (GitHub OAuth login, `DrizzleAdapter` through `workerDb()`), `packages/github`
(App auth, token minting, repo listing, webhook signature verification), install callback + webhook
routes, minimal `/login` + `/dashboard` pages. `pnpm lint && pnpm typecheck && pnpm test` all green
workspace-wide. Nothing has been run against live infra yet — the three acceptance criteria (real
GitHub login, App install, App uninstall) and the new `removed_at` migration need the user's real
Neon + GitHub App/OAuth App credentials. See [**Next action**](#next-action).

## Phase status

| # | Phase | Status |
|---|---|---|
| 01 | Monorepo + tooling | ✅ done |
| 02 | DB schema + RLS | ✅ done |
| 03 | Auth.js + GitHub App | 🟡 code complete, live acceptance pending |
| 04 | Trigger.dev + feed-poll | ⬜ not started |
| 05 | Scanner + findings | ⬜ not started |
| 06 | Read-only dashboard — **Milestone 1** | ⬜ not started |
| 07 | BYOK provider keys | ⬜ not started |
| 08 | LLM fix generation | ⬜ not started |
| 09 | Diff review UI | ⬜ not started |
| 10 | PR creation | ⬜ not started |
| 11 | Package detector | ⬜ not started |
| 12 | Auto-merge + deploy hardening | ⬜ not started |

Full detail, acceptance criteria, and per-phase decision logs: [`docs/plans/00-ROADMAP.md`](docs/plans/00-ROADMAP.md).

## Next action

Before Phase 03 can flip to fully done:

1. Fill in `.env`'s real values — `DATABASE_URL`/`APP_DATABASE_URL` (see the two corrections noted
   in Phase 02's file if starting from an old copy), plus this phase's new vars: `AUTH_SECRET`,
   `AUTH_URL`, `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` (OAuth App), `GITHUB_APP_ID`/`GITHUB_APP_SLUG`/
   `GITHUB_APP_PRIVATE_KEY`/`GITHUB_APP_WEBHOOK_SECRET` (GitHub App). Registration steps for both:
   [`README.md`](README.md#github-app--auth-setup-phase-03).
2. `pnpm db:migrate` — picks up `0001_true_sage.sql` (`removed_at` on `github_installations` and
   `repositories`), not yet applied to the live Neon project.
3. `pnpm dev`, then run the three live acceptance checks in
   [`docs/plans/03-auth-github-app.md`](docs/plans/03-auth-github-app.md#acceptance): login creates
   a `users` row, installing the App creates `github_installations`/`repositories` rows, uninstalling
   fires the webhook and marks them removed.

Then Phase 04 (Trigger.dev + feed-poll) can start any time.

## What exists today

- **Tooling** (Phase 01): pnpm/Turborepo workspace, Biome, Vitest, TypeScript 5.9.3 pinned,
  `packages/shared` with zod env validation.
- **`@deplyx/db`** (Phase 02, extended Phase 03): full Drizzle schema for all 8 product tables plus
  the 3 Auth.js adapter tables; RLS policy + `FORCE ROW LEVEL SECURITY` on every tenant table,
  fail-closed (`current_setting('app.user_id', true)`, not fail-open); `withTenant()` — the only way
  to get a scoped query handle, a branded type nothing else can construct; `workerDb()` for the
  deliberately cross-tenant path (now 3 vetted call sites, see Phase 03's decision log);
  `transitionFix()` as the fix-status FSM's single conditional-UPDATE writer; an RLS isolation test
  suite proving the boundary is real Postgres RLS, not app-level filtering — run 4/4 green against
  the live Neon project 2026-07-30, currently skips cleanly without `.env` (env-gated). `removed_at`
  soft-delete columns added to `github_installations`/`repositories` in migration `0001` — not yet
  applied live.
- **`computeSeverity()`** (`packages/shared`): the D2 date-ladder + no-replacement-bump severity
  scorer, pure and unit-tested with a frozen clock.
- **Public landing page** (`apps/web/src/app/page.tsx`, out-of-sequence — built ahead of Phase 06,
  logged in `docs/plans/01-monorepo-tooling.md`): marketing homepage at `/`, separate from the
  future `(dashboard)` route group. Adds `lenis` outside the catalog-pinning convention — noted,
  not yet reconciled.
- **`@deplyx/github`** (Phase 03, new package): `App` auth wrapper (`@octokit/app` composed with
  `@octokit/rest`'s Octokit for typed REST + pagination), `mintInstallationToken()` (never cached),
  `listInstallationRepositories()`, `getInstallationAccount()`, webhook signature verification —
  unit-tested against the real `@octokit/webhooks` sign/verify contract.
- **Auth.js v5** (Phase 03): GitHub OAuth login, `DrizzleAdapter` wired through `workerDb()` (the
  adapter tables' only legal access path), `session.user.id` threaded through explicitly for
  database-strategy sessions. Install callback (`/api/github/callback`) and webhook handler
  (`/api/github/webhooks`, all 4 installation/repo events) both live, plus minimal unstyled
  `/login` and `/dashboard` pages — real dashboard UI is still Phase 06's job.

## Known gaps / deliberately deferred

- Live acceptance for Phase 03 not yet run (see Next action above) — needs the user's real
  credentials and a browser session, same pattern as Phase 02's live verification.
- `provider_keys` encryption (Phase 07) — only the `bytea` column exists so far, no crypto.
- Root `README.md` gained a scoped Phase 03 setup section but is still not the full Phase-06 guide;
  DB role/migration steps aren't documented there yet (per the working agreement in
  `docs/plans/00-ROADMAP.md`).
- A previously-undetected Turbopack + monorepo-raw-TS-source resolution gap was found and fixed this
  phase (internal relative imports across `packages/db`/`shared`/`github` switched from
  `.js`-suffixed to extensionless) — full writeup in `docs/plans/03-auth-github-app.md`'s Decisions
  made, since it touches already-shipped Phase 01/02 code.
